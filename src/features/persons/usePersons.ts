import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getPersons,
  postPersons,
  putPersonsById,
  deletePersonsById,
  type CreatePersonModel,
  type PersonModel,
} from '@/api';
import { useApiRequest } from '@/hooks/useApiRequest';

export function usePersons() {
  const [items, setItems] = useState<PersonModel[]>([]);
  const { callApi: fetchApi, loading: loadingList } = useApiRequest(
    getPersons,
    { showSuccess: false },
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
    const res = await fetchApiRef.current({});
    if (res) setItems(res);
  }, []);

  // Only fetch once on mount
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createPerson = useCallback(
    async (body: CreatePersonModel) => {
      const res = await createApi({ body });
      await refetch();
      return res;
    },
    [createApi, refetch],
  );

  const updatePerson = useCallback(
    async (id: string, body: CreatePersonModel) => {
      const current = items.find((p) => p.id === id);
      if (!current) return null;
      // API expects full PersonModel
      const full: PersonModel = { ...current, ...body, departments: [] };
      const res = await updateApi({ path: { id }, body: full });
      await refetch();
      return res;
    },
    [items, updateApi, refetch],
  );

  const deletePerson = useCallback(
    async (id: string) => {
      const res = await deleteApi({ path: { id } });
      await refetch();
      return res;
    },
    [deleteApi, refetch],
  );

  const initialLoading = loadingList && items.length === 0;

  return {
    persons: items,
    initialLoading,
    loadingList,
    creating,
    updating,
    deleting,
    createPerson,
    updatePerson,
    deletePerson,
    refetch,
  };
}
