import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAppointments } from '@/features/appointments/useAppointments';
import {
  AppointmentFormDialog,
  type AppointmentFormValues,
} from '@/features/appointments/AppointmentFormDialog';
import { useAuthorization } from '@/auth/permissions';

export function AppointmentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canEditCatalog } = useAuthorization();

  const {
    appointments,
    initialLoading,
    creating,
    updating,
    deleting,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetch,
  } = useAppointments();

  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<
    (typeof appointments)[0] | null
  >(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<
    (typeof appointments)[0] | null
  >(null);

  const handleCreate = async (values: AppointmentFormValues) => {
    const dateObj = new Date(values.scheduledAt);
    await createAppointment({
      scheduledAt: dateObj,
      description: values.description || undefined,
    });
    setFormOpen(false);
  };

  const handleEdit = async (values: AppointmentFormValues) => {
    if (!editingAppointment) return;
    const dateObj = new Date(values.scheduledAt);
    await updateAppointment(editingAppointment.id!, {
      scheduledAt: dateObj,
      description: values.description || undefined,
    });
    setFormOpen(false);
    setEditingAppointment(null);
  };

  const handleRowClick = (appointmentId: string) => {
    navigate(`/app/appointments/${appointmentId}`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (initialLoading) return <LoadingIndicator />;

  const showActions = canEditCatalog;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('appointmentPlural')}</h1>
        {showActions && (
          <Button
            onClick={() => {
              setEditingAppointment(null);
              setFormOpen(true);
            }}
          >
            {t('add')}
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('appointmentDate')}</TableHead>
            <TableHead>{t('description')}</TableHead>
            {showActions && <TableHead>{t('actions')}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow
              key={appointment.id}
              onClick={() => handleRowClick(appointment.id!)}
              className="cursor-pointer"
            >
              <TableCell>{formatDate(appointment.scheduledAt)}</TableCell>
              <TableCell>{appointment.description || '-'}</TableCell>
              {showActions && (
                <TableCell
                  className="flex space-x-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingAppointment(appointment);
                      setFormOpen(true);
                    }}
                  >
                    {t('edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setAppointmentToDelete(appointment);
                      setConfirmOpen(true);
                    }}
                  >
                    {t('delete')}
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showActions && (
        <>
          <AppointmentFormDialog
            open={formOpen}
            mode={editingAppointment ? 'edit' : 'create'}
            initialValues={
              editingAppointment
                ? {
                    scheduledAt: new Date(
                      editingAppointment.scheduledAt,
                    ).toISOString(),
                    description: editingAppointment.description || '',
                  }
                : undefined
            }
            loading={creating || updating}
            onSubmit={editingAppointment ? handleEdit : handleCreate}
            onOpenChange={(open) => {
              setFormOpen(open);
              if (!open) {
                setEditingAppointment(null);
              }
            }}
          />

          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={(o) => {
              setConfirmOpen(o);
              if (!o) setAppointmentToDelete(null);
            }}
            title={t('confirmDeleteTitle')}
            description={t('confirmDeleteDescription', {
              name: appointmentToDelete
                ? formatDate(appointmentToDelete.scheduledAt)
                : '',
            })}
            confirmLabel={t('delete')}
            cancelLabel={t('cancel')}
            confirmVariant="destructive"
            confirmDisabled={deleting}
            onConfirm={async () => {
              if (!appointmentToDelete) return;
              await deleteAppointment(appointmentToDelete.id!);
              setConfirmOpen(false);
              setAppointmentToDelete(null);
            }}
          />
        </>
      )}
    </div>
  );
}
