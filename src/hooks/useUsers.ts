import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';
import { getUsers, type UserModel } from '@/api';

export function useUsers() {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);

  const { callApi: fetchApi, loading: loadingList } = useApiRequest(getUsers, {
    showSuccess: false,
    showError: false,
  });

  const fetchApiRef = useRef(fetchApi);
  useEffect(() => {
    fetchApiRef.current = fetchApi;
  }, [fetchApi]);

  const refetch = useCallback(async () => {
    setError(null);
    const res = await fetchApiRef.current({});
    if (res) {
      setUsers(res);
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

  const initialLoading = loadingList && users.length === 0 && !error;

  return {
    users,
    initialLoading,
    loadingList,
    error,
    refetch,
  };
}
