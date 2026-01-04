import {
  deleteProductTypesById,
  getProductTypesPaginated,
  postProductTypes,
  putProductTypesById,
  type CreateOrUpdateProductTypeModel,
  type ProductTypeModel,
} from '@/api';
import { useCrudList } from '@/hooks/useCrudList';

export function useProductTypes() {
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
    create: createItem,
    update: updateItem,
    delete: deleteItem,
    refetch,
  } = useCrudList<
    ProductTypeModel,
    CreateOrUpdateProductTypeModel,
    CreateOrUpdateProductTypeModel
  >(
    getProductTypesPaginated,
    postProductTypes,
    putProductTypesById,
    deleteProductTypesById,
    { initialPageSize: 20 },
  );

  return {
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
    createItem,
    updateItem,
    deleteItem,
    refetch,
  };
}
