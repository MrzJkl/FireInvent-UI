import {
  getVariantsPaginated,
  postVariants,
  putVariantsById,
  deleteVariantsById,
  type CreateOrUpdateVariantModel,
  type VariantModel,
} from '@/api';
import { useCrudList } from '@/hooks/useCrudList';

export function useAllVariants() {
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
    VariantModel,
    CreateOrUpdateVariantModel,
    CreateOrUpdateVariantModel
  >(getVariantsPaginated, postVariants, putVariantsById, deleteVariantsById);

  const createVariant = (body: CreateOrUpdateVariantModel) => create(body);
  const updateVariant = (id: string, body: CreateOrUpdateVariantModel) =>
    update(id, body);
  const deleteVariant = (id: string) => deleteItem(id);

  return {
    variants: items,
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
    createVariant,
    updateVariant,
    deleteVariant,
    refetch,
  };
}
