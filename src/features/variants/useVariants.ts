import { useMemo } from 'react';
import {
  getProductsByIdVariantsPaginated,
  postVariants,
  putVariantsById,
  deleteVariantsById,
  type CreateOrUpdateVariantModel,
  type VariantModel,
} from '@/api';
import { useCrudList } from '@/hooks/useCrudList';

export function useVariants(productId: string | undefined) {
  // Custom list function that includes productId in the path
  const listFn = useMemo(
    () => (params: Partial<{ page?: number; pageSize?: number; searchTerm?: string | null }>) => {
      if (!productId) {
        return Promise.resolve({
          data: { items: [], page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
        });
      }
      return getProductsByIdVariantsPaginated(productId, params);
    },
    [productId],
  );

  const result = useCrudList<
    VariantModel,
    CreateOrUpdateVariantModel,
    CreateOrUpdateVariantModel
  >(
    listFn,
    postVariants,
    putVariantsById,
    deleteVariantsById,
    {
      initialPageSize: 20,
    },
  );

  // Add productId to create/update payloads
  const createVariant = async (data: Omit<CreateOrUpdateVariantModel, 'productId'>) => {
    if (!productId) return null;
    return result.create({ ...data, productId } as CreateOrUpdateVariantModel);
  };

  const updateVariant = async (id: string, data: Omit<CreateOrUpdateVariantModel, 'productId'>) => {
    if (!productId) return null;
    return result.update(id, { ...data, productId } as CreateOrUpdateVariantModel);
  };

  return {
    ...result,
    variants: result.items,
    createVariant,
    updateVariant,
    isLoading: result.isInitialLoading,
    initialLoading: result.isInitialLoading,
  };
}
