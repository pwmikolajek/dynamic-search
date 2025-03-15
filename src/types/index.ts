export interface TextPart {
  text: string;
  highlight: boolean;
}

export interface User {
  avatar: string;
  name: string;
  role: string;
  nameParts?: TextPart[];
  roleParts?: TextPart[];
}

export interface File {
  icon: string;
  name: string;
  type: string;
  date: string;
  nameParts?: TextPart[];
  typeParts?: TextPart[];
}

export interface TextResult {
  text: string;
  textParts?: TextPart[];
}

export type FilterType = "users" | "files" | "text";

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export interface SearchState {
  searchQuery: string;
  activeFilters: FilterType[];
  userResults: User[];
  fileResults: File[];
  textResults: TextResult[];
  setSearchQuery: (query: string) => void;
  setActiveFilters: React.Dispatch<React.SetStateAction<FilterType[]>>;
  isLoading: boolean;
  selectedItemIndex: number;
  setSelectedItemIndex: React.Dispatch<React.SetStateAction<number>>;
  totalResultsCount: number;
  selectNextItem: () => void;
  selectPrevItem: () => void;
  hasSelectedItem: boolean;
  searchHistory: SearchHistoryItem[];
  clearSearchHistory: () => void;
  removeFromHistory: (query: string) => void;
  showHistory: boolean;
  setShowHistory: (value: React.MouseEvent | boolean) => void;
  submitSearch: () => void;
} 