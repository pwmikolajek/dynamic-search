import React, { useCallback } from "react";
import { ClockIcon, XIcon } from "lucide-react";
import { SearchHistoryItem } from "../../types";

interface SearchHistoryProps {
  searchHistory: SearchHistoryItem[];
  onSelectHistoryItem: (query: string, e: React.MouseEvent) => void;
  onRemoveHistoryItem: (query: string, e: React.MouseEvent) => void;
  onClearHistory: () => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  searchHistory,
  onSelectHistoryItem,
  onRemoveHistoryItem,
  onClearHistory,
}) => {
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
    <div className="absolute top-full left-0 right-0 mt-1 bg-white z-10 rounded-md shadow-lg border border-gray-200 max-h-[250px] overflow-y-auto">
      <div className="flex items-center justify-between p-2 border-b border-gray-100">
        <span className="text-[12px] text-gray-500 font-medium">Recent Searches</span>
        <button 
          className="text-gray-400 hover:text-gray-600 text-[12px]"
          onClick={onClearHistory}
        >
          Clear all
        </button>
      </div>
      <ul className="py-1">
        {searchHistory.map((item) => (
          <li 
            key={item.query} 
            className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
            onClick={(e) => onSelectHistoryItem(item.query, e)}
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
                onClick={(e) => onRemoveHistoryItem(item.query, e)}
                aria-label={`Remove ${item.query} from history`}
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}; 