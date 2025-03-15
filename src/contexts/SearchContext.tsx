import React, { createContext, useContext, ReactNode, useState, useMemo, useCallback, useEffect } from 'react';
import { FilterType, SearchState, User, File, TextResult, SearchHistoryItem } from '../types';
import { useDebounce } from '../utils/hooks';
import { allFileResults, allTextResults, allUserResults } from '../data';
import Fuse from 'fuse.js';
import { 
  userFuseOptions, 
  fileFuseOptions, 
  textFuseOptions, 
  loadSearchHistory, 
  saveSearchHistory, 
  addToSearchHistory 
} from '../utils/searchUtils';
import { highlightFuseMatches } from '../utils/highlightUtils';

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
  submitSearch: () => {},
});

interface SearchProviderProps {
  children: ReactNode;
}

// Initialize Fuse instances
const userFuse = new Fuse(allUserResults, userFuseOptions);
const fileFuse = new Fuse(allFileResults, fileFuseOptions);
const textFuse = new Fuse(allTextResults, textFuseOptions);

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(loadSearchHistory);
  const [showHistory, setShowHistory] = useState(false);
  
  // Apply debouncing to search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Remove the automatic history addition on debouncedSearchQuery change
  // Instead, we'll expose a submitSearch function for explicit submission

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

  // Function to explicitly submit search and add to history
  const submitSearch = useCallback(() => {
    if (searchQuery && searchQuery.trim() !== '') {
      setSearchHistory(prevHistory => 
        addToSearchHistory(searchQuery, prevHistory)
      );
    }
  }, [searchQuery]);

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
    submitSearch,
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
    toggleSearchHistory,
    submitSearch
  ]);

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

// Custom hook for consuming the search context
export const useSearch = (): SearchState => useContext(SearchContext); 