import { SearchIcon, Loader2Icon } from "lucide-react";
import React, { useCallback, useEffect } from "react";
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
    selectedItemIndex
  } = useSearch();

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

  // Memoize the onChange handler to prevent recreation on each render
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  return (
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
        />
        {searchQuery && totalResultsCount > 0 && (
          <div className="text-[10.8px] text-gray-500">
            {totalResultsCount} {totalResultsCount === 1 ? 'result' : 'results'}
          </div>
        )}
      </div>
    </div>
  );
};