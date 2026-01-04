import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    state,
    isInitialLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetch,
    nextPage,
    previousPage,
    setPageSize,
    setSearchTerm,
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
    await createAppointment({
      scheduledAt: values.scheduledAt,
      description: values.description || undefined,
    });
    setFormOpen(false);
  };

  const handleEdit = async (values: AppointmentFormValues) => {
    if (!editingAppointment) return;
    await updateAppointment(editingAppointment.id!, {
      scheduledAt: values.scheduledAt,
      description: values.description || undefined,
    });
    setFormOpen(false);
    setEditingAppointment(null);
  };

  const handleRowClick = (appointmentId: string) => {
    navigate(`/app/appointments/${appointmentId}`);
  };

  const formatDate = (dateIso: string) => {
    return new Date(dateIso).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isInitialLoading) return <LoadingIndicator />;

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

      <div className="mb-4 flex items-center gap-4">
        <Input
          placeholder={t('search') + '...'}
          className="max-w-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="text-sm text-muted-foreground">
          {state.totalItems} {t('appointmentPlural')}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('appointmentDate')}</TableHead>
              <TableHead>{t('description')}</TableHead>
              {showActions && <TableHead>{t('actions')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 3 : 2}
                  className="h-24 text-center"
                >
                  {t('noResults')}
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{t('rowsPerPage')}</p>
          <Select
            value={state.pageSize.toString()}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-17.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-sm font-medium">
            {t('page')} {state.page} {t('of')} {state.totalPages || 1}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={state.page <= 1}
            >
              {t('previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={state.page >= (state.totalPages || 1)}
            >
              {t('next')}
            </Button>
          </div>
        </div>
      </div>

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
            loading={isCreating || isUpdating}
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
            confirmDisabled={isDeleting}
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
