import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  IconChevronDown,
  IconChevronRight,
  IconArrowLeft,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { useAppointmentDetail } from '@/features/appointments/useAppointmentDetail';
import {
  AppointmentFormDialog,
  type AppointmentFormValues,
} from '@/features/appointments/AppointmentFormDialog';
import {
  VisitFormDialog,
  type VisitFormValues,
} from '@/features/appointments/VisitFormDialog';
import {
  VisitItemFormDialog,
  type VisitItemFormValues,
} from '@/features/appointments/VisitItemFormDialog';
import { useAuthorization } from '@/auth/permissions';

export function AppointmentDetailPage() {
  const { t } = useTranslation();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { canEditCatalog } = useAuthorization();
  const canManage = canEditCatalog;

  const {
    appointment,
    visits,
    visitItems,
    appointmentLoading,
    visitsLoading,
    error,
    updating,
    createVisit,
    updateVisit,
    deleteVisit,
    createVisitItem,
    updateVisitItem,
    deleteVisitItem,
    updateAppointment,
  } = useAppointmentDetail(appointmentId);

  const [appointmentFormOpen, setAppointmentFormOpen] = useState(false);
  const [visitFormOpen, setVisitFormOpen] = useState(false);
  const [visitItemFormOpen, setVisitItemFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<(typeof visits)[0] | null>(
    null,
  );
  const [editingVisitItem, setEditingVisitItem] = useState<
    (typeof visitItems)[0] | null
  >(null);
  const [expandedVisits, setExpandedVisits] = useState<Record<string, boolean>>(
    {},
  );
  const [createForVisitId, setCreateForVisitId] = useState<string | null>(null);
  const [deleteItemType, setDeleteItemType] = useState<'visit' | 'visitItem'>(
    'visit',
  );

  const getPersonName = (
    firstName?: string | null,
    lastName?: string | null,
    contactInfo?: string | null,
  ) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return contactInfo || '-';
  };

  const handleCreateVisit = async (values: VisitFormValues) => {
    if (!appointmentId) return;
    await createVisit({
      appointmentId,
      personId: values.personId,
    });
    setVisitFormOpen(false);
  };

  const handleEditVisit = async (values: VisitFormValues) => {
    if (!editingVisit || !appointmentId) return;
    await updateVisit(editingVisit.id, {
      appointmentId,
      personId: values.personId,
    });
    setVisitFormOpen(false);
    setEditingVisit(null);
  };

  const handleDeleteVisit = async () => {
    if (!editingVisit) return;
    await deleteVisit(editingVisit.id);
    setDeleteConfirmOpen(false);
    setEditingVisit(null);
  };

  const handleCreateVisitItem = async (values: VisitItemFormValues) => {
    if (!createForVisitId) return;
    await createVisitItem({
      visitId: createForVisitId,
      productId: values.productId,
      quantity: parseInt(values.quantity),
    });
    setVisitItemFormOpen(false);
  };

  const handleEditVisitItem = async (values: VisitItemFormValues) => {
    if (!editingVisitItem || !createForVisitId) return;
    await updateVisitItem(editingVisitItem.id, {
      visitId: createForVisitId,
      productId: values.productId,
      quantity: parseInt(values.quantity),
    });
    setVisitItemFormOpen(false);
    setEditingVisitItem(null);
  };

  const handleDeleteVisitItem = async () => {
    if (!editingVisitItem) return;
    await deleteVisitItem(editingVisitItem.id, editingVisitItem.visitId);
    setDeleteConfirmOpen(false);
    setEditingVisitItem(null);
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

  const handleUpdateAppointment = async (values: AppointmentFormValues) => {
    if (!appointmentId) return;
    await updateAppointment(appointmentId, {
      scheduledAt: new Date(values.scheduledAt),
      description: values.description || undefined,
    });
    setAppointmentFormOpen(false);
  };

  if (appointmentLoading) return <LoadingIndicator />;
  if (error && !appointment) return <ErrorState error={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/app/appointments')}
        >
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t('appointmentDetails')}</h1>
          <p className="text-gray-600">
            {appointment && formatDate(appointment.scheduledAt)}
          </p>
        </div>
        <div className="ml-auto space-x-2">
          <Button
            variant="outline"
            onClick={() => setAppointmentFormOpen(true)}
          >
            {t('edit')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">{t('details')}</TabsTrigger>
          <TabsTrigger value="visits">{t('visitPlural')}</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('appointmentDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">{t('appointmentDate')}</p>
                <p className="text-lg font-semibold">
                  {appointment && formatDate(appointment.scheduledAt)}
                </p>
              </div>
              {appointment?.description && (
                <div>
                  <p className="text-sm text-gray-600">{t('description')}</p>
                  <p className="text-lg font-semibold">
                    {appointment.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('visitPlural')}</CardTitle>
              {canManage && (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingVisit(null);
                    setVisitFormOpen(true);
                  }}
                >
                  {t('add')}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {visitsLoading ? (
                <LoadingIndicator />
              ) : visits.length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  {t('noData')}
                </div>
              ) : (
                <div className="space-y-2">
                  {visits.map((visit) => {
                    const isOpen = !!expandedVisits[visit.id];
                    const visitItemsForThisVisit = visitItems.filter(
                      (item) => item.visitId === visit.id,
                    );
                    const itemCount = visitItemsForThisVisit.length;

                    return (
                      <div key={visit.id} className="rounded border">
                        <div className="flex items-start justify-between p-3">
                          <div className="flex items-start gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={isOpen ? t('hide') : t('show')}
                              onClick={() =>
                                setExpandedVisits((prev) => ({
                                  ...prev,
                                  [visit.id]: !prev[visit.id],
                                }))
                              }
                            >
                              {isOpen ? (
                                <IconChevronDown className="size-4" />
                              ) : (
                                <IconChevronRight className="size-4" />
                              )}
                            </Button>
                            <div className="space-y-1">
                              <p className="font-medium">
                                {getPersonName(
                                  visit.person?.firstName,
                                  visit.person?.lastName,
                                  visit.person?.contactInfo,
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {itemCount}{' '}
                                {itemCount === 1
                                  ? t('visitItem')
                                  : t('visitItemPlural')}
                              </p>
                            </div>
                          </div>
                          {canManage && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingVisit(visit);
                                  setVisitFormOpen(true);
                                }}
                              >
                                {t('edit')}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setEditingVisit(visit);
                                  setDeleteItemType('visit');
                                  setDeleteConfirmOpen(true);
                                }}
                              >
                                {t('delete')}
                              </Button>
                            </div>
                          )}
                        </div>
                        {isOpen && (
                          <div className="border-t p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <p className="text-sm font-medium">
                                {t('visitItemPlural')}
                              </p>
                              {canManage && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setEditingVisitItem(null);
                                    setCreateForVisitId(visit.id);
                                    setVisitItemFormOpen(true);
                                  }}
                                >
                                  {t('add')}
                                </Button>
                              )}
                            </div>
                            {visitItemsForThisVisit.length === 0 ? (
                              <div className="flex h-16 items-center justify-center text-muted-foreground">
                                {t('noData')}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {visitItemsForThisVisit.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-start justify-between rounded border p-2"
                                  >
                                    <div>
                                      <p className="text-sm font-medium">
                                        {item.product?.name || '-'}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {t('quantity')}: {item.quantity}
                                      </p>
                                    </div>
                                    {canManage && (
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setEditingVisitItem(item);
                                            setCreateForVisitId(visit.id);
                                            setVisitItemFormOpen(true);
                                          }}
                                        >
                                          {t('edit')}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => {
                                            setEditingVisitItem(item);
                                            setDeleteItemType('visitItem');
                                            setDeleteConfirmOpen(true);
                                          }}
                                        >
                                          {t('delete')}
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AppointmentFormDialog
        open={appointmentFormOpen}
        mode="edit"
        initialValues={
          appointment
            ? {
                scheduledAt: new Date(appointment.scheduledAt)
                  .toISOString()
                  .slice(0, 16),
                description: appointment.description || '',
              }
            : undefined
        }
        loading={updating}
        onSubmit={handleUpdateAppointment}
        onOpenChange={setAppointmentFormOpen}
      />

      <VisitFormDialog
        open={visitFormOpen}
        mode={editingVisit ? 'edit' : 'create'}
        appointmentId={appointmentId || ''}
        initialValues={
          editingVisit
            ? {
                personId: editingVisit.personId,
              }
            : undefined
        }
        onSubmit={editingVisit ? handleEditVisit : handleCreateVisit}
        onOpenChange={(open) => {
          setVisitFormOpen(open);
          if (!open) {
            setEditingVisit(null);
          }
        }}
      />

      <VisitItemFormDialog
        open={visitItemFormOpen}
        mode={editingVisitItem ? 'edit' : 'create'}
        visitId={createForVisitId || editingVisitItem?.visitId || ''}
        initialValues={
          editingVisitItem
            ? {
                productId: editingVisitItem.productId,
                quantity: String(editingVisitItem.quantity),
              }
            : undefined
        }
        onSubmit={
          editingVisitItem ? handleEditVisitItem : handleCreateVisitItem
        }
        onOpenChange={(open) => {
          setVisitItemFormOpen(open);
          if (!open) {
            setEditingVisitItem(null);
            setCreateForVisitId(null);
          }
        }}
      />

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirm')}</DialogTitle>
            <DialogDescription>
              {deleteItemType === 'visit'
                ? t('visits.deleteConfirm')
                : t('visitItems.deleteConfirm')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={
                deleteItemType === 'visit'
                  ? handleDeleteVisit
                  : handleDeleteVisitItem
              }
            >
              {t('delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
