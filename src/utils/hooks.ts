import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to debounce a value by delaying updates
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook to track window keydown events
 * @param key - Key to listen for (e.g., 'ArrowDown', 'Enter')
 * @param callback - Function to execute when key is pressed
 */
export const useKeyPress = (key: string, callback: () => void): void => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === key) {
        callback();
      }
    },
    [key, callback]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}; 