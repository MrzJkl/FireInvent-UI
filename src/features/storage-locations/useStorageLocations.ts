import {
  deleteStorageLocationsById,
  getStorageLocationsPaginated,
  postStorageLocations,
  putStorageLocationsById,
  type CreateOrUpdateStorageLocationModel,
  type StorageLocationModel,
} from '@/api';
import { useCrudList } from '@/hooks/useCrudList';

export function useStorageLocations() {
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
    StorageLocationModel,
    CreateOrUpdateStorageLocationModel,
    CreateOrUpdateStorageLocationModel
  >(
    getStorageLocationsPaginated,
    postStorageLocations,
    putStorageLocationsById,
    deleteStorageLocationsById,
    { initialPageSize: 20 },
  );

  return {
    items,
    storageLocations: items,
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
