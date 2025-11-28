import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getProducts,
  postProducts,
  putProductsById,
  deleteProductsById,
  type CreateOrUpdateProductModel,
  type ProductModel,
} from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';

export function useProducts() {
  const [items, setItems] = useState<ProductModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const { callApi: fetchApi, loading: loadingList } = useApiRequest(
    getProducts,
    { showSuccess: false, showError: false },
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
    setError(null);
    const res = await fetchApiRef.current({});
    if (res) {
      setItems(res);
    } else {
      setError({
        message: 'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
      });
    }
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createProduct = useCallback(
    async (body: CreateOrUpdateProductModel) => {
      const res = await createApi({ body: body });
      await refetch();
      return res;
    },
    [createApi, refetch],
  );

  const updateProduct = useCallback(
    async (id: string, body: CreateOrUpdateProductModel) => {
      const res = await updateApi({
        path: { id },
        body: body,
      });
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

  const initialLoading = loadingList && items.length === 0 && !error;

  return {
    products: items,
    initialLoading,
    loadingList,
    isLoading: loadingList,
    isCreating: creating,
    isUpdating: updating,
    isDeleting: deleting,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch,
  };
}
