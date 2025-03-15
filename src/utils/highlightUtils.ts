import { TextPart } from "../types";

/**
 * Highlights parts of text that match the given query
 * @param text The full text to potentially highlight parts of
 * @param query The search query to highlight matches for
 * @returns An array of TextPart objects with highlight property set appropriately
 */
export const highlightText = (text: string, query: string): TextPart[] => {
  if (!query) return [{ text, highlight: false }];
  
  try {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map(part => ({
      text: part,
      highlight: part.toLowerCase() === query.toLowerCase(),
    }));
  } catch (e) {
    // In case of an invalid regex, return the text without highlighting
    return [{ text, highlight: false }];
  }
};

/**
 * Highlights text based on matches returned from Fuse.js results
 * @param text The original text
 * @param matches The matches array from Fuse.js
 * @returns An array of TextPart objects with highlighted sections
 */
export const highlightFuseMatches = (text: string, matches: any[] | undefined): TextPart[] => {
  if (!matches || matches.length === 0) return [{ text, highlight: false }];
  
  // Sort matches by indices to ensure proper order
  const sortedMatches = [...matches].sort((a, b) => a.indices[0][0] - b.indices[0][0]);
  
  const parts: TextPart[] = [];
  let lastIndex = 0;
  
  sortedMatches.forEach(match => {
    match.indices.forEach((indexPair: number[]) => {
      const [start, end] = indexPair;
      
      // Add non-highlighted text before match
      if (start > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, start),
          highlight: false,
        });
      }
      
      // Add highlighted text
      parts.push({
        text: text.substring(start, end + 1),
        highlight: true,
      });
      
      lastIndex = end + 1;
    });
  });
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      highlight: false,
    });
  }
  
  return parts;
}; 