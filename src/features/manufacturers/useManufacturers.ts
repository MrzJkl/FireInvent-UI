import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getManufacturers,
  postManufacturers,
  putManufacturersById,
  deleteManufacturersById,
  type CreateOrUpdateManufacturerModel,
  type ManufacturerModel,
} from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';

export function useManufacturers() {
  const [items, setItems] = useState<ManufacturerModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const { callApi: fetchApi, loading: loadingList } = useApiRequest(
    getManufacturers,
    { showSuccess: false, showError: false },
  );
  const { callApi: createApi, loading: creating } =
    useApiRequest(postManufacturers);
  const { callApi: updateApi, loading: updating } =
    useApiRequest(putManufacturersById);
  const { callApi: deleteApi, loading: deleting } = useApiRequest(
    deleteManufacturersById,
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
        message:
          'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
      });
    }
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createManufacturer = useCallback(
    async (body: CreateOrUpdateManufacturerModel) => {
      const res = await createApi({ body: body });
      await refetch();
      return res;
    },
    [createApi, refetch],
  );

  const updateManufacturer = useCallback(
    async (id: string, body: CreateOrUpdateManufacturerModel) => {
      const res = await updateApi({
        path: { id },
        body: body,
      });
      await refetch();
      return res;
    },
    [updateApi, refetch],
  );

  const deleteManufacturer = useCallback(
    async (id: string) => {
      const res = await deleteApi({ path: { id } });
      await refetch();
      return res;
    },
    [deleteApi, refetch],
  );

  const initialLoading = loadingList && items.length === 0 && !error;

  return {
    manufacturers: items,
    isLoading: initialLoading,
    isCreating: creating,
    isUpdating: updating,
    isDeleting: deleting,
    error,
    createManufacturer,
    updateManufacturer,
    deleteManufacturer,
    refetch,
  };
}
