/**
 * Generic hook for paginated list endpoints with search functionality
 *
 * This hook manages paginated list state, search, and common CRUD operations
 * in a reusable way across all list endpoints.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';
import type { ListParams } from '@/lib/pagination';

export type UseListItemsState = {
  page: number;
  pageSize: number;
  searchTerm: string | null;
  totalItems: number;
  totalPages: number;
};

export type UseListItemsReturn<T> = {
  items: T[];
  state: UseListItemsState;
  error: ApiError | null;
  isLoading: boolean;
  isInitialLoading: boolean;

  // Pagination
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;

  // Search
  setSearchTerm: (term: string | null) => void;

  // Refetch
  refetch: () => Promise<void>;
};

interface PaginatedListOptions {
  initialPage?: number;
  initialPageSize?: number;
  enableAutoFetch?: boolean;
}

/**
 * Generic hook for managing paginated list endpoints
 *
 * Usage:
 * ```
 * const { items, state, goToPage, setSearchTerm, isLoading } = useListItems(
 *   getDepartmentsPaginated,
 *   { initialPageSize: 20 }
 * );
 * ```
 */
export function useListItems<T>(
  // Function that takes ListParams and returns a promise with PagedResult<T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchFn: (params: Partial<ListParams>, options?: any) => Promise<any>,
  options: PaginatedListOptions = {},
): UseListItemsReturn<T> {
  const {
    initialPage = 1,
    initialPageSize = 10,
    enableAutoFetch = true,
  } = options;

  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [state, setState] = useState<UseListItemsState>({
    page: initialPage,
    pageSize: initialPageSize,
    searchTerm: null,
    totalItems: 0,
    totalPages: 0,
  });

  const { callApi, loading } = useApiRequest(fetchFn, {
    showSuccess: false,
    showError: false,
  });

  const callApiRef = useRef(callApi);
  useEffect(() => {
    callApiRef.current = callApi;
  }, [callApi]);

  const refetch = useCallback(async () => {
    setError(null);
    const res = await callApiRef.current({
      page: state.page,
      pageSize: state.pageSize,
      searchTerm: state.searchTerm,
    });

    if (res) {
      setItems(res.items ?? []);
      setState((prev) => ({
        ...prev,
        totalItems: res.totalItems ?? 0,
        totalPages: res.totalPages ?? 0,
        page: res.page ?? prev.page,
        pageSize: res.pageSize ?? prev.pageSize,
      }));
    } else {
      setError({
        message:
          'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
      });
    }
  }, [state.page, state.pageSize, state.searchTerm]);

  // Initial fetch
  useEffect(() => {
    if (enableAutoFetch) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when pagination or search changes
  useEffect(() => {
    if (enableAutoFetch) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.page, state.pageSize, state.searchTerm]);

  const goToPage = useCallback((page: number) => {
    setState((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(page, prev.totalPages || 1)),
    }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setState((prev) => ({
      ...prev,
      pageSize: size,
      page: 1, // Reset to first page when changing page size
    }));
  }, []);

  const nextPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      page: Math.min(prev.page + 1, prev.totalPages || prev.page),
    }));
  }, []);

  const previousPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      page: Math.max(prev.page - 1, 1),
    }));
  }, []);

  const setSearchTerm = useCallback((term: string | null) => {
    setState((prev) => ({
      ...prev,
      searchTerm: term,
      page: 1, // Reset to first page when searching
    }));
  }, []);

  const isInitialLoading = loading && items.length === 0 && !error;

  return {
    items,
    state,
    error,
    isLoading: loading,
    isInitialLoading,
    goToPage,
    setPageSize,
    nextPage,
    previousPage,
    setSearchTerm,
    refetch,
  };
}
