import {
  getAppointmentsPaginated,
  postAppointments,
  putAppointmentsById,
  deleteAppointmentsById,
  type CreateOrUpdateAppointmentModel,
  type AppointmentModel,
} from '@/api';
import { useCrudList } from '@/hooks/useCrudList';

export function useAppointments() {
  const {
    items,
    state,
    error,
    isLoading,
    isInitialLoading,
    isCreating,
    isUpdating,
    isDeleting,
    goToPage,
    setPageSize,
    nextPage,
    previousPage,
    setSearchTerm,
    create,
    update,
    delete: deleteItem,
    refetch,
  } = useCrudList<
    AppointmentModel,
    CreateOrUpdateAppointmentModel,
    CreateOrUpdateAppointmentModel
  >(
    getAppointmentsPaginated,
    postAppointments,
    putAppointmentsById,
    deleteAppointmentsById,
    { initialPageSize: 20 },
  );

  const createAppointment = (body: CreateOrUpdateAppointmentModel) =>
    create(body);
  const updateAppointment = (
    id: string,
    body: CreateOrUpdateAppointmentModel,
  ) => update(id, body);
  const deleteAppointment = (id: string) => deleteItem(id);

  return {
    appointments: items,
    state,
    error,
    isLoading,
    isInitialLoading,
    isCreating,
    isUpdating,
    isDeleting,
    goToPage,
    setPageSize,
    nextPage,
    previousPage,
    setSearchTerm,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetch,
  };
}
