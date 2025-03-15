import React from "react";
import { Badge } from "../../../components/ui/badge";
import { Avatar } from "../../../components/ui/avatar";
import { User } from "../../../types";
import { useSearch } from "../../../contexts/SearchContext";

interface UsersSectionProps {
  users: User[];
}

export const UsersSection: React.FC<UsersSectionProps> = ({ users }) => {
  const { selectedItemIndex, setSelectedItemIndex } = useSearch();
  
  if (users.length === 0) return null;

  // Function to check if this user item is selected
  const isSelected = (index: number): boolean => {
    return index === selectedItemIndex;
  };

  return (
    <div 
      className="flex flex-col items-start gap-[10.01px] relative self-stretch w-full flex-[0_0_auto]"
      role="region"
      aria-label="Users search results"
    >
      <div className="flex items-center gap-[10.01px] relative self-stretch w-full flex-[0_0_auto]">
        <Badge
          variant="outline"
          className="mt-[-0.77px] text-[#ababab] text-[10.8px] tracking-[0.75px] relative w-fit [font-family:'SF_Pro-Bold',Helvetica] font-bold leading-[normal] bg-transparent border-none pl-0 pr-[10.01px]"
        >
          Users
        </Badge>
        <div className="h-[1px] bg-[#ebebeb] flex-grow" />
      </div>

      <div role="list">
        {users.map((user, index) => {
          // Calculate the absolute index in the overall results list
          const absoluteIndex = index;
          const selected = isSelected(absoluteIndex);
          
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
              <Avatar className="rounded-[7.7px] border-[3.08px] border-solid border-[#eeeeee] bg-cover bg-[50%_50%] relative w-[37.75px] h-[37.75px] overflow-hidden">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </Avatar>
              <div className="flex flex-col">
                <div className="font-bold tracking-[0.42px] relative w-fit [font-family:'SF_Pro-Bold',Helvetica] text-[13.9px] leading-[normal]">
                  {user.nameParts?.map((part, i) => (
                    <span
                      key={i}
                      className={part.highlight ? "text-[#1e1e1e]" : "text-[#ababab]"}
                    >
                      {part.text}
                    </span>
                  ))}
                </div>
                <div className="text-[#ababab] text-[13.9px] tracking-[0.42px] relative w-fit [font-family:'SF_Pro-Regular',Helvetica] leading-[normal]">
                  {user.roleParts?.map((part, i) => (
                    <span
                      key={i}
                      className={part.highlight ? "text-[#1e1e1e] font-bold" : ""}
                    >
                      {part.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};