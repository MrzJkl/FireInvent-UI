import {
  getManufacturersPaginated,
  postManufacturers,
  putManufacturersById,
  deleteManufacturersById,
  type CreateOrUpdateManufacturerModel,
  type ManufacturerModel,
} from '@/api';
import { useCrudList } from '@/hooks/useCrudList';

export function useManufacturers() {
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
    ManufacturerModel,
    CreateOrUpdateManufacturerModel,
    CreateOrUpdateManufacturerModel
  >(
    getManufacturersPaginated,
    postManufacturers,
    putManufacturersById,
    deleteManufacturersById,
    { initialPageSize: 20 },
  );

  const createManufacturer = (body: CreateOrUpdateManufacturerModel) =>
    create(body);
  const updateManufacturer = (
    id: string,
    body: CreateOrUpdateManufacturerModel,
  ) => update(id, body);
  const deleteManufacturer = (id: string) => deleteItem(id);

  return {
    manufacturers: items,
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
    createManufacturer,
    updateManufacturer,
    deleteManufacturer,
    refetch,
  };
}
