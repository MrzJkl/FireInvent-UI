import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getStorageLocationsById,
  getStorageLocationsByIdItems,
  type ItemModel,
  type StorageLocationModel,
} from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';

export function useStorageLocationDetail(
  storageLocationId: string | undefined,
) {
  const [storageLocation, setStorageLocation] =
    useState<StorageLocationModel | null>(null);
  const [items, setItems] = useState<ItemModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);

  const { callApi: fetchLocation, loading: loadingLocation } = useApiRequest(
    getStorageLocationsById,
    { showSuccess: false, showError: false },
  );
  const { callApi: fetchItems, loading: loadingItems } = useApiRequest(
    getStorageLocationsByIdItems,
    { showSuccess: false, showError: false },
  );

  const fetchLocationRef = useRef(fetchLocation);
  const fetchItemsRef = useRef(fetchItems);

  useEffect(() => {
    fetchLocationRef.current = fetchLocation;
    fetchItemsRef.current = fetchItems;
  }, [fetchLocation, fetchItems]);

  const refetch = useCallback(async () => {
    if (!storageLocationId) return;
    setError(null);
    try {
      const locationRes = await fetchLocationRef.current({
        path: { id: storageLocationId },
      });
      const itemsRes = await fetchItemsRef.current({
        path: { id: storageLocationId },
      });

      if (locationRes) setStorageLocation(locationRes);
      if (itemsRes) setItems(itemsRes);

      if (!locationRes) {
        setError({ message: 'Lagerort konnte nicht geladen werden.' });
      }
    } catch {
      setError({ message: 'Ein Fehler ist aufgetreten.' });
    }
  }, [storageLocationId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const initialLoading =
    (loadingLocation || loadingItems) && !storageLocation && !error;

  return {
    storageLocation,
    items,
    initialLoading,
    isLoading: loadingLocation || loadingItems,
    error,
    refetch,
  };
}
