import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getManufacturersById,
  getManufacturersByIdProducts,
  type ManufacturerModel,
  type ProductModel,
} from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';

export function useManufacturerDetail(manufacturerId: string) {
  const [manufacturer, setManufacturer] = useState<ManufacturerModel | null>(
    null,
  );
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);

  const { callApi: fetchManufacturer } = useApiRequest(getManufacturersById, {
    showSuccess: false,
    showError: false,
  });
  const { callApi: fetchProducts } = useApiRequest(
    getManufacturersByIdProducts,
    {
      showSuccess: false,
      showError: false,
    },
  );

  // Stabilize API call functions to avoid refetch loops when hooks recreate callApi
  const fetchManufacturerRef = useRef(fetchManufacturer);
  const fetchProductsRef = useRef(fetchProducts);

  useEffect(() => {
    fetchManufacturerRef.current = fetchManufacturer;
    fetchProductsRef.current = fetchProducts;
  }, [fetchManufacturer, fetchProducts]);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const manufacturerRes = await fetchManufacturerRef.current({
        path: { id: manufacturerId },
      });
      const productsRes = await fetchProductsRef.current({
        path: { id: manufacturerId },
      });

      if (manufacturerRes) {
        setManufacturer(manufacturerRes);
      }
      if (productsRes) {
        setProducts(productsRes);
      }

      if (!manufacturerRes) {
        setError({
          message: 'Hersteller konnte nicht geladen werden.',
        });
      }
    } catch {
      setError({
        message: 'Ein Fehler ist aufgetreten.',
      });
    }
  }, [manufacturerId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    manufacturer,
    products,
    error,
    refetch,
  };
}
