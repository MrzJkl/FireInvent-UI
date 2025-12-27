import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';
import {
  deleteApiIntegrationsById,
  getApiIntegrations,
  postApiIntegrations,
  type ApiIntegrationModel,
  type CreateApiIntegrationModel,
  type ApiIntegrationCredentialsModel,
} from '@/api';

export function useApiIntegrations() {
  const [items, setItems] = useState<ApiIntegrationModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);

  const { callApi: fetchApi, loading: loadingList } = useApiRequest(
    getApiIntegrations,
    { showSuccess: false, showError: false },
  );
  const { callApi: createApi, loading: creating } =
    useApiRequest(postApiIntegrations);
  const { callApi: deleteApi, loading: deleting } = useApiRequest(
    deleteApiIntegrationsById,
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

  const createItem = useCallback(
    async (
      body: CreateApiIntegrationModel,
    ): Promise<ApiIntegrationCredentialsModel | null> => {
      const res = await createApi({ body });
      await refetch();
      return res;
    },
    [createApi, refetch],
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
    deleting,
    error,
    refetch,
    createItem,
    deleteItem,
  };
}
