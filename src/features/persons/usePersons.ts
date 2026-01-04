import {
  getPersonsPaginated,
  postPersons,
  putPersonsById,
  deletePersonsById,
  type CreateOrUpdatePersonModel,
  type PersonModel,
} from '@/api';
import { useCrudList } from '@/hooks/useCrudList';

export function usePersons() {
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
    PersonModel,
    CreateOrUpdatePersonModel,
    CreateOrUpdatePersonModel
  >(getPersonsPaginated, postPersons, putPersonsById, deletePersonsById, {
    initialPageSize: 20,
  });

  const createPerson = (body: CreateOrUpdatePersonModel) => create(body);
  const updatePerson = (id: string, body: CreateOrUpdatePersonModel) =>
    update(id, body);
  const deletePerson = (id: string) => deleteItem(id);

  return {
    persons: items,
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
    createPerson,
    updatePerson,
    deletePerson,
    refetch,
  };
}
