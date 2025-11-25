import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getVariantsByIdItems,
  postItems,
  putItemsById,
  deleteItemsById,
  type CreateOrUpdateItemModel,
  type ItemModel,
} from '@/api';
import { useApiRequest } from '@/hooks/useApiRequest';

export function useItems(
  productId: string | undefined,
  variants: Array<{ id: string }> | undefined,
) {
  const [items, setItems] = useState<ItemModel[]>([]);

  const { callApi: listApi, loading: loadingList } = useApiRequest(
    getVariantsByIdItems,
    { showSuccess: false },
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
    const results: ItemModel[] = [];
    await Promise.all(
      variants.map(async (v) => {
        const res = await listApiRef.current({ path: { id: v.id } });
        if (res && Array.isArray(res)) {
          results.push(...res);
        }
      }),
    );
    setItems(results);
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
    createItem,
    updateItem,
    deleteItem,
    refetch,
  };
}
