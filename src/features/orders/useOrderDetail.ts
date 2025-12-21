import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getOrdersById,
  getOrderItemsByOrderByOrderId,
  type OrderModel,
  type OrderItemModel,
} from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';

export function useOrderDetail(orderId: string | undefined) {
  const [order, setOrder] = useState<OrderModel | null>(null);
  const [items, setItems] = useState<OrderItemModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);

  const { callApi: fetchOrder, loading: loadingOrder } = useApiRequest(
    getOrdersById,
    { showSuccess: false, showError: false },
  );
  const { callApi: fetchItems, loading: loadingItems } = useApiRequest(
    getOrderItemsByOrderByOrderId,
    { showSuccess: false, showError: false },
  );

  const fetchOrderRef = useRef(fetchOrder);
  const fetchItemsRef = useRef(fetchItems);

  useEffect(() => {
    fetchOrderRef.current = fetchOrder;
    fetchItemsRef.current = fetchItems;
  }, [fetchOrder, fetchItems]);

  const refetch = useCallback(async () => {
    if (!orderId) return;
    setError(null);
    try {
      const orderRes = await fetchOrderRef.current({
        path: { id: orderId },
      });
      const itemsRes = await fetchItemsRef.current({
        path: { orderId },
      });

      if (orderRes) setOrder(orderRes);
      if (itemsRes) setItems(itemsRes);

      if (!orderRes) {
        setError({ message: 'Bestellung konnte nicht geladen werden.' });
      }
    } catch {
      setError({ message: 'Ein Fehler ist aufgetreten.' });
    }
  }, [orderId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const initialLoading = (loadingOrder || loadingItems) && !order && !error;

  return {
    order,
    items,
    initialLoading,
    isLoading: loadingOrder || loadingItems,
    error,
    refetch,
  };
}
