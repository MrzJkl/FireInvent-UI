import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiRequest } from '@/hooks/useApiRequest';
import {
  deleteStorageLocationsById,
  getStorageLocations,
  postStorageLocations,
  putStorageLocationsById,
  type CreateStorageLocationModel,
  type StorageLocationModel,
} from '@/api';

export function useStorageLocations() {
  const [items, setItems] = useState<StorageLocationModel[]>([]);

  const { callApi: fetchApi, loading: loadingList } = useApiRequest(
    getStorageLocations,
    { showSuccess: false },
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
    const res = await fetchApiRef.current({});
    if (res) setItems(res);
  }, []);

  // Only fetch once on mount
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createItem = useCallback(
    async (body: CreateStorageLocationModel) => {
      const res = await createApi({ body });
      await refetch();
      return res;
    },
    [createApi, refetch],
  );

  const updateItem = useCallback(
    async (item: StorageLocationModel) => {
      const res = await updateApi({ path: { id: item.id }, body: item });
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

  const initialLoading = loadingList && items.length === 0;

  return {
    items,
    initialLoading,
    loadingList,
    creating,
    updating,
    deleting,
    refetch,
    createItem,
    updateItem,
    deleteItem,
  };
}
