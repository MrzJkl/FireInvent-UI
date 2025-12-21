import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { useAppointments } from '@/features/appointments/useAppointments';
import {
  AppointmentFormDialog,
  type AppointmentFormValues,
} from '@/features/appointments/AppointmentFormDialog';

export function AppointmentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  } = useAppointments();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<
    (typeof appointments)[0] | null
  >(null);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<
    string | null
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

  const handleDelete = async () => {
    if (!deletingAppointmentId) return;
    await deleteAppointment(deletingAppointmentId);
    setDeleteConfirmOpen(false);
    setDeletingAppointmentId(null);
  };

  const handleRowClick = (appointmentId: string) => {
    navigate(`/app/appointments/${appointmentId}`);
  };

  const handleEditClick = (
    e: React.MouseEvent,
    appointment: (typeof appointments)[0],
  ) => {
    e.stopPropagation();
    setEditingAppointment(appointment);
    setFormOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, appointmentId: string) => {
    e.stopPropagation();
    setDeletingAppointmentId(appointmentId);
    setDeleteConfirmOpen(true);
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

  if (initialLoading) return <LoadingIndicator />;
  if (error && appointments.length === 0) return <ErrorState error={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('appointmentPlural')}</h1>
        </div>
        <Button onClick={() => setFormOpen(true)} disabled={creating}>
          {t('add')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('appointmentPlural')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('appointmentDate')}</TableHead>
                <TableHead>{t('description')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
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
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleEditClick(e, appointment)}
                      disabled={updating}
                    >
                      {t('edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleDeleteClick(e, appointment.id!)}
                      disabled={deleting}
                    >
                      {t('delete')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AppointmentFormDialog
        open={formOpen}
        mode={editingAppointment ? 'edit' : 'create'}
        initialValues={
          editingAppointment
            ? {
                scheduledAt: new Date(editingAppointment.scheduledAt)
                  .toISOString()
                  .slice(0, 16),
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

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirm')}</DialogTitle>
            <DialogDescription>
              {t('appointments.deleteConfirm')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {t('delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
