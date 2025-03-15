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

export interface SearchState {
  searchQuery: string;
  activeFilters: FilterType[];
  userResults: User[];
  fileResults: File[];
  textResults: TextResult[];
  setSearchQuery: (query: string) => void;
  setActiveFilters: (filters: FilterType[]) => void;
  isLoading: boolean;
  selectedItemIndex: number;
  setSelectedItemIndex: (index: number) => void;
  totalResultsCount: number;
  selectNextItem: () => void;
  selectPrevItem: () => void;
  hasSelectedItem: boolean;
} 