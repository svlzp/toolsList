import { useMemo } from 'react';

interface SearchFilterOptions {
  searchFields: string[];
}

export const useSearchFilter = <T extends Record<string, any>>(
  items: T[],
  searchQuery: string,
  options: SearchFilterOptions
): T[] => {
  return useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    return items.filter((item) =>
      options.searchFields.some(
        (field) =>
          item[field]?.toString().toLowerCase().includes(lowercasedQuery) ?? false
      )
    );
  }, [items, searchQuery, options.searchFields]);
};
