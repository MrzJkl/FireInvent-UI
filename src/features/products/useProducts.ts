import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getProducts,
  postProducts,
  putProductsById,
  deleteProductsById,
  type CreateOrUpdateProductModel,
  type ProductModel,
} from '@/api';
import { useApiRequest } from '@/hooks/useApiRequest';

export function useProducts() {
  const [items, setItems] = useState<ProductModel[]>([]);
  const { callApi: fetchApi, loading: loadingList } = useApiRequest(
    getProducts,
    { showSuccess: false },
  );
  const { callApi: createApi, loading: creating } = useApiRequest(postProducts);
  const { callApi: updateApi, loading: updating } =
    useApiRequest(putProductsById);
  const { callApi: deleteApi, loading: deleting } =
    useApiRequest(deleteProductsById);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createProduct = useCallback(
    async (body: CreateOrUpdateProductModel) => {
      const res = await createApi({ body });
      await refetch();
      return res;
    },
    [createApi, refetch],
  );

  const updateProduct = useCallback(
    async (id: string, body: CreateOrUpdateProductModel) => {
      const res = await updateApi({ path: { id }, body });
      await refetch();
      return res;
    },
    [updateApi, refetch],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const res = await deleteApi({ path: { id } });
      await refetch();
      return res;
    },
    [deleteApi, refetch],
  );

  const initialLoading = loadingList && items.length === 0;

  return {
    products: items,
    initialLoading,
    loadingList,
    isLoading: loadingList,
    isCreating: creating,
    isUpdating: updating,
    isDeleting: deleting,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch,
  };
}
