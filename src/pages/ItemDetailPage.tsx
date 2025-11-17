import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ItemAssignmentFormDialog } from '@/features/item-assignments/ItemAssignmentFormDialog';
import { useTranslation } from 'react-i18next';
import { IconArrowLeft } from '@tabler/icons-react';
import {
  getItemsById,
  getItemsByIdAssignments,
  postAssignments,
  putAssignmentsById,
  deleteAssignmentsById,
} from '@/api';
import { useApiRequest } from '@/hooks/useApiRequest';
import type { ItemModel, ItemAssignmentHistoryModel } from '@/api/types.gen';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [item, setItem] = useState<ItemModel | null>(null);
  const [assignments, setAssignments] = useState<ItemAssignmentHistoryModel[]>(
    [],
  );
  const [assignmentFormOpen, setAssignmentFormOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(
    null,
  );
  const [deleteAssignmentId, setDeleteAssignmentId] = useState<string | null>(
    null,
  );
  const [confirmAssignmentOpen, setConfirmAssignmentOpen] = useState(false);

  const { callApi: fetchItem, loading: itemLoading } = useApiRequest(
    getItemsById,
    { showSuccess: false },
  );
  const { callApi: fetchAssignments, loading: assignmentsLoading } =
    useApiRequest(getItemsByIdAssignments, { showSuccess: false });
  const { callApi: createAssignment, loading: creatingAssignment } =
    useApiRequest(postAssignments);
  const { callApi: updateAssignment, loading: updatingAssignment } =
    useApiRequest(putAssignmentsById);
  const { callApi: deleteAssignment, loading: deletingAssignment } =
    useApiRequest(deleteAssignmentsById);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      const itemData = await fetchItem({ path: { id } });
      if (itemData) setItem(itemData);

      const assignmentsData = await fetchAssignments({ path: { id } });
      if (assignmentsData) setAssignments(assignmentsData);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const refetchAssignments = async () => {
    if (!id) return;
    const assignmentsData = await fetchAssignments({ path: { id } });
    if (assignmentsData) setAssignments(assignmentsData);
  };

  if (itemLoading) return <LoadingIndicator />;

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
              {item.variant?.product?.name} · {item.variant?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="item" className="w-full">
        <TabsList>
          <TabsTrigger value="item">{t('item')}</TabsTrigger>
          <TabsTrigger value="assignments">
            {t('itemAssignments.label')}
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
                <div className="mt-1">{item.variant?.product?.name || '–'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('variant')}
                </div>
                <div className="mt-1">{item.variant?.name || '–'}</div>
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
                  {t('storageLocation')}
                </div>
                <div className="mt-1">
                  {item.storageLocationId || (
                    <span className="text-muted-foreground italic">–</span>
                  )}
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
              <Button
                onClick={() => {
                  setEditingAssignmentId(null);
                  setAssignmentFormOpen(true);
                }}
              >
                {t('add')}
              </Button>
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
                            : `Person ID: ${assignment.personId}`}
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
      </Tabs>

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
                  personId: current.personId,
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
        loading={editingAssignmentId ? updatingAssignment : creatingAssignment}
        onSubmit={async (values) => {
          const payload = {
            itemId: id!,
            personId: values.personId,
            assignedFrom: new Date(values.assignedFrom),
            assignedUntil: values.assignedUntil
              ? new Date(values.assignedUntil)
              : undefined,
            assignedById: null,
          };

          if (editingAssignmentId) {
            const current = assignments.find(
              (a) => a.id === editingAssignmentId,
            );
            if (current) {
              await updateAssignment({
                path: { id: editingAssignmentId },
                body: { ...current, ...payload },
              });
            }
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
            return assignment.person
              ? `${assignment.person.firstName} ${assignment.person.lastName}`
              : assignment.personId;
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
    </div>
  );
}
