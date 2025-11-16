import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiRequest } from '@/hooks/useApiRequest';
import {
  deleteProductTypesById,
  getProductTypes,
  postProductTypes,
  putProductTypesById,
  type CreateProductTypeModel,
  type ProductTypeModel,
} from '@/api';

export function useProductTypes() {
  const [items, setItems] = useState<ProductTypeModel[]>([]);

  const { callApi: fetchApi, loading: loadingList } = useApiRequest(
    getProductTypes,
    { showSuccess: false },
  );
  const { callApi: createApi, loading: creating } =
    useApiRequest(postProductTypes);
  const { callApi: updateApi, loading: updating } =
    useApiRequest(putProductTypesById);
  const { callApi: deleteApi, loading: deleting } = useApiRequest(
    deleteProductTypesById,
  );

  const fetchApiRef = useRef(fetchApi);
  useEffect(() => {
    fetchApiRef.current = fetchApi;
  }, [fetchApi]);

  const refetch = useCallback(async () => {
    const res = await fetchApiRef.current({});
    if (res) setItems(res);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createItem = useCallback(
    async (body: CreateProductTypeModel) => {
      const res = await createApi({ body });
      await refetch();
      return res;
    },
    [createApi, refetch],
  );

  const updateItem = useCallback(
    async (item: ProductTypeModel) => {
      const res = await updateApi({ path: { id: item.id }, body: item });
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

  const initialLoading = loadingList && items.length === 0;

  return {
    items,
    initialLoading,
    loadingList,
    creating,
    updating,
    deleting,
    refetch,
    createItem,
    updateItem,
    deleteItem,
  };
}
