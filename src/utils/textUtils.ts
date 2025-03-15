import { TextPart } from "../screens/DynamicSearch/data";

/**
 * Highlights matching text parts based on a search query
 * @param text - The original text to search within
 * @param query - The search query to highlight
 * @returns Array of text parts with highlight information
 */
export const highlightText = (text: string, query: string): TextPart[] => {
  const parts: TextPart[] = [];
  if (!query) return [{ text, highlight: false }];
  
  let remainingText = text;
  let lastIndex = 0;

  while (true) {
    const index = remainingText.toLowerCase().indexOf(query.toLowerCase(), lastIndex);
    if (index === -1) {
      if (lastIndex < remainingText.length) {
        parts.push({ text: remainingText.slice(lastIndex), highlight: false });
      }
      break;
    }

    if (index > lastIndex) {
      parts.push({ text: remainingText.slice(lastIndex, index), highlight: false });
    }
    parts.push({ text: remainingText.slice(index, index + query.length), highlight: true });
    lastIndex = index + query.length;
  }

  return parts;
};

/**
 * Filter text by checking if it contains a search query
 * @param text - Text to check
 * @param query - Search query
 * @returns True if text contains query (case insensitive)
 */
export const textContainsQuery = (text: string, query: string): boolean => {
  if (!query) return false;
  return text.toLowerCase().includes(query.toLowerCase());
}; 