import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getPersons,
  postPersons,
  putPersonsById,
  deletePersonsById,
  type CreateOrUpdatePersonModel,
  type PersonModel,
} from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';

export function usePersons() {
  const [items, setItems] = useState<PersonModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const { callApi: fetchApi, loading: loadingList } = useApiRequest(
    getPersons,
    { showSuccess: false, showError: false },
  );
  const { callApi: createApi, loading: creating } = useApiRequest(postPersons);
  const { callApi: updateApi, loading: updating } =
    useApiRequest(putPersonsById);
  const { callApi: deleteApi, loading: deleting } =
    useApiRequest(deletePersonsById);

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

  const createPerson = useCallback(
    async (body: CreateOrUpdatePersonModel) => {
      const res = await createApi({ body: body });
      await refetch();
      return res;
    },
    [createApi, refetch],
  );

  const updatePerson = useCallback(
    async (id: string, body: CreateOrUpdatePersonModel) => {
      const res = await updateApi({
        path: { id },
        body: body,
      });
      await refetch();
      return res;
    },
    [updateApi, refetch],
  );

  const deletePerson = useCallback(
    async (id: string) => {
      const res = await deleteApi({ path: { id } });
      await refetch();
      return res;
    },
    [deleteApi, refetch],
  );

  const initialLoading = loadingList && items.length === 0 && !error;

  return {
    persons: items,
    initialLoading,
    loadingList,
    creating,
    updating,
    deleting,
    error,
    createPerson,
    updatePerson,
    deletePerson,
    refetch,
  };
}
