import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PersonFormDialog } from '@/features/persons/PersonFormDialog';
import { useTranslation } from 'react-i18next';
import { IconArrowLeft } from '@tabler/icons-react';
import {
  getPersonsById,
  getPersonsByIdAssignments,
  putPersonsById,
  deletePersonsById,
} from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';
import type { PersonModel, ItemAssignmentHistoryModel } from '@/api/types.gen';
import { useAuthorization } from '@/auth/permissions';

export default function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { canEditCatalog } = useAuthorization();
  const canManagePerson = canEditCatalog;

  const [person, setPerson] = useState<PersonModel | null>(null);
  const [assignments, setAssignments] = useState<ItemAssignmentHistoryModel[]>(
    [],
  );
  const [error, setError] = useState<ApiError | null>(null);
  const [personFormOpen, setPersonFormOpen] = useState(false);
  const [confirmPersonDeleteOpen, setConfirmPersonDeleteOpen] = useState(false);

  const { callApi: fetchPerson, loading: personLoading } = useApiRequest(
    getPersonsById,
    { showSuccess: false, showError: false },
  );
  const { callApi: updatePersonApi, loading: updatingPerson } =
    useApiRequest(putPersonsById);
  const { callApi: deletePersonApi, loading: deletingPerson } =
    useApiRequest(deletePersonsById);
  const { callApi: fetchAssignments, loading: assignmentsLoading } =
    useApiRequest(getPersonsByIdAssignments, {
      showSuccess: false,
      showError: false,
    });

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setError(null);
      const personData = await fetchPerson({ path: { id } });
      if (!personData) {
        setError({
          message:
            'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
        });
        return;
      }
      setPerson(personData);

      const assignmentsData = await fetchAssignments({ path: { id } });
      if (assignmentsData) setAssignments(assignmentsData);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const refetchData = async () => {
    if (!id) return;
    setError(null);
    const personData = await fetchPerson({ path: { id } });
    if (!personData) {
      setError({
        message:
          'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
      });
      return;
    }
    setPerson(personData);

    const assignmentsData = await fetchAssignments({ path: { id } });
    if (assignmentsData) setAssignments(assignmentsData);
  };

  const handleUpdatePerson = async (body: {
    firstName: string;
    lastName: string;
    remarks?: string;
    contactInfo?: string;
    externalId?: string;
    departmentIds?: string[];
  }) => {
    if (!id) return;
    const result = await updatePersonApi({ path: { id }, body });
    if (result) {
      await refetchData();
      setPersonFormOpen(false);
    }
  };

  const handleDeletePerson = async () => {
    if (!id) return;
    const result = await deletePersonApi({ path: { id } });
    if (result) {
      navigate('/app/persons');
    }
  };

  const initialLoading = personLoading && !person && !error;

  if (error) return <ErrorState error={error} onRetry={refetchData} />;
  if (initialLoading) return <LoadingIndicator />;

  if (!person) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card>
          <CardHeader>
            <CardTitle>Person nicht gefunden</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>Zurück</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Separate active and expired assignments
  const activeAssignments = assignments.filter((a) => !a.assignedUntil);
  const expiredAssignments = assignments.filter((a) => a.assignedUntil);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <IconArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {person.firstName} {person.lastName}
            </h1>
            {person.externalId && (
              <p className="text-sm text-muted-foreground">
                ID: {person.externalId}
              </p>
            )}
          </div>
        </div>
        {canManagePerson && person && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPersonFormOpen(true)}>
              {t('edit')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmPersonDeleteOpen(true)}
            >
              {t('delete')}
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="assignments">
            Zuweisungen
            {activeAssignments.length > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {activeAssignments.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Persönliche Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Vorname
                </div>
                <div className="mt-1">{person.firstName || '–'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Nachname
                </div>
                <div className="mt-1">{person.lastName || '–'}</div>
              </div>
              {person.externalId && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Externe ID
                  </div>
                  <div className="mt-1">{person.externalId}</div>
                </div>
              )}
              {person.contactInfo && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Kontaktinformationen
                  </div>
                  <div className="mt-1 whitespace-pre-wrap">
                    {person.contactInfo}
                  </div>
                </div>
              )}
              {person.departments && person.departments.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Abteilungen
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {person.departments.map((dept) => (
                      <span
                        key={dept.id}
                        className="rounded-full bg-muted px-3 py-1 text-sm"
                      >
                        {dept.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {person.remarks && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Bemerkungen
                  </div>
                  <div className="mt-1 whitespace-pre-wrap">
                    {person.remarks}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="mt-6">
          <div className="space-y-6">
            {/* Active Assignments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Aktive Zuweisungen
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-sm font-normal text-green-800 dark:bg-green-900 dark:text-green-200">
                      {activeAssignments.length}
                    </span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {assignmentsLoading ? (
                  <LoadingIndicator />
                ) : activeAssignments.length === 0 ? (
                  <div className="flex h-24 items-center justify-center text-muted-foreground">
                    Keine aktiven Zuweisungen
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="rounded border border-green-200 bg-green-50/50 p-4 dark:border-green-900 dark:bg-green-950/20"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {assignment.item.identifier ||
                                  `Item ID: ${assignment.itemId}`}
                              </p>
                              <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                Aktiv
                              </span>
                            </div>
                            {assignment.item.variant?.product && (
                              <p className="text-sm text-muted-foreground">
                                {assignment.item.variant.product.name}
                                {assignment.item.variant && (
                                  <>
                                    {' · '}
                                    {assignment.item.variant.name}
                                  </>
                                )}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              Zugewiesen seit:{' '}
                              {new Date(
                                assignment.assignedFrom,
                              ).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/app/items/${assignment.itemId}`)
                            }
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expired Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Abgelaufene Zuweisungen
                  <span className="rounded-full bg-muted px-2 py-0.5 text-sm font-normal text-muted-foreground">
                    {expiredAssignments.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignmentsLoading ? (
                  <LoadingIndicator />
                ) : expiredAssignments.length === 0 ? (
                  <div className="flex h-24 items-center justify-center text-muted-foreground">
                    Keine abgelaufenen Zuweisungen
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expiredAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="rounded border bg-muted/30 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {assignment.item.identifier ||
                                  `Item ID: ${assignment.itemId}`}
                              </p>
                              <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                Abgelaufen
                              </span>
                            </div>
                            {assignment.item.variant?.product && (
                              <p className="text-sm text-muted-foreground">
                                {assignment.item.variant.product.name}
                                {assignment.item.variant && (
                                  <>
                                    {' · '}
                                    {assignment.item.variant.name}
                                  </>
                                )}
                              </p>
                            )}
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <p>
                                Von:{' '}
                                {new Date(
                                  assignment.assignedFrom,
                                ).toLocaleDateString('de-DE')}
                              </p>
                              {assignment.assignedUntil && (
                                <p>
                                  Bis:{' '}
                                  {new Date(
                                    assignment.assignedUntil,
                                  ).toLocaleDateString('de-DE')}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/app/items/${assignment.itemId}`)
                            }
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Person Dialog */}
      {canManagePerson && person && (
        <PersonFormDialog
          open={personFormOpen}
          mode="edit"
          onOpenChange={setPersonFormOpen}
          onSubmit={handleUpdatePerson}
          initialValues={{
            firstName: person.firstName,
            lastName: person.lastName,
            remarks: person.remarks ?? '',
            contactInfo: person.contactInfo ?? '',
            externalId: person.externalId ?? '',
            departmentIds:
              person.departmentIds ??
              person.departments?.map((d) => d.id) ??
              [],
          }}
          loading={updatingPerson}
          labels={{
            titleEdit: 'Person bearbeiten',
            firstName: 'Vorname',
            lastName: 'Nachname',
            contactInfo: 'Kontaktinformationen',
            externalId: 'Externe ID',
            remarks: 'Bemerkungen',
            cancel: t('cancel'),
            save: t('save'),
          }}
        />
      )}

      {/* Delete Person Confirmation */}
      {canManagePerson && (
        <ConfirmDialog
          open={confirmPersonDeleteOpen}
          onOpenChange={setConfirmPersonDeleteOpen}
          onConfirm={handleDeletePerson}
          title={t('confirmDelete')}
          description={`Möchten Sie ${person?.firstName} ${person?.lastName} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
          confirmLabel={t('delete')}
          cancelLabel={t('cancel')}
          confirmVariant="destructive"
          confirmDisabled={deletingPerson}
        />
      )}
    </div>
  );
}
