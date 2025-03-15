import { SearchHistoryItem } from "../types";

// Constants
export const MAX_HISTORY_ITEMS = 5;
export const SEARCH_HISTORY_STORAGE_KEY = 'dynamicSearchHistory';

// Fuse.js options for different data types
export const userFuseOptions = {
  keys: ['name', 'role'],
  threshold: 0.4, // Lower threshold means more strict matching
  includeScore: true, // Include the score in the result
  includeMatches: true, // Include the matched indices for highlighting
  shouldSort: true, // Sort by score
};

export const fileFuseOptions = {
  keys: ['name', 'type'],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  shouldSort: true,
};

export const textFuseOptions = {
  keys: ['text'],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  shouldSort: true,
};

// Helper function to load search history from localStorage
export const loadSearchHistory = (): SearchHistoryItem[] => {
  try {
    const savedHistory = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    if (savedHistory) {
      return JSON.parse(savedHistory);
    }
  } catch (error) {
    console.error('Error loading search history:', error);
  }
  return [];
};

// Helper function to save search history to localStorage
export const saveSearchHistory = (history: SearchHistoryItem[]): void => {
  try {
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving search history:', error);
  }
};

// Utility function to format timestamp for display
export const formatTimestamp = (timestamp: number): string => {
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
};

// Add a search to history
export const addToSearchHistory = (
  query: string, 
  currentHistory: SearchHistoryItem[]
): SearchHistoryItem[] => {
  if (!query || query.trim() === '') return currentHistory;
  
  const trimmedQuery = query.trim();
  const existingIndex = currentHistory.findIndex(
    item => item.query.toLowerCase() === trimmedQuery.toLowerCase()
  );
  
  if (existingIndex !== -1) {
    // Remove the existing item to add it to the top
    const updatedHistory = [...currentHistory];
    updatedHistory.splice(existingIndex, 1);
    
    // Add to the beginning with updated timestamp
    const newHistory = [
      { query: trimmedQuery, timestamp: Date.now() },
      ...updatedHistory
    ];
    
    saveSearchHistory(newHistory);
    return newHistory;
  } else {
    // Add new item and limit the history length
    const newHistory = [
      { query: trimmedQuery, timestamp: Date.now() },
      ...currentHistory
    ].slice(0, MAX_HISTORY_ITEMS);
    
    saveSearchHistory(newHistory);
    return newHistory;
  }
}; 