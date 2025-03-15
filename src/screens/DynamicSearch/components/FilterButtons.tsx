import {
  AlignLeftIcon,
  FileTextIcon,
  MoreVerticalIcon,
  UsersIcon,
} from "lucide-react";
import React, { useCallback, useMemo } from "react";
import { Button } from "../../../components/ui/button";
import { FilterType } from "../../../types";
import { useSearch } from "../../../contexts/SearchContext";

export const FilterButtons: React.FC = () => {
  const { activeFilters, setActiveFilters } = useSearch();

  // Memoize filter click handler to avoid recreating on every render
  const handleFilterClick = useCallback((filter: FilterType) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  }, [activeFilters, setActiveFilters]);

  // Memoize button classes for each filter type to avoid recalculating on every render
  const userButtonClass = useMemo(() => getButtonClass("users", activeFilters), [activeFilters]);
  const filesButtonClass = useMemo(() => getButtonClass("files", activeFilters), [activeFilters]);
  const textButtonClass = useMemo(() => getButtonClass("text", activeFilters), [activeFilters]);

  // Memoize click handlers for each button to avoid recreating on every render
  const handleUserClick = useCallback(() => handleFilterClick("users"), [handleFilterClick]);
  const handleFilesClick = useCallback(() => handleFilterClick("files"), [handleFilterClick]);
  const handleTextClick = useCallback(() => handleFilterClick("text"), [handleFilterClick]);

  return (
    <div className="inline-flex items-start gap-[12.32px] relative flex-[0_0_auto]">
      <Button
        variant="outline"
        className={userButtonClass}
        onClick={handleUserClick}
      >
        <div className="inline-flex items-center gap-[9.24px] relative flex-[0_0_auto]">
          <UsersIcon className="relative w-[18.49px] h-[18.49px] text-gray-800" />
          <div className="mt-[-0.03px] text-[#1e1e1e] text-[13.9px] tracking-[0.42px] relative w-fit [font-family:'SF_Pro-Bold',Helvetica] font-bold leading-[normal]">
            Users
          </div>
        </div>
      </Button>

      <Button
        variant="outline"
        className={filesButtonClass}
        onClick={handleFilesClick}
      >
        <div className="inline-flex items-center gap-[9.24px] relative flex-[0_0_auto]">
          <FileTextIcon className="relative w-[18.49px] h-[18.49px] text-gray-800" />
          <div className="relative w-fit mt-[-0.03px] [font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#1e1e1e] text-[13.9px] tracking-[0.42px] leading-[normal]">
            Files
          </div>
        </div>
      </Button>

      <Button
        variant="outline"
        className={textButtonClass}
        onClick={handleTextClick}
      >
        <div className="inline-flex items-center gap-[9.24px] relative flex-[0_0_auto]">
          <AlignLeftIcon className="relative w-[18.49px] h-[18.49px] text-gray-800" />
          <div className="relative w-fit mt-[-0.03px] [font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#1e1e1e] text-[13.9px] tracking-[0.42px] leading-[normal]">
            Text
          </div>
        </div>
      </Button>

      <Button
        variant="outline"
        className="inline-flex flex-col items-start gap-[7.7px] p-[7.7px] relative flex-[0_0_auto] mt-[-0.58px] mb-[-0.58px] mr-[-0.58px] rounded-[7.7px] border-[1.16px] border-solid border-[#ebebeb] h-auto"
      >
        <MoreVerticalIcon className="relative w-[18.49px] h-[18.49px] text-gray-800" />
      </Button>
    </div>
  );
};

// Extract button class generation to outside function
function getButtonClass(filter: FilterType, activeFilters: FilterType[]): string {
  const baseClass = "inline-flex flex-col items-start gap-[7.7px] px-[11.55px] py-[7.7px] relative flex-[0_0_auto] mt-[-0.58px] mb-[-0.58px] rounded-[7.7px] border-[1.16px] border-solid h-auto";
  return `${baseClass} ${
    activeFilters.includes(filter)
      ? "bg-gray-100 border-gray-300"
      : "border-[#ebebeb]"
  }`;
}