import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getStorageLocationsById,
  getStorageLocationsByIdAssignments,
  type ItemAssignmentHistoryModel,
  type StorageLocationModel,
} from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';

export function useStorageLocationDetail(
  storageLocationId: string | undefined,
) {
  const [storageLocation, setStorageLocation] =
    useState<StorageLocationModel | null>(null);
  const [assignments, setAssignments] = useState<ItemAssignmentHistoryModel[]>(
    [],
  );
  const [error, setError] = useState<ApiError | null>(null);

  const { callApi: fetchLocation, loading: loadingLocation } = useApiRequest(
    getStorageLocationsById,
    { showSuccess: false, showError: false },
  );
  const { callApi: fetchAssignments, loading: loadingAssignments } =
    useApiRequest(getStorageLocationsByIdAssignments, {
      showSuccess: false,
      showError: false,
    });

  const fetchLocationRef = useRef(fetchLocation);
  const fetchAssignmentsRef = useRef(fetchAssignments);

  useEffect(() => {
    fetchLocationRef.current = fetchLocation;
    fetchAssignmentsRef.current = fetchAssignments;
  }, [fetchLocation, fetchAssignments]);

  const refetch = useCallback(async () => {
    if (!storageLocationId) return;
    setError(null);
    try {
      const locationRes = await fetchLocationRef.current({
        path: { id: storageLocationId },
      });
      const assignmentsRes = await fetchAssignmentsRef.current({
        path: { id: storageLocationId },
      });

      if (locationRes) setStorageLocation(locationRes);

      if (assignmentsRes) {
        // Handle both array (old) and PagedResult (new) formats
        const assignmentsArray = Array.isArray(assignmentsRes)
          ? assignmentsRes
          : assignmentsRes?.items || [];
        setAssignments(assignmentsArray);
      }

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
    (loadingLocation || loadingAssignments) && !storageLocation && !error;

  return {
    storageLocation,
    assignments,
    initialLoading,
    isLoading: loadingLocation || loadingAssignments,
    error,
    refetch,
  };
}
