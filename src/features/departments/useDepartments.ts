import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';
import {
  deleteDepartmentsById,
  getDepartments,
  postDepartments,
  putDepartmentsById,
  type CreateOrUpdateDepartmentModel,
  type DepartmentModel,
} from '@/api';

export function useDepartments() {
  const [items, setItems] = useState<DepartmentModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);

  const { callApi: fetchApi, loading: loadingList } = useApiRequest(
    getDepartments,
    { showSuccess: false, showError: false },
  );
  const { callApi: createApi, loading: creating } =
    useApiRequest(postDepartments);
  const { callApi: updateApi, loading: updating } =
    useApiRequest(putDepartmentsById);
  const { callApi: deleteApi, loading: deleting } = useApiRequest(
    deleteDepartmentsById,
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

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createItem = useCallback(
    async (body: CreateOrUpdateDepartmentModel) => {
      const res = await createApi({ body });
      await refetch();
      return res;
    },
    [createApi, refetch],
  );

  const updateItem = useCallback(
    async (id: string, body: CreateOrUpdateDepartmentModel) => {
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
