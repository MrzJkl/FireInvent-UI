import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getProductsByIdVariants,
  postVariants,
  putVariantsById,
  deleteVariantsById,
  type CreateOrUpdateVariantModel,
  type VariantModel,
} from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';

export function useVariants(productId: string | undefined) {
  const [items, setItems] = useState<VariantModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);

  const { callApi: listApi, loading: loadingList } = useApiRequest(
    getProductsByIdVariants,
    { showSuccess: false, showError: false },
  );
  const { callApi: createApi, loading: creating } = useApiRequest(postVariants);
  const { callApi: updateApi, loading: updating } =
    useApiRequest(putVariantsById);
  const { callApi: deleteApi, loading: deleting } =
    useApiRequest(deleteVariantsById);

  const listApiRef = useRef(listApi);
  useEffect(() => {
    listApiRef.current = listApi;
  }, [listApi]);

  const refetch = useCallback(async () => {
    if (!productId) return;
    setError(null);
    const res = await listApiRef.current({ path: { id: productId } });
    if (res) {
      setItems(res);
    } else {
      setError({
        message: 'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
      });
    }
  }, [productId]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const createVariant = useCallback(
    async (body: Omit<CreateOrUpdateVariantModel, 'productId'>) => {
      if (!productId) return null;
      const res = await createApi({
        body: { ...body, productId },
      });
      await refetch();
      return res;
    },
    [createApi, productId, refetch],
  );

  const updateVariant = useCallback(
    async (id: string, body: Omit<CreateOrUpdateVariantModel, 'productId'>) => {
      if (!productId) return null;
      const res = await updateApi({
        path: { id },
        body: { ...body, productId },
      });
      await refetch();
      return res;
    },
    [updateApi, productId, refetch],
  );

  const deleteVariant = useCallback(
    async (id: string) => {
      const res = await deleteApi({ path: { id } });
      await refetch();
      return res;
    },
    [deleteApi, refetch],
  );

  const initialLoading = loadingList && items.length === 0 && !error;

  return {
    variants: items,
    initialLoading,
    isLoading: loadingList,
    isCreating: creating,
    isUpdating: updating,
    isDeleting: deleting,
    error,
    createVariant,
    updateVariant,
    deleteVariant,
    refetch,
  };
}
