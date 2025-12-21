import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getOrders,
  postOrders,
  putOrdersById,
  deleteOrdersById,
  type CreateOrUpdateOrderModel,
  type OrderModel,
} from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';

export function useOrders() {
  const [items, setItems] = useState<OrderModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const { callApi: fetchApi, loading: loadingList } = useApiRequest(getOrders, {
    showSuccess: false,
    showError: false,
  });
  const { callApi: createApi, loading: creating } = useApiRequest(postOrders);
  const { callApi: updateApi, loading: updating } =
    useApiRequest(putOrdersById);
  const { callApi: deleteApi, loading: deleting } =
    useApiRequest(deleteOrdersById);

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

  const createOrder = useCallback(
    async (body: CreateOrUpdateOrderModel) => {
      const res = await createApi({ body: body });
      await refetch();
      return res;
    },
    [createApi, refetch],
  );

  const updateOrder = useCallback(
    async (id: string, body: CreateOrUpdateOrderModel) => {
      const res = await updateApi({
        path: { id },
        body: body,
      });
      await refetch();
      return res;
    },
    [updateApi, refetch],
  );

  const deleteOrder = useCallback(
    async (id: string) => {
      const res = await deleteApi({ path: { id } });
      await refetch();
      return res;
    },
    [deleteApi, refetch],
  );

  const initialLoading = loadingList && items.length === 0 && !error;

  return {
    orders: items,
    initialLoading,
    loadingList,
    isLoading: loadingList,
    isCreating: creating,
    isUpdating: updating,
    isDeleting: deleting,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    refetch,
  };
}
