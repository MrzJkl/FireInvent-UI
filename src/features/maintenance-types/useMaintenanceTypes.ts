import {
  deleteMaintenanceTypesById,
  getMaintenanceTypesPaginated,
  postMaintenanceTypes,
  putMaintenanceTypesById,
  type CreateOrUpdateMaintenanceTypeModel,
  type MaintenanceTypeModel,
} from '@/api';
import { useCrudList } from '@/hooks/useCrudList';

export function useMaintenanceTypes() {
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
    MaintenanceTypeModel,
    CreateOrUpdateMaintenanceTypeModel,
    CreateOrUpdateMaintenanceTypeModel
  >(
    getMaintenanceTypesPaginated,
    postMaintenanceTypes,
    putMaintenanceTypesById,
    deleteMaintenanceTypesById,
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
