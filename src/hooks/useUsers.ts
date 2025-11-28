import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { getUsers, type UserModel } from '@/api';

export function useUsers() {
  const [users, setUsers] = useState<UserModel[]>([]);

  const { callApi: fetchApi, loading: loadingList } = useApiRequest(getUsers, {
    showSuccess: false,
  });

  const fetchApiRef = useRef(fetchApi);
  useEffect(() => {
    fetchApiRef.current = fetchApi;
  }, [fetchApi]);

  const refetch = useCallback(async () => {
    const res = await fetchApiRef.current({});
    if (res) setUsers(res);
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialLoading = loadingList && users.length === 0;

  return {
    users,
    initialLoading,
    loadingList,
    refetch,
  };
}
