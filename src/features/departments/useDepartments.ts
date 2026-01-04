import {
  deleteDepartmentsById,
  getDepartmentsPaginated,
  postDepartments,
  putDepartmentsById,
  type CreateOrUpdateDepartmentModel,
  type DepartmentModel,
} from '@/api';
import { useCrudList } from '@/hooks/useCrudList';

export function useDepartments() {
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
    DepartmentModel,
    CreateOrUpdateDepartmentModel,
    CreateOrUpdateDepartmentModel
  >(
    getDepartmentsPaginated,
    postDepartments,
    putDepartmentsById,
    deleteDepartmentsById,
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
