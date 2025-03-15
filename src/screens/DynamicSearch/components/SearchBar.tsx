import React, { useCallback, useEffect, useRef } from "react";
import { SearchInput } from "../../../components/ui/search-input";
import { SearchHistory } from "../../../components/ui/search-history";
import { useSearch } from "../../../contexts/SearchContext";

export const SearchBar: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    isLoading, 
    selectNextItem, 
    selectPrevItem, 
    hasSelectedItem, 
    totalResultsCount,
    selectedItemIndex,
    searchHistory,
    showHistory,
    setShowHistory,
    removeFromHistory,
    clearSearchHistory,
    submitSearch
  } = useSearch();

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle navigation when we have search results
      if (totalResultsCount === 0) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault(); // Prevent scrolling
        selectNextItem();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault(); // Prevent scrolling
        selectPrevItem();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectNextItem, selectPrevItem, totalResultsCount]);

  // Handle clicking outside to close history dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowHistory]);

  // Memoize handlers
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  const handleSelectHistoryItem = useCallback((query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleRemoveHistoryItem = useCallback((query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromHistory(query);
  }, [removeFromHistory]);

  const handleHistoryButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHistory(true);
  }, [setShowHistory]);

  // Handle key press in search input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // When Enter key is pressed, add the search to history
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      submitSearch();
    }
  }, [searchQuery, submitSearch]);

  return (
    <div 
      ref={searchContainerRef}
      className="relative flex flex-col w-full"
    >
      <SearchInput
        value={searchQuery}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        aria-label="Search"
        aria-autocomplete="list"
        aria-controls="search-results"
        aria-expanded={totalResultsCount > 0}
        aria-activedescendant={hasSelectedItem ? `result-item-${selectedItemIndex}` : undefined}
        isLoading={isLoading}
        resultsCount={totalResultsCount > 0 ? totalResultsCount : undefined}
        showHistoryButton={searchHistory.length > 0 && !searchQuery}
        onHistoryButtonClick={handleHistoryButtonClick}
        onFocus={() => setShowHistory(true)}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Search History Dropdown */}
      {showHistory && searchHistory.length > 0 && (
        <SearchHistory
          searchHistory={searchHistory}
          onSelectHistoryItem={handleSelectHistoryItem}
          onRemoveHistoryItem={handleRemoveHistoryItem}
          onClearHistory={clearSearchHistory}
        />
      )}
    </div>
  );
};