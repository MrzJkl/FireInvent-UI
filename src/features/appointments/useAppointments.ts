import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getAppointments,
  postAppointments,
  putAppointmentsById,
  deleteAppointmentsById,
  type CreateOrUpdateAppointmentModel,
  type AppointmentModel,
} from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';

export function useAppointments() {
  const [items, setItems] = useState<AppointmentModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);

  const { callApi: listApi, loading: loadingList } = useApiRequest(
    getAppointments,
    { showSuccess: false, showError: false },
  );
  const { callApi: createApi, loading: creating } =
    useApiRequest(postAppointments);
  const { callApi: updateApi, loading: updating } =
    useApiRequest(putAppointmentsById);
  const { callApi: deleteApi, loading: deleting } = useApiRequest(
    deleteAppointmentsById,
  );

  const listApiRef = useRef(listApi);
  useEffect(() => {
    listApiRef.current = listApi;
  }, [listApi]);

  const refetch = useCallback(async () => {
    setError(null);
    const res = await listApiRef.current({});
    if (res) {
      setItems(res);
    } else {
      setError({
        message:
          'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
      });
    }
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createAppointment = useCallback(
    async (body: CreateOrUpdateAppointmentModel) => {
      const res = await createApi({ body });
      await refetch();
      return res;
    },
    [createApi, refetch],
  );

  const updateAppointment = useCallback(
    async (id: string, body: CreateOrUpdateAppointmentModel) => {
      const res = await updateApi({
        path: { id },
        body,
      });
      await refetch();
      return res;
    },
    [updateApi, refetch],
  );

  const deleteAppointment = useCallback(
    async (id: string) => {
      const res = await deleteApi({ path: { id } });
      await refetch();
      return res;
    },
    [deleteApi, refetch],
  );

  const initialLoading = loadingList && items.length === 0 && !error;

  return {
    appointments: items,
    initialLoading,
    loadingList,
    creating,
    updating,
    deleting,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetch,
  };
}
