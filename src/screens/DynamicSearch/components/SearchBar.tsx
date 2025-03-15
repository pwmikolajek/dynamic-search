import { SearchIcon, Loader2Icon, ClockIcon, XIcon } from "lucide-react";
import React, { useCallback, useEffect, useRef } from "react";
import { Input } from "../../../components/ui/input";
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
    clearSearchHistory
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

  // Memoize the onChange handler to prevent recreation on each render
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  // Handle selecting a history item
  const handleSelectHistoryItem = useCallback((query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery(query);
  }, [setSearchQuery]);

  // Handle removing a history item
  const handleRemoveHistoryItem = useCallback((query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromHistory(query);
  }, [removeFromHistory]);

  // Format the timestamp
  const formatTimestamp = useCallback((timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  return (
    <div 
      ref={searchContainerRef}
      className="relative flex flex-col w-full"
    >
      <div className="flex items-center px-[11.55px] h-[42px] relative self-stretch w-full flex-[0_0_auto] mt-[-0.58px] ml-[-0.58px] mr-[-0.58px] rounded-[7.7px] border-[1.16px] border-solid border-[#ebebeb]">
        <div className="flex items-center gap-[11.55px] w-full">
          {isLoading ? (
            <Loader2Icon className="w-[18.49px] h-[18.49px] text-gray-500 flex-shrink-0 animate-spin" />
          ) : (
            <SearchIcon className="w-[18.49px] h-[18.49px] text-gray-500 flex-shrink-0" />
          )}
          <Input
            type="text"
            value={searchQuery}
            onChange={handleChange}
            placeholder="Search..."
            aria-label="Search"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-expanded={totalResultsCount > 0}
            aria-activedescendant={hasSelectedItem ? `result-item-${selectedItemIndex}` : undefined}
            className="flex-1 border-none p-0 text-[13.9px] tracking-[0.42px] font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none shadow-none focus:shadow-none"
            onFocus={() => setShowHistory(true)}
            onClick={(e) => e.stopPropagation()}
          />
          {searchQuery && totalResultsCount > 0 && (
            <div className="text-[10.8px] text-gray-500">
              {totalResultsCount} {totalResultsCount === 1 ? 'result' : 'results'}
            </div>
          )}
          {searchHistory.length > 0 && !searchQuery && (
            <button
              className="text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowHistory(true);
              }}
              aria-label="Show search history"
            >
              <ClockIcon className="w-[14px] h-[14px]" />
            </button>
          )}
        </div>
      </div>

      {/* Search History Dropdown */}
      {showHistory && searchHistory.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white z-10 rounded-md shadow-lg border border-gray-200 max-h-[250px] overflow-y-auto">
          <div className="flex items-center justify-between p-2 border-b border-gray-100">
            <span className="text-[12px] text-gray-500 font-medium">Recent Searches</span>
            <button 
              className="text-gray-400 hover:text-gray-600 text-[12px]"
              onClick={clearSearchHistory}
            >
              Clear all
            </button>
          </div>
          <ul className="py-1">
            {searchHistory.map((item) => (
              <li 
                key={item.query} 
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={(e) => handleSelectHistoryItem(item.query, e)}
              >
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-[13px]">{item.query}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[11px] text-gray-400 mr-2">
                    {formatTimestamp(item.timestamp)}
                  </span>
                  <button
                    className="text-gray-400 hover:text-gray-600 p-1"
                    onClick={(e) => handleRemoveHistoryItem(item.query, e)}
                    aria-label={`Remove ${item.query} from history`}
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};