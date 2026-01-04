import {
  getProductsPaginated,
  postProducts,
  putProductsById,
  deleteProductsById,
  type CreateOrUpdateProductModel,
  type ProductModel,
} from '@/api';
import { useCrudList } from '@/hooks/useCrudList';

export function useProducts() {
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
    ProductModel,
    CreateOrUpdateProductModel,
    CreateOrUpdateProductModel
  >(getProductsPaginated, postProducts, putProductsById, deleteProductsById, {
    initialPageSize: 20,
  });

  const createProduct = (body: CreateOrUpdateProductModel) => create(body);
  const updateProduct = (id: string, body: CreateOrUpdateProductModel) =>
    update(id, body);
  const deleteProduct = (id: string) => deleteItem(id);

  return {
    products: items,
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
    createProduct,
    updateProduct,
    deleteProduct,
    refetch,
  };
}
