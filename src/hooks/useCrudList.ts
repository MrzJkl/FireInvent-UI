/**
 * Generic hook for paginated list endpoints with CRUD operations
 *
 * This hook provides a complete solution for list management with:
 * - Pagination support
 * - Search functionality
 * - CRUD operations (Create, Read, Update, Delete)
 * - Automatic refetch after mutations
 *
 * This replaces the individual hook implementations for better consistency.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';
import type { ListParams } from '@/api/paginatedList';

export type UseCrudListState = {
  page: number;
  pageSize: number;
  searchTerm: string | null;
  totalItems: number;
  totalPages: number;
};

export type UseCrudListReturn<T, CreateModel, UpdateModel> = {
  // Data
  items: T[];
  state: UseCrudListState;
  error: ApiError | null;

  // Loading states
  isLoading: boolean;
  isInitialLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Pagination
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;

  // Search
  setSearchTerm: (term: string | null) => void;

  // CRUD operations
  create: (body: CreateModel) => Promise<T | null>;
  update: (id: string, body: UpdateModel) => Promise<T | null>;
  delete: (id: string) => Promise<void | null>;
  refetch: () => Promise<void>;
};

interface UseCrudListOptions {
  initialPage?: number;
  initialPageSize?: number;
  enableAutoFetch?: boolean;
}

/**
 * Generic hook for CRUD operations with paginated list endpoints
 *
 * Usage:
 * ```
 * const {
 *   items,
 *   state,
 *   isLoading,
 *   goToPage,
 *   setSearchTerm,
 *   create,
 *   update,
 *   delete: deleteItem
 * } = useCrudList(
 *   getDepartmentsPaginated,
 *   postDepartments,
 *   putDepartmentsById,
 *   deleteDepartmentsById,
 *   { initialPageSize: 20 }
 * );
 * ```
 */
export function useCrudList<T, CreateModel, UpdateModel>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchFn: (params: Partial<ListParams>, options?: any) => Promise<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createFn: (options?: any) => Promise<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateFn: (options?: any) => Promise<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteFn: (options?: any) => Promise<any>,
  options: UseCrudListOptions = {},
): UseCrudListReturn<T, CreateModel, UpdateModel> {
  const {
    initialPage = 1,
    initialPageSize = 10,
    enableAutoFetch = true,
  } = options;

  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [state, setState] = useState<UseCrudListState>({
    page: initialPage,
    pageSize: initialPageSize,
    searchTerm: null,
    totalItems: 0,
    totalPages: 0,
  });

  const { callApi: listApi, loading: listLoading } = useApiRequest(fetchFn, {
    showSuccess: false,
    showError: false,
  });
  const { callApi: createApi, loading: creating } = useApiRequest(createFn);
  const { callApi: updateApi, loading: updating } = useApiRequest(updateFn);
  const { callApi: deleteApi, loading: deleting } = useApiRequest(deleteFn);

  const listApiRef = useRef(listApi);
  useEffect(() => {
    listApiRef.current = listApi;
  }, [listApi]);

  const refetch = useCallback(async () => {
    setError(null);
    const res = await listApiRef.current({
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

  const create = useCallback(
    async (body: CreateModel) => {
      const res = await createApi({ body });
      if (res) {
        await refetch();
      }
      return res ?? null;
    },
    [createApi, refetch],
  );

  const update = useCallback(
    async (id: string, body: UpdateModel) => {
      const res = await updateApi({ path: { id }, body });
      if (res) {
        await refetch();
      }
      return res ?? null;
    },
    [updateApi, refetch],
  );

  const deleteItem = useCallback(
    async (id: string) => {
      const res = await deleteApi({ path: { id } });
      if (res !== null && res !== undefined) {
        await refetch();
      }
      return res ?? null;
    },
    [deleteApi, refetch],
  );

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

  const isInitialLoading = listLoading && items.length === 0 && !error;

  return {
    items,
    state,
    error,
    isLoading: listLoading,
    isInitialLoading,
    isCreating: creating,
    isUpdating: updating,
    isDeleting: deleting,
    goToPage,
    setPageSize,
    nextPage,
    previousPage,
    setSearchTerm,
    create,
    update,
    delete: deleteItem,
    refetch,
  };
}
