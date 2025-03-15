import React, { useMemo, useCallback } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { FilterButtons } from "./components/FilterButtons";
import { FilesSection } from "./components/FilesSection";
import { SearchBar } from "./components/SearchBar";
import { TextSection } from "./components/TextSection";
import { UsersSection } from "./components/UsersSection";
import { useSearch } from "../../contexts/SearchContext";
import { FilterType } from "../../types";

export const DynamicSearch = (): JSX.Element => {
  const { 
    activeFilters,
    userResults,
    fileResults,
    textResults,
    isLoading,
    totalResultsCount,
    searchQuery
  } = useSearch();

  const hasResults = userResults.length > 0 || fileResults.length > 0 || textResults.length > 0;
  const showAllSections = activeFilters.length === 0;

  const shouldShowSection = useCallback((type: FilterType): boolean => {
    return showAllSections || activeFilters.includes(type);
  }, [showAllSections, activeFilters]);

  // Memoize this calculation to avoid recalculating on every render
  const lastVisibleSection = useMemo(() => {
    const sections: FilterType[] = ["users", "files", "text"];
    const visibleSections = sections.filter(section => 
      shouldShowSection(section) && 
      ((section === "users" && userResults.length > 0) ||
       (section === "files" && fileResults.length > 0) ||
       (section === "text" && textResults.length > 0))
    );
    return visibleSections[visibleSections.length - 1] || null;
  }, [shouldShowSection, userResults.length, fileResults.length, textResults.length]);

  // Memoized section class names to avoid recalculating styles on every render
  const getSectionClassName = useCallback((type: FilterType): string => {
    const isVisible = shouldShowSection(type);
    // Only consider a section truly visible if it has results
    const hasContent = 
      (type === "users" && userResults.length > 0) ||
      (type === "files" && fileResults.length > 0) ||
      (type === "text" && textResults.length > 0);
    
    // Don't show section at all if it has no content
    if (isVisible && !hasContent) {
      return "hidden";
    }
    
    const isLastVisible = type === lastVisibleSection;
    
    return `
      transition-all duration-300 ease-in-out origin-top
      ${isVisible && hasContent ? 'opacity-100 max-h-96 scale-y-100' : 'opacity-0 max-h-0 scale-y-0'}
      ${isVisible && hasContent && !isLastVisible ? 'mb-3' : 'mb-0'}
      overflow-hidden
    `;
  }, [shouldShowSection, lastVisibleSection, userResults.length, fileResults.length, textResults.length]);
  
  // Memoized results container class to avoid recalculating on every render
  const resultsContainerClass = useMemo(() => `
    w-full transition-all duration-300 ease-in-out
    ${hasResults ? 'mt-5 opacity-100' : 'mt-0 opacity-0 h-0'}
    overflow-hidden
  `, [hasResults]);

  // Memoized results wrapper class to avoid recalculating on every render
  const resultsWrapperClass = useMemo(() => `
    transform-gpu transition-all duration-300 ease-in-out
    ${hasResults ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
  `, [hasResults]);

  return (
    <div className="bg-[#e6ebf3] flex flex-row justify-center w-full">
      <div className="bg-[#e6ebf3] w-full max-w-[970px] h-screen flex items-start justify-center pt-32">
        <div className="relative w-full max-w-2xl">
          <Card 
            className={`
              w-full flex flex-col items-start bg-neutral-50 rounded-xl border-none
              shadow-[0px_100px_80px_0px_rgba(191,200,221,0.07),0px_41.778px_33.422px_0px_rgba(191,200,221,0.05),0px_22.336px_17.869px_0px_rgba(191,200,221,0.04),0px_12.522px_10.017px_0px_rgba(191,200,221,0.04),0px_6.65px_5.32px_0px_rgba(191,200,221,0.03),0px_2.767px_2.214px_0px_rgba(191,200,221,0.02)]
              p-8 transition-all duration-300 ease-in-out
            `}
          >
            <CardContent className="flex flex-col items-start gap-3 relative self-stretch w-full p-0">
              <SearchBar />
              <FilterButtons />
            </CardContent>

            <div 
              className={resultsContainerClass}
              id="search-results"
              role="search"
              aria-label="Search results"
              aria-live="polite"
              aria-busy={isLoading}
              aria-atomic="true"
            >
              <div className={resultsWrapperClass}>
                {isLoading ? (
                  <div className="flex justify-center items-center py-4 text-gray-500">
                    Searching...
                  </div>
                ) : hasResults ? (
                  <div className="flex flex-col">
                    <div className={getSectionClassName("users")}>
                      <UsersSection users={userResults} />
                    </div>
                    <div className={getSectionClassName("files")}>
                      <FilesSection files={fileResults} />
                    </div>
                    <div className={getSectionClassName("text")}>
                      <TextSection results={textResults} />
                    </div>
                  </div>
                ) : (
                  searchQuery && (
                    <div className="flex justify-center items-center py-4 text-gray-500">
                      No results found
                    </div>
                  )
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};