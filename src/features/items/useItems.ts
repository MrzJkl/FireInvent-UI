import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getVariantsByIdItems,
  postItems,
  putItemsById,
  deleteItemsById,
  type CreateOrUpdateItemModel,
  type ItemModel,
} from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';

/**
 * Hook for managing items within a product/variant context
 *
 * Note: This hook uses the nested variant endpoint (getVariantsByIdItems)
 * to fetch items for specific variants, rather than the paginated list endpoint.
 * This is maintained for backward compatibility with the product detail view.
 */
export function useItems(
  productId: string | undefined,
  variants: Array<{ id: string }> | undefined,
) {
  const [items, setItems] = useState<ItemModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);

  const { callApi: listApi, loading: loadingList } = useApiRequest(
    getVariantsByIdItems,
    { showSuccess: false, showError: false },
  );
  const { callApi: createApi, loading: creating } = useApiRequest(postItems);
  const { callApi: updateApi, loading: updating } = useApiRequest(putItemsById);
  const { callApi: deleteApi, loading: deleting } =
    useApiRequest(deleteItemsById);

  const listApiRef = useRef(listApi);
  useEffect(() => {
    listApiRef.current = listApi;
  }, [listApi]);

  const refetch = useCallback(async () => {
    if (!productId || !variants) return;
    setError(null);
    const results: ItemModel[] = [];
    let hasError = false;
    await Promise.all(
      variants.map(async (v) => {
        const res = await listApiRef.current({
          path: { id: v.id },
          query: { Page: 1, PageSize: 1000, SearchTerm: undefined },
        });
        if (res && res.items && Array.isArray(res.items)) {
          results.push(...res.items);
        } else if (res && Array.isArray(res)) {
          results.push(...res);
        } else {
          hasError = true;
        }
      }),
    );
    if (hasError) {
      setError({
        message:
          'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
      });
    } else {
      setItems(results);
    }
  }, [productId, variants]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, variants]);

  const createItem = useCallback(
    async (body: CreateOrUpdateItemModel) => {
      const res = await createApi({ body: body });
      await refetch();
      return res;
    },
    [createApi, refetch],
  );

  const updateItem = useCallback(
    async (id: string, body: CreateOrUpdateItemModel) => {
      const res = await updateApi({
        path: { id },
        body: body,
      });
      await refetch();
      return res;
    },
    [updateApi, refetch],
  );

  const deleteItem = useCallback(
    async (id: string) => {
      const res = await deleteApi({ path: { id } });
      await refetch();
      return res;
    },
    [deleteApi, refetch],
  );

  return {
    items,
    isLoading: loadingList,
    isCreating: creating,
    isUpdating: updating,
    isDeleting: deleting,
    error,
    createItem,
    updateItem,
    deleteItem,
    refetch,
  };
}
