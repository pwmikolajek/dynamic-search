import React, { forwardRef, InputHTMLAttributes } from "react";
import { SearchIcon, Loader2Icon, ClockIcon } from "lucide-react";
import { Input } from "./input";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  isLoading?: boolean;
  resultsCount?: number;
  showHistoryButton?: boolean;
  onHistoryButtonClick?: (e: React.MouseEvent) => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    isLoading = false, 
    resultsCount, 
    showHistoryButton = false,
    onHistoryButtonClick,
    ...props 
  }, ref) => {
    return (
      <div className="flex items-center px-[11.55px] h-[42px] relative self-stretch w-full flex-[0_0_auto] mt-[-0.58px] ml-[-0.58px] mr-[-0.58px] rounded-[7.7px] border-[1.16px] border-solid border-[#ebebeb]">
        <div className="flex items-center gap-[11.55px] w-full">
          {isLoading ? (
            <Loader2Icon className="w-[18.49px] h-[18.49px] text-gray-500 flex-shrink-0 animate-spin" />
          ) : (
            <SearchIcon className="w-[18.49px] h-[18.49px] text-gray-500 flex-shrink-0" />
          )}
          <Input
            ref={ref}
            type="text"
            className="flex-1 border-none p-0 text-[13.9px] tracking-[0.42px] font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none shadow-none focus:shadow-none"
            {...props}
          />
          {resultsCount !== undefined && resultsCount > 0 && (
            <div className="text-[10.8px] text-gray-500">
              {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
            </div>
          )}
          {showHistoryButton && (
            <button
              className="text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
              onClick={onHistoryButtonClick}
              aria-label="Show search history"
            >
              <ClockIcon className="w-[14px] h-[14px]" />
            </button>
          )}
        </div>
      </div>
    );
  }
); 