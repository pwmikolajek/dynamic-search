import React from "react";
import { Badge } from "../../../components/ui/badge";
import { File } from "../../../types";
import { useSearch } from "../../../contexts/SearchContext";

interface FilesSectionProps {
  files: File[];
}

export const FilesSection: React.FC<FilesSectionProps> = ({ files }) => {
  const { selectedItemIndex, setSelectedItemIndex, userResults } = useSearch();
  
  if (files.length === 0) return null;

  // Function to check if this file item is selected
  const isSelected = (index: number): boolean => {
    // Add the user results count to get the absolute index
    const absoluteIndex = userResults.length + index;
    return absoluteIndex === selectedItemIndex;
  };

  return (
    <div 
      className="inline-flex flex-col items-start gap-[10.01px] relative flex-[0_0_auto] w-full"
      role="region"
      aria-label="Files search results"
    >
      <div className="flex items-center gap-[10.01px] relative self-stretch w-full flex-[0_0_auto]">
        <Badge
          variant="outline"
          className="relative w-fit mt-[-0.77px] [font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#ababab] text-[10.8px] tracking-[0.75px] leading-[normal] bg-transparent border-none pl-0 pr-[10.01px]"
        >
          Files
        </Badge>
        <div className="h-[1px] bg-[#ebebeb] flex-grow" />
      </div>

      <div role="list">
        {files.map((file, index) => {
          // Calculate the absolute index in the overall results list
          const absoluteIndex = userResults.length + index;
          const selected = isSelected(index);
          
          return (
            <div
              key={index}
              id={`result-item-${absoluteIndex}`}
              className={`inline-flex items-center gap-[11.55px] relative flex-[0_0_auto] w-full p-2 rounded-md transition-colors ${
                selected ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
              role="listitem"
              tabIndex={0}
              aria-selected={selected}
              onClick={() => setSelectedItemIndex(absoluteIndex)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedItemIndex(absoluteIndex);
                }
              }}
            >
              <img
                className="relative w-[37.75px] h-[37.75px]"
                alt="Icon"
                src={file.icon}
              />
              <div className="flex items-center gap-[8px]">
                <div className="relative w-fit mt-[-0.19px] [font-family:'SF_Pro-Bold',Helvetica] font-bold text-[13.9px] tracking-[0.42px] leading-[normal] whitespace-nowrap">
                  {file.nameParts?.map((part, i) => (
                    <span
                      key={i}
                      className={part.highlight ? "text-[#1e1e1e]" : "text-[#ababab]"}
                    >
                      {part.text}
                    </span>
                  ))}
                </div>
                <div className="text-[#ababab] text-[13.9px] tracking-[0.42px] relative w-fit [font-family:'SF_Pro-Regular',Helvetica] leading-[normal] whitespace-nowrap">
                  {file.typeParts?.map((part, i) => (
                    <span
                      key={i}
                      className={part.highlight ? "text-[#1e1e1e] font-bold" : ""}
                    >
                      {part.text}
                    </span>
                  ))}
                </div>
                <div className="text-[#ababab] text-[10.8px] leading-[normal] relative w-fit [font-family:'SF_Pro-Regular',Helvetica] tracking-[normal] whitespace-nowrap">
                  {file.date}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};