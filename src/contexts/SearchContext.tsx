import React, { createContext, useContext, ReactNode, useState, useMemo, useCallback, useEffect } from 'react';
import { FilterType, SearchState, User, File, TextResult, TextPart, SearchHistoryItem } from '../types';
import { useDebounce } from '../utils/hooks';
import { allFileResults, allTextResults, allUserResults } from '../data';
import { highlightText } from '../utils/textUtils';
import Fuse from 'fuse.js';

// Maximum number of history items to keep
const MAX_HISTORY_ITEMS = 5;

// Local storage key for search history
const SEARCH_HISTORY_STORAGE_KEY = 'dynamicSearchHistory';

// Fuse.js options for each data type
const userFuseOptions = {
  keys: ['name', 'role'],
  threshold: 0.4, // Lower threshold means more strict matching
  includeScore: true, // Include the score in the result
  includeMatches: true, // Include the matched indices for highlighting
  shouldSort: true, // Sort by score
};

const fileFuseOptions = {
  keys: ['name', 'type'],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  shouldSort: true,
};

const textFuseOptions = {
  keys: ['text'],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  shouldSort: true,
};

// Create the context with a default empty value
const SearchContext = createContext<SearchState>({
  searchQuery: '',
  activeFilters: [],
  userResults: [],
  fileResults: [],
  textResults: [],
  setSearchQuery: () => {},
  setActiveFilters: () => {},
  isLoading: false,
  selectedItemIndex: -1,
  setSelectedItemIndex: () => {},
  totalResultsCount: 0,
  selectNextItem: () => {},
  selectPrevItem: () => {},
  hasSelectedItem: false,
  searchHistory: [],
  clearSearchHistory: () => {},
  removeFromHistory: () => {},
  showHistory: false,
  setShowHistory: () => {},
});

interface SearchProviderProps {
  children: ReactNode;
}

// Helper function to load search history from localStorage
const loadSearchHistory = (): SearchHistoryItem[] => {
  try {
    const savedHistory = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    if (savedHistory) {
      return JSON.parse(savedHistory);
    }
  } catch (error) {
    console.error('Error loading search history:', error);
  }
  return [];
};

// Helper function to save search history to localStorage
const saveSearchHistory = (history: SearchHistoryItem[]): void => {
  try {
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving search history:', error);
  }
};

// Initialize Fuse instances
const userFuse = new Fuse(allUserResults, userFuseOptions);
const fileFuse = new Fuse(allFileResults, fileFuseOptions);
const textFuse = new Fuse(allTextResults, textFuseOptions);

// Utility function to highlight matches from Fuse.js results
const highlightFuseMatches = (text: string, matches: any[] | undefined): TextPart[] => {
  if (!matches || matches.length === 0) return [{ text, highlight: false }];
  
  // Sort matches by indices to ensure proper order
  const sortedMatches = [...matches].sort((a, b) => a.indices[0][0] - b.indices[0][0]);
  
  const parts: TextPart[] = [];
  let lastIndex = 0;
  
  sortedMatches.forEach(match => {
    match.indices.forEach((indexPair: number[]) => {
      const [start, end] = indexPair;
      
      // Add non-highlighted text before match
      if (start > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, start),
          highlight: false,
        });
      }
      
      // Add highlighted text
      parts.push({
        text: text.substring(start, end + 1),
        highlight: true,
      });
      
      lastIndex = end + 1;
    });
  });
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      highlight: false,
    });
  }
  
  return parts;
};

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(loadSearchHistory);
  const [showHistory, setShowHistory] = useState(false);
  
  // Apply debouncing to search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Add search to history when a search is performed
  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery.trim() !== '') {
      // Don't add duplicates, instead update the timestamp
      setSearchHistory(prevHistory => {
        const query = debouncedSearchQuery.trim();
        const existingIndex = prevHistory.findIndex(item => item.query.toLowerCase() === query.toLowerCase());
        
        if (existingIndex !== -1) {
          // Remove the existing item to add it to the top
          const updatedHistory = [...prevHistory];
          updatedHistory.splice(existingIndex, 1);
          
          // Add to the beginning with updated timestamp
          const newHistory = [
            { query, timestamp: Date.now() },
            ...updatedHistory
          ];
          
          saveSearchHistory(newHistory);
          return newHistory;
        } else {
          // Add new item and limit the history length
          const newHistory = [
            { query, timestamp: Date.now() },
            ...prevHistory
          ].slice(0, MAX_HISTORY_ITEMS);
          
          saveSearchHistory(newHistory);
          return newHistory;
        }
      });
    }
  }, [debouncedSearchQuery]);

  // Simulate loading state when search query changes
  useEffect(() => {
    if (searchQuery) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [searchQuery]);

  // Reset selected item when search query or filters change
  useEffect(() => {
    setSelectedItemIndex(-1);
  }, [debouncedSearchQuery, activeFilters]);

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showHistory) {
        setShowHistory(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showHistory]);

  // Function to clear all search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    saveSearchHistory([]);
  }, []);

  // Function to remove a specific item from history
  const removeFromHistory = useCallback((query: string) => {
    setSearchHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.query !== query);
      saveSearchHistory(newHistory);
      return newHistory;
    });
  }, []);

  // Handle setting search query with history control
  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setShowHistory(false);
  }, []);

  // Toggle history visibility on search input focus/click
  const toggleSearchHistory = useCallback((e: React.MouseEvent | boolean) => {
    if (typeof e === 'boolean') {
      setShowHistory(e);
    } else {
      // Stop propagation to prevent the outside click handler from firing
      e.stopPropagation();
      setShowHistory(prev => !prev);
    }
  }, []);

  // Memoized filter function using Fuse.js for better performance and fuzzy matching
  const filterResults = useCallback((query: string) => {
    if (!query) {
      return {
        userResults: [],
        fileResults: [],
        textResults: [],
      };
    }

    // Use Fuse.js to search users
    const userSearchResults = userFuse.search(query);
    const filteredUsers = userSearchResults.map(result => {
      const user = result.item;
      const matches = result.matches;
      
      return {
        ...user,
        nameParts: highlightFuseMatches(user.name, 
          matches?.filter(match => match.key === 'name')),
        roleParts: highlightFuseMatches(user.role, 
          matches?.filter(match => match.key === 'role')),
      };
    });

    // Use Fuse.js to search files
    const fileSearchResults = fileFuse.search(query);
    const filteredFiles = fileSearchResults.map(result => {
      const file = result.item;
      const matches = result.matches;
      
      return {
        ...file,
        nameParts: highlightFuseMatches(file.name, 
          matches?.filter(match => match.key === 'name')),
        typeParts: highlightFuseMatches(file.type, 
          matches?.filter(match => match.key === 'type')),
      };
    });

    // Use Fuse.js to search text
    const textSearchResults = textFuse.search(query);
    const filteredTexts = textSearchResults.map(result => {
      const textItem = result.item;
      const matches = result.matches;
      
      return {
        ...textItem,
        textParts: highlightFuseMatches(textItem.text, 
          matches?.filter(match => match.key === 'text')),
      };
    });

    return {
      userResults: filteredUsers,
      fileResults: filteredFiles,
      textResults: filteredTexts,
    };
  }, []);

  // Filter and highlight results based on debounced search query
  const { userResults, fileResults, textResults } = useMemo(() => 
    filterResults(debouncedSearchQuery)
  , [debouncedSearchQuery, filterResults]);

  // Calculate total results count
  const totalResultsCount = useMemo(() => 
    userResults.length + fileResults.length + textResults.length,
  [userResults, fileResults, textResults]);

  // Check if we have a selected item
  const hasSelectedItem = selectedItemIndex >= 0 && selectedItemIndex < totalResultsCount;

  // Logic to select next item
  const selectNextItem = useCallback(() => {
    if (totalResultsCount === 0) return;
    setSelectedItemIndex(prev => {
      if (prev >= totalResultsCount - 1) return 0;
      return prev + 1;
    });
  }, [totalResultsCount]);

  // Logic to select previous item
  const selectPrevItem = useCallback(() => {
    if (totalResultsCount === 0) return;
    setSelectedItemIndex(prev => {
      if (prev <= 0) return totalResultsCount - 1;
      return prev - 1;
    });
  }, [totalResultsCount]);

  // Create memoized context value
  const contextValue = useMemo(() => ({
    searchQuery,
    activeFilters,
    userResults,
    fileResults,
    textResults,
    setSearchQuery: handleSetSearchQuery,
    setActiveFilters,
    isLoading,
    selectedItemIndex,
    setSelectedItemIndex,
    totalResultsCount,
    selectNextItem,
    selectPrevItem,
    hasSelectedItem,
    searchHistory,
    clearSearchHistory,
    removeFromHistory,
    showHistory,
    setShowHistory: toggleSearchHistory,
  }), [
    searchQuery, 
    activeFilters, 
    userResults, 
    fileResults, 
    textResults,
    handleSetSearchQuery,
    isLoading,
    selectedItemIndex,
    totalResultsCount,
    selectNextItem,
    selectPrevItem,
    hasSelectedItem,
    searchHistory,
    clearSearchHistory,
    removeFromHistory,
    showHistory,
    toggleSearchHistory
  ]);

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

// Custom hook for consuming the search context
export const useSearch = (): SearchState => useContext(SearchContext); 