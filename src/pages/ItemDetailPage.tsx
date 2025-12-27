import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ItemAssignmentFormDialog } from '@/features/item-assignments/ItemAssignmentFormDialog';
import { MaintenanceFormDialog } from '@/features/maintenances/MaintenanceFormDialog';
import { useTranslation } from 'react-i18next';
import { IconArrowLeft } from '@tabler/icons-react';
import {
  getItemsById,
  getItemsByIdAssignments,
  getItemsByIdMaintenance,
  putItemsById,
  deleteItemsById,
  postAssignments,
  putAssignmentsById,
  deleteAssignmentsById,
  postMaintenances,
  putMaintenancesById,
  deleteMaintenancesById,
} from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';
import type {
  ItemModel,
  ItemAssignmentHistoryModel,
  MaintenanceModel,
} from '@/api/types.gen';
import { useAuthorization } from '@/auth/permissions';
import { ItemFormDialog } from '@/features/items/ItemFormDialog';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { keycloak } = useKeycloak();
  const { canEditAssignments, canEditMaintenances, canEditCatalog } =
    useAuthorization();
  const canManageAssignments = canEditAssignments;
  const canManageMaintenances = canEditMaintenances;
  const canManageItem = canEditCatalog;

  const [item, setItem] = useState<ItemModel | null>(null);
  const [assignments, setAssignments] = useState<ItemAssignmentHistoryModel[]>(
    [],
  );
  const [maintenances, setMaintenances] = useState<MaintenanceModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [assignmentFormOpen, setAssignmentFormOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(
    null,
  );
  const [deleteAssignmentId, setDeleteAssignmentId] = useState<string | null>(
    null,
  );
  const [confirmAssignmentOpen, setConfirmAssignmentOpen] = useState(false);

  const [maintenanceFormOpen, setMaintenanceFormOpen] = useState(false);
  const [editingMaintenanceId, setEditingMaintenanceId] = useState<
    string | null
  >(null);
  const [deleteMaintenanceId, setDeleteMaintenanceId] = useState<string | null>(
    null,
  );
  const [confirmMaintenanceOpen, setConfirmMaintenanceOpen] = useState(false);

  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [confirmItemDeleteOpen, setConfirmItemDeleteOpen] = useState(false);

  const { callApi: fetchItem, loading: itemLoading } = useApiRequest(
    getItemsById,
    { showSuccess: false, showError: false },
  );
  const { callApi: updateItemApi, loading: updatingItem } =
    useApiRequest(putItemsById);
  const { callApi: deleteItemApi, loading: deletingItem } =
    useApiRequest(deleteItemsById);
  const { callApi: fetchAssignments, loading: assignmentsLoading } =
    useApiRequest(getItemsByIdAssignments, {
      showSuccess: false,
      showError: false,
    });
  const { callApi: fetchMaintenances, loading: maintenancesLoading } =
    useApiRequest(getItemsByIdMaintenance, {
      showSuccess: false,
      showError: false,
    });
  const { callApi: createAssignment, loading: creatingAssignment } =
    useApiRequest(postAssignments);
  const { callApi: updateAssignment, loading: updatingAssignment } =
    useApiRequest(putAssignmentsById);
  const { callApi: deleteAssignment, loading: deletingAssignment } =
    useApiRequest(deleteAssignmentsById);
  const { callApi: createMaintenance, loading: creatingMaintenance } =
    useApiRequest(postMaintenances);
  const { callApi: updateMaintenance, loading: updatingMaintenance } =
    useApiRequest(putMaintenancesById);
  const { callApi: deleteMaintenance, loading: deletingMaintenance } =
    useApiRequest(deleteMaintenancesById);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setError(null);
      const itemData = await fetchItem({ path: { id } });
      if (!itemData) {
        setError({
          message:
            'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
        });
        return;
      }
      setItem(itemData);

      const assignmentsData = await fetchAssignments({ path: { id } });
      if (assignmentsData) setAssignments(assignmentsData);

      const maintenancesData = await fetchMaintenances({ path: { id } });
      if (maintenancesData) setMaintenances(maintenancesData);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const refetchData = async () => {
    if (!id) return;
    setError(null);
    const itemData = await fetchItem({ path: { id } });
    if (!itemData) {
      setError({
        message:
          'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
      });
      return;
    }
    setItem(itemData);

    const assignmentsData = await fetchAssignments({ path: { id } });
    if (assignmentsData) setAssignments(assignmentsData);

    const maintenancesData = await fetchMaintenances({ path: { id } });
    if (maintenancesData) setMaintenances(maintenancesData);
  };

  const refetchAssignments = async () => {
    if (!id) return;
    const assignmentsData = await fetchAssignments({ path: { id } });
    if (assignmentsData) setAssignments(assignmentsData);
  };

  const refetchMaintenances = async () => {
    if (!id) return;
    const maintenancesData = await fetchMaintenances({ path: { id } });
    if (maintenancesData) setMaintenances(maintenancesData);
  };

  const initialLoading = itemLoading && !item && !error;

  if (error) return <ErrorState error={error} onRetry={refetchData} />;
  if (initialLoading) return <LoadingIndicator />;

  if (!item) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('item')} nicht gefunden</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>Zurück</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <IconArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{item.identifier || item.id}</h1>
            <p className="text-sm text-muted-foreground">
              {item.variant?.product ? (
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={() =>
                    navigate(`/app/products/${item.variant.product.id}`)
                  }
                >
                  {item.variant.product.name}
                </Button>
              ) : (
                '–'
              )}
              {' · '}
              {item.variant ? (
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={() =>
                    navigate(
                      `/app/products/${item.variant.productId}?variant=${item.variant.id}`,
                    )
                  }
                >
                  {item.variant.name}
                </Button>
              ) : (
                '–'
              )}
            </p>
          </div>
        </div>
        {canManageItem && item && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setItemFormOpen(true)}>
              {t('edit')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmItemDeleteOpen(true)}
            >
              {t('delete')}
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="item" className="w-full">
        <TabsList>
          <TabsTrigger value="item">{t('item')}</TabsTrigger>
          <TabsTrigger value="assignments">
            {t('itemAssignments.label')}
          </TabsTrigger>
          <TabsTrigger value="maintenances">
            {t('maintenances.label')}
          </TabsTrigger>
        </TabsList>

        {/* Item Tab */}
        <TabsContent value="item" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('identifier')}
                </div>
                <div className="mt-1">{item.identifier || '–'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('product')}
                </div>
                <div className="mt-1">
                  {item.variant?.product ? (
                    <Button
                      variant="link"
                      className="h-auto p-0"
                      onClick={() =>
                        navigate(`/app/products/${item.variant!.product.id}`)
                      }
                    >
                      {item.variant.product.name}
                    </Button>
                  ) : (
                    '–'
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('variant')}
                </div>
                <div className="mt-1">
                  {item.variant ? (
                    <Button
                      variant="link"
                      className="h-auto p-0"
                      onClick={() =>
                        navigate(
                          `/app/products/${item.variant!.productId}?variant=${item.variant!.id}`,
                        )
                      }
                    >
                      {item.variant.name}
                    </Button>
                  ) : (
                    '–'
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('condition')}
                </div>
                <div className="mt-1">
                  {t(`itemCondition.${item.condition}`)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('items.isDemoItem')}
                </div>
                <div className="mt-1">
                  {item.isDemoItem ? t('yes') : t('no')}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('purchaseDate')}
                </div>
                <div className="mt-1">
                  {new Date(item.purchaseDate).toLocaleDateString('de-DE')}
                </div>
              </div>
              {item.retirementDate && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {t('retirementDate')}
                  </div>
                  <div className="mt-1">
                    {new Date(item.retirementDate).toLocaleDateString('de-DE')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('itemAssignments.label')}</CardTitle>
              </div>
              {canManageAssignments && (
                <Button
                  onClick={() => {
                    setEditingAssignmentId(null);
                    setAssignmentFormOpen(true);
                  }}
                >
                  {t('add')}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? (
                <LoadingIndicator />
              ) : assignments.length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  {t('itemAssignments.empty')}
                </div>
              ) : (
                <div className="space-y-2">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="rounded border p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {assignment.person
                            ? `${assignment.person.firstName} ${assignment.person.lastName}`
                            : assignment.storageLocation
                              ? assignment.storageLocation.name
                              : assignment.personId
                                ? `Person ID: ${assignment.personId}`
                                : `Storage Location ID: ${assignment.storageLocationId}`}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              assignment.assignedUntil
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}
                          >
                            {assignment.assignedUntil
                              ? t('itemAssignments.returned')
                              : t('itemAssignments.active')}
                          </span>
                          {canManageAssignments && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingAssignmentId(assignment.id);
                                  setAssignmentFormOpen(true);
                                }}
                              >
                                {t('edit')}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteAssignmentId(assignment.id);
                                  setConfirmAssignmentOpen(true);
                                }}
                              >
                                {t('delete')}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('itemAssignments.assignedFrom')}:{' '}
                        {new Date(assignment.assignedFrom).toLocaleDateString(
                          'de-DE',
                        )}
                      </p>
                      {assignment.assignedUntil && (
                        <p className="text-sm text-muted-foreground">
                          {t('itemAssignments.assignedUntil')}:{' '}
                          {new Date(
                            assignment.assignedUntil,
                          ).toLocaleDateString('de-DE')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenances Tab */}
        <TabsContent value="maintenances" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('maintenances.label')}</CardTitle>
              </div>
              {canManageMaintenances && (
                <Button
                  onClick={() => {
                    setEditingMaintenanceId(null);
                    setMaintenanceFormOpen(true);
                  }}
                >
                  {t('add')}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {maintenancesLoading ? (
                <LoadingIndicator />
              ) : maintenances.length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  {t('maintenances.empty')}
                </div>
              ) : (
                <div className="space-y-2">
                  {maintenances.map((maintenance) => (
                    <div
                      key={maintenance.id}
                      className="rounded border p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {maintenance.type?.name ||
                            `Type ID: ${maintenance.typeId}`}
                        </p>
                        <div className="flex items-center gap-2">
                          {canManageMaintenances && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingMaintenanceId(maintenance.id);
                                  setMaintenanceFormOpen(true);
                                }}
                              >
                                {t('edit')}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteMaintenanceId(maintenance.id);
                                  setConfirmMaintenanceOpen(true);
                                }}
                              >
                                {t('delete')}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('maintenances.performedAt')}:{' '}
                        {new Date(maintenance.performedAt).toLocaleDateString(
                          'de-DE',
                        )}
                      </p>
                      {maintenance.performedBy && (
                        <p className="text-sm text-muted-foreground">
                          {t('maintenances.performedBy')}:{' '}
                          {maintenance.performedBy.firstName &&
                          maintenance.performedBy.lastName
                            ? `${maintenance.performedBy.firstName} ${maintenance.performedBy.lastName}`
                            : maintenance.performedBy.eMail}
                        </p>
                      )}
                      {maintenance.remarks && (
                        <p className="text-sm text-muted-foreground">
                          {t('maintenances.remarks')}: {maintenance.remarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {canManageAssignments && (
        <>
          {/* Assignment Form Dialog */}
          <ItemAssignmentFormDialog
            open={assignmentFormOpen}
            onOpenChange={(o) => {
              setAssignmentFormOpen(o);
              if (!o) setEditingAssignmentId(null);
            }}
            mode={editingAssignmentId ? 'edit' : 'create'}
            itemId={id!}
            editingAssignmentId={editingAssignmentId}
            existingAssignments={assignments}
            initialValues={
              editingAssignmentId
                ? (() => {
                    const current = assignments.find(
                      (a) => a.id === editingAssignmentId,
                    );
                    if (!current) return undefined;
                    return {
                      assignmentType: current.personId
                        ? ('person' as const)
                        : ('storageLocation' as const),
                      personId: current.personId || undefined,
                      storageLocationId: current.storageLocationId || undefined,
                      assignedFrom: new Date(current.assignedFrom)
                        .toISOString()
                        .substring(0, 10),
                      assignedUntil: current.assignedUntil
                        ? new Date(current.assignedUntil)
                            .toISOString()
                            .substring(0, 10)
                        : undefined,
                    };
                  })()
                : undefined
            }
            loading={
              editingAssignmentId ? updatingAssignment : creatingAssignment
            }
            onSubmit={async (values) => {
              const payload = {
                itemId: id!,
                personId:
                  values.assignmentType === 'person'
                    ? values.personId
                    : undefined,
                storageLocationId:
                  values.assignmentType === 'storageLocation'
                    ? values.storageLocationId
                    : undefined,
                assignedFrom: new Date(values.assignedFrom),
                assignedUntil: values.assignedUntil
                  ? new Date(values.assignedUntil)
                  : undefined,
                assignedById: keycloak.subject!,
              };

              if (editingAssignmentId) {
                await updateAssignment({
                  path: { id: editingAssignmentId },
                  body: payload,
                });
              } else {
                await createAssignment({ body: payload });
              }

              await refetchAssignments();
              setAssignmentFormOpen(false);
              setEditingAssignmentId(null);
            }}
          />

          {/* Assignment Delete Confirm */}
          <ConfirmDialog
            open={confirmAssignmentOpen}
            onOpenChange={(o) => {
              setConfirmAssignmentOpen(o);
              if (!o) setDeleteAssignmentId(null);
            }}
            title={t('confirmDeleteTitle')}
            description={t('confirmDeleteDescription', {
              name: (() => {
                const assignment = assignments.find(
                  (a) => a.id === deleteAssignmentId,
                );
                if (!assignment) return '';
                if (assignment.person) {
                  return `${assignment.person.firstName} ${assignment.person.lastName}`;
                }
                if (assignment.storageLocation) {
                  return assignment.storageLocation.name;
                }
                return (
                  assignment.personId || assignment.storageLocationId || ''
                );
              })(),
            })}
            confirmLabel={t('delete')}
            cancelLabel={t('cancel')}
            confirmVariant="destructive"
            confirmDisabled={deletingAssignment}
            onConfirm={async () => {
              if (!deleteAssignmentId) return;
              await deleteAssignment({ path: { id: deleteAssignmentId } });
              await refetchAssignments();
              setConfirmAssignmentOpen(false);
              setDeleteAssignmentId(null);
            }}
          />
        </>
      )}

      {canManageMaintenances && (
        <>
          {/* Maintenance Form Dialog */}
          <MaintenanceFormDialog
            open={maintenanceFormOpen}
            onOpenChange={(o) => {
              setMaintenanceFormOpen(o);
              if (!o) setEditingMaintenanceId(null);
            }}
            mode={editingMaintenanceId ? 'edit' : 'create'}
            initialValues={
              editingMaintenanceId
                ? (() => {
                    const current = maintenances.find(
                      (m) => m.id === editingMaintenanceId,
                    );
                    if (!current) return undefined;
                    return {
                      typeId: current.typeId,
                      performedAt: new Date(current.performedAt)
                        .toISOString()
                        .substring(0, 10),
                      performedById: current.performedById || undefined,
                      remarks: current.remarks || '',
                    };
                  })()
                : undefined
            }
            loading={
              editingMaintenanceId ? updatingMaintenance : creatingMaintenance
            }
            onSubmit={async (values) => {
              const payload = {
                itemId: id!,
                typeId: values.typeId,
                performedAt: new Date(values.performedAt),
                performedById: values.performedById || '',
                remarks: values.remarks || null,
              };

              if (editingMaintenanceId) {
                await updateMaintenance({
                  path: { id: editingMaintenanceId },
                  body: payload,
                });
              } else {
                await createMaintenance({ body: payload });
              }

              await refetchMaintenances();
              setMaintenanceFormOpen(false);
              setEditingMaintenanceId(null);
            }}
          />

          {/* Maintenance Delete Confirm */}
          <ConfirmDialog
            open={confirmMaintenanceOpen}
            onOpenChange={(o) => {
              setConfirmMaintenanceOpen(o);
              if (!o) setDeleteMaintenanceId(null);
            }}
            title={t('confirmDeleteTitle')}
            description={t('confirmDeleteDescription', {
              name: (() => {
                const maintenance = maintenances.find(
                  (m) => m.id === deleteMaintenanceId,
                );
                if (!maintenance) return '';
                return maintenance.type?.name || maintenance.typeId;
              })(),
            })}
            confirmLabel={t('delete')}
            cancelLabel={t('cancel')}
            confirmVariant="destructive"
            confirmDisabled={deletingMaintenance}
            onConfirm={async () => {
              if (!deleteMaintenanceId) return;
              await deleteMaintenance({ path: { id: deleteMaintenanceId } });
              await refetchMaintenances();
              setConfirmMaintenanceOpen(false);
              setDeleteMaintenanceId(null);
            }}
          />
        </>
      )}

      {canManageItem && item && (
        <>
          <ItemFormDialog
            open={itemFormOpen}
            onOpenChange={(o) => setItemFormOpen(o)}
            mode="edit"
            variantId={item.variantId}
            initialValues={{
              variantId: item.variantId,
              identifier: item.identifier ?? '',
              condition: item.condition,
              purchaseDate: new Date(item.purchaseDate)
                .toISOString()
                .substring(0, 10),
              isDemoItem: item.isDemoItem ?? false,
              retirementDate: item.retirementDate
                ? new Date(item.retirementDate).toISOString().substring(0, 10)
                : undefined,
            }}
            loading={updatingItem}
            onSubmit={async (values) => {
              const payload = {
                variantId: item.variantId,
                identifier: values.identifier || undefined,
                condition: values.condition,
                purchaseDate: new Date(values.purchaseDate + 'T00:00:00'),
                isDemoItem: values.isDemoItem,
                retirementDate: values.retirementDate
                  ? new Date(values.retirementDate + 'T00:00:00')
                  : undefined,
              };
              await updateItemApi({ path: { id: item.id }, body: payload });
              await refetchData();
              setItemFormOpen(false);
            }}
            labels={{
              titleEdit: t('edit'),
              identifier: t('identifier'),
              condition: t('condition'),
              purchaseDate: t('purchaseDate'),
              isDemoItem: t('items.isDemoItem'),
              retirementDate: t('retirementDate'),
              cancel: t('cancel'),
              save: t('save'),
            }}
          />

          <ConfirmDialog
            open={confirmItemDeleteOpen}
            onOpenChange={(o) => setConfirmItemDeleteOpen(o)}
            title={t('confirmDeleteTitle')}
            description={t('confirmDeleteDescription', {
              name: item.identifier || item.id,
            })}
            confirmLabel={t('delete')}
            cancelLabel={t('cancel')}
            confirmVariant="destructive"
            confirmDisabled={deletingItem}
            onConfirm={async () => {
              await deleteItemApi({ path: { id: item.id } });
              setConfirmItemDeleteOpen(false);
              navigate('/app/products/' + item.variant.productId);
            }}
          />
        </>
      )}
    </div>
  );
}
