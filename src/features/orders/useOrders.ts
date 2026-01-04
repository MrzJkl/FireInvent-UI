import {
  getOrdersPaginated,
  postOrders,
  putOrdersById,
  deleteOrdersById,
  type CreateOrUpdateOrderModel,
  type OrderModel,
} from '@/api';
import { useCrudList } from '@/hooks/useCrudList';

export function useOrders() {
  const {
    items,
    state,
    error,
    isLoading,
    isInitialLoading,
    isCreating,
    isUpdating,
    isDeleting,
    goToPage,
    setPageSize,
    nextPage,
    previousPage,
    setSearchTerm,
    create,
    update,
    delete: deleteItem,
    refetch,
  } = useCrudList<
    OrderModel,
    CreateOrUpdateOrderModel,
    CreateOrUpdateOrderModel
  >(getOrdersPaginated, postOrders, putOrdersById, deleteOrdersById, {
    initialPageSize: 20,
  });

  const createOrder = (body: CreateOrUpdateOrderModel) => create(body);
  const updateOrder = (id: string, body: CreateOrUpdateOrderModel) =>
    update(id, body);
  const deleteOrder = (id: string) => deleteItem(id);

  return {
    orders: items,
    state,
    error,
    isLoading,
    isInitialLoading,
    isCreating,
    isUpdating,
    isDeleting,
    goToPage,
    setPageSize,
    nextPage,
    previousPage,
    setSearchTerm,
    createOrder,
    updateOrder,
    deleteOrder,
    refetch,
  };
}
