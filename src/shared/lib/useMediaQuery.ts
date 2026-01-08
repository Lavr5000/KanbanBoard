'use client';

import { useState, useEffect } from 'react';

interface UseMediaQueryOptions {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
}

/**
 * Hook for responsive media queries
 * @param query - Media query string (e.g., "(max-width: 768px)")
 * @param options - Options for default value and initialization
 * @returns {boolean} true if media query matches
 */
export function useMediaQuery(
  query: string,
  options?: UseMediaQueryOptions
): boolean {
  const defaultValue = options?.defaultValue ?? false;
  const initializeWithValue = options?.initializeWithValue ?? false;

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      if (typeof window !== 'undefined') {
        return window.matchMedia(query).matches;
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Listen for changes
    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Hook for checking if device is mobile (< 768px)
 * @returns {boolean} true if mobile device
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * Hook for checking if device is tablet (768px - 1024px)
 * @returns {boolean} true if tablet device
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

/**
 * Hook for checking if device is desktop (>= 1024px)
 * @returns {boolean} true if desktop device
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
