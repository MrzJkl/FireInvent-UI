import {
  deleteMaintenancesById,
  getMaintenancesPaginated,
  postMaintenances,
  putMaintenancesById,
  type CreateOrUpdateMaintenanceModel,
  type MaintenanceModel,
} from '@/api';
import { useCrudList } from '@/hooks/useCrudList';

export function useMaintenances() {
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
    MaintenanceModel,
    CreateOrUpdateMaintenanceModel,
    CreateOrUpdateMaintenanceModel
  >(
    getMaintenancesPaginated,
    postMaintenances,
    putMaintenancesById,
    deleteMaintenancesById,
  );

  const createMaintenance = (body: CreateOrUpdateMaintenanceModel) =>
    create(body);
  const updateMaintenance = (
    id: string,
    body: CreateOrUpdateMaintenanceModel,
  ) => update(id, body);

  return {
    maintenances: items,
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
    createMaintenance,
    updateMaintenance,
    deleteMaintenance: deleteItem,
    refetch,
  };
}
