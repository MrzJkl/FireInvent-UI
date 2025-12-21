import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getAppointmentsById,
  getAppointmentsByIdVisits,
  putAppointmentsById,
  postVisits,
  putVisitsById,
  deleteVisitsById,
  getVisitsByIdItems,
  postVisitItems,
  putVisitItemsById,
  deleteVisitItemsById,
  type VisitModel,
  type VisitItemModel,
  type CreateOrUpdateVisitModel,
  type CreateOrUpdateVisitItemModel,
  type CreateOrUpdateAppointmentModel,
} from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';

export function useAppointmentDetail(appointmentId: string | undefined) {
  const [appointment, setAppointment] = useState<any>(null);
  const [visits, setVisits] = useState<VisitModel[]>([]);
  const [visitItems, setVisitItems] = useState<VisitItemModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);

  const { callApi: fetchAppointmentApi, loading: appointmentLoading } =
    useApiRequest(getAppointmentsById, {
      showSuccess: false,
      showError: false,
    });
  const { callApi: fetchVisitsApi, loading: visitsLoading } = useApiRequest(
    getAppointmentsByIdVisits,
    { showSuccess: false, showError: false },
  );
  const { callApi: fetchVisitItemsApi, loading: itemsLoading } = useApiRequest(
    getVisitsByIdItems,
    { showSuccess: false, showError: false },
  );

  const { callApi: updateAppointmentApi, loading: updatingAppointment } =
    useApiRequest(putAppointmentsById);
  const { callApi: createVisitApi, loading: creatingVisit } =
    useApiRequest(postVisits);
  const { callApi: updateVisitApi, loading: updatingVisit } =
    useApiRequest(putVisitsById);
  const { callApi: deleteVisitApi, loading: deletingVisit } =
    useApiRequest(deleteVisitsById);

  const { callApi: createVisitItemApi, loading: creatingVisitItem } =
    useApiRequest(postVisitItems);
  const { callApi: updateVisitItemApi, loading: updatingVisitItem } =
    useApiRequest(putVisitItemsById);
  const { callApi: deleteVisitItemApi, loading: deletingVisitItem } =
    useApiRequest(deleteVisitItemsById);

  const fetchAppointmentApiRef = useRef(fetchAppointmentApi);
  const fetchVisitsApiRef = useRef(fetchVisitsApi);
  const fetchVisitItemsApiRef = useRef(fetchVisitItemsApi);

  useEffect(() => {
    fetchAppointmentApiRef.current = fetchAppointmentApi;
    fetchVisitsApiRef.current = fetchVisitsApi;
    fetchVisitItemsApiRef.current = fetchVisitItemsApi;
  }, [fetchAppointmentApi, fetchVisitsApi, fetchVisitItemsApi]);

  const refetch = useCallback(async () => {
    if (!appointmentId) return;
    setError(null);

    const appointmentRes = await fetchAppointmentApiRef.current({
      path: { id: appointmentId },
    });
    if (appointmentRes) {
      setAppointment(appointmentRes);
    }

    const visitsRes = await fetchVisitsApiRef.current({
      path: { id: appointmentId },
    });
    if (visitsRes) {
      setVisits(visitsRes);

      // Load visit items for all visits
      if (visitsRes.length > 0) {
        const allVisitItems = await Promise.all(
          visitsRes.map(async (visit) => {
            const itemsRes = await fetchVisitItemsApiRef.current({
              path: { id: visit.id },
            });
            return itemsRes || [];
          }),
        );
        setVisitItems(allVisitItems.flat());
      } else {
        setVisitItems([]);
      }
    } else {
      setError({
        message:
          'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
      });
    }
  }, [appointmentId]);

  const fetchVisitItems = useCallback(async (visitId: string) => {
    const res = await fetchVisitItemsApiRef.current({
      path: { id: visitId },
    });
    if (res) {
      setVisitItems(res);
    }
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const updateAppointment = useCallback(
    async (id: string, body: CreateOrUpdateAppointmentModel) => {
      const res = await updateAppointmentApi({ path: { id }, body });
      await refetch();
      return res;
    },
    [updateAppointmentApi, refetch],
  );

  const createVisit = useCallback(
    async (body: CreateOrUpdateVisitModel) => {
      const res = await createVisitApi({ body });
      await refetch();
      return res;
    },
    [createVisitApi, refetch],
  );

  const updateVisit = useCallback(
    async (id: string, body: CreateOrUpdateVisitModel) => {
      const res = await updateVisitApi({ path: { id }, body });
      await refetch();
      return res;
    },
    [updateVisitApi, refetch],
  );

  const deleteVisit = useCallback(
    async (id: string) => {
      await deleteVisitApi({ path: { id } });
      await refetch();
    },
    [deleteVisitApi, refetch],
  );

  const createVisitItem = useCallback(
    async (body: CreateOrUpdateVisitItemModel) => {
      const res = await createVisitItemApi({ body });
      if (res && body.visitId) {
        await fetchVisitItems(body.visitId);
      }
      return res;
    },
    [createVisitItemApi, fetchVisitItems],
  );

  const updateVisitItem = useCallback(
    async (id: string, body: CreateOrUpdateVisitItemModel) => {
      const res = await updateVisitItemApi({ path: { id }, body });
      if (res && body.visitId) {
        await fetchVisitItems(body.visitId);
      }
      return res;
    },
    [updateVisitItemApi, fetchVisitItems],
  );

  const deleteVisitItem = useCallback(
    async (id: string, visitId: string) => {
      await deleteVisitItemApi({ path: { id } });
      await fetchVisitItems(visitId);
    },
    [deleteVisitItemApi, fetchVisitItems],
  );

  return {
    appointment,
    visits,
    visitItems,
    error,
    appointmentLoading: appointmentLoading && !appointment,
    visitsLoading: visitsLoading && visits.length === 0,
    itemsLoading,
    updating: updatingAppointment,
    creatingVisit,
    updatingVisit,
    deletingVisit,
    creatingVisitItem,
    updatingVisitItem,
    deletingVisitItem,
    updateAppointment,
    createVisit,
    updateVisit,
    deleteVisit,
    createVisitItem,
    updateVisitItem,
    deleteVisitItem,
    fetchVisitItems,
    refetch,
  };
}
