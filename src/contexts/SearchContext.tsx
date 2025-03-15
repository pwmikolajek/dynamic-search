import React, { createContext, useContext, ReactNode, useState, useMemo, useCallback, useEffect } from 'react';
import { FilterType, SearchState, User, File, TextResult } from '../types';
import { useDebounce } from '../utils/hooks';
import { allFileResults, allTextResults, allUserResults } from '../data';
import { highlightText, textContainsQuery } from '../utils/textUtils';

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
});

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  
  // Apply debouncing to search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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

  // Memoized filter function for better performance
  const filterResults = useCallback((query: string) => {
    if (!query) {
      return {
        userResults: [],
        fileResults: [],
        textResults: [],
      };
    }

    const lowerQuery = query.toLowerCase().trim();
    
    const filteredUsers = allUserResults.filter(user => 
      textContainsQuery(user.name, lowerQuery) || 
      textContainsQuery(user.role, lowerQuery)
    ).map(user => ({
      ...user,
      nameParts: highlightText(user.name, lowerQuery),
      roleParts: highlightText(user.role, lowerQuery),
    }));

    const filteredFiles = allFileResults.filter(file => 
      textContainsQuery(file.name, lowerQuery) || 
      textContainsQuery(file.type, lowerQuery)
    ).map(file => ({
      ...file,
      nameParts: highlightText(file.name, lowerQuery),
      typeParts: highlightText(file.type, lowerQuery),
    }));

    const filteredTexts = allTextResults.filter(item => 
      textContainsQuery(item.text, lowerQuery)
    ).map(item => ({
      ...item,
      textParts: highlightText(item.text, lowerQuery),
    }));

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
    setSearchQuery,
    setActiveFilters,
    isLoading,
    selectedItemIndex,
    setSelectedItemIndex,
    totalResultsCount,
    selectNextItem,
    selectPrevItem,
    hasSelectedItem,
  }), [
    searchQuery, 
    activeFilters, 
    userResults, 
    fileResults, 
    textResults,
    isLoading,
    selectedItemIndex,
    totalResultsCount,
    selectNextItem,
    selectPrevItem,
    hasSelectedItem
  ]);

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

// Custom hook for consuming the search context
export const useSearch = (): SearchState => useContext(SearchContext); 