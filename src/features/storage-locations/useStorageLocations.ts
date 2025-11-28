import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';
import {
  deleteStorageLocationsById,
  getStorageLocations,
  postStorageLocations,
  putStorageLocationsById,
  type CreateOrUpdateStorageLocationModel,
  type StorageLocationModel,
} from '@/api';

export function useStorageLocations() {
  const [items, setItems] = useState<StorageLocationModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);

  const { callApi: fetchApi, loading: loadingList } = useApiRequest(
    getStorageLocations,
    { showSuccess: false, showError: false },
  );
  const { callApi: createApi, loading: creating } =
    useApiRequest(postStorageLocations);
  const { callApi: updateApi, loading: updating } = useApiRequest(
    putStorageLocationsById,
  );
  const { callApi: deleteApi, loading: deleting } = useApiRequest(
    deleteStorageLocationsById,
  );

  const fetchApiRef = useRef(fetchApi);
  useEffect(() => {
    fetchApiRef.current = fetchApi;
  }, [fetchApi]);

  const refetch = useCallback(async () => {
    setError(null);
    const res = await fetchApiRef.current({});
    if (res) {
      setItems(res);
    } else {
      setError({
        message: 'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
      });
    }
  }, []);

  // Only fetch once on mount
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createItem = useCallback(
    async (body: CreateOrUpdateStorageLocationModel) => {
      const res = await createApi({ body });
      await refetch();
      return res;
    },
    [createApi, refetch],
  );

  const updateItem = useCallback(
    async (id: string, body: CreateOrUpdateStorageLocationModel) => {
      const res = await updateApi({ path: { id }, body });
      await refetch();
      return res;
    },
    [updateApi, refetch],
  );

  const deleteItem = useCallback(
    async (id: string) => {
      const res = await deleteApi({ path: { id } });
      await refetch();
      return res;
    },
    [deleteApi, refetch],
  );

  const initialLoading = loadingList && items.length === 0 && !error;

  return {
    items,
    initialLoading,
    loadingList,
    creating,
    updating,
    deleting,
    error,
    refetch,
    createItem,
    updateItem,
    deleteItem,
  };
}
