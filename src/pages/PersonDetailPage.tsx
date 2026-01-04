import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PersonFormDialog } from '@/features/persons/PersonFormDialog';
import { useTranslation } from 'react-i18next';
import { IconArrowLeft } from '@tabler/icons-react';
import {
  getPersonsById,
  getPersonsByIdAssignmentsPaginated,
  putPersonsById,
  deletePersonsById,
} from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';
import { useCrudList } from '@/hooks/useCrudList';
import type { PersonModel, ItemAssignmentHistoryModel } from '@/api/types.gen';
import { useAuthorization } from '@/auth/permissions';

export default function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { canEditCatalog } = useAuthorization();
  const canManagePerson = canEditCatalog;

  const [person, setPerson] = useState<PersonModel | null>(null);
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

  // Assignments list with pagination
  const listFn = useMemo(
    () => (params: Partial<{ page?: number; pageSize?: number; searchTerm?: string | null }>) => {
      if (!id) {
        return Promise.resolve({
          data: { items: [], page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
        });
      }
      return getPersonsByIdAssignmentsPaginated(id, params);
    },
    [id],
  );

  const {
    items: assignments,
    state,
    isInitialLoading: assignmentsLoading,
    error: assignmentsError,
    nextPage,
    previousPage,
    setPageSize,
    setSearchTerm,
    refetch: refetchAssignments,
  } = useCrudList<ItemAssignmentHistoryModel, never, never>(
    listFn,
    // Dummy functions since we don't create/update/delete from this page
    async () => ({ data: null }),
    async () => ({ data: null }),
    async () => ({ data: null }),
    {
      initialPageSize: 20,
    },
  );

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
    refetchAssignments();
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
  if (assignmentsError && assignmentsError.message) {
    return <ErrorState error={assignmentsError} onRetry={refetchAssignments} />;
  }
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
          <TabsTrigger value="assignments">Zuweisungen</TabsTrigger>
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
              {person.eMail && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    E-Mail
                  </div>
                  <div className="mt-1 whitespace-pre-wrap">{person.eMail}</div>
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
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <CardTitle>Zuweisungen</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {state.totalItems} {state.totalItems === 1 ? 'Zuweisung' : 'Zuweisungen'}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <Input
                  placeholder={t('search')}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Produkt / Variante</TableHead>
                      <TableHead>Von</TableHead>
                      <TableHead>Bis</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignmentsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <LoadingIndicator />
                        </TableCell>
                      </TableRow>
                    ) : assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <p>{t('noResults')}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignments.map((assignment) => {
                        const isActive = !assignment.assignedUntil;
                        return (
                          <TableRow
                            key={assignment.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/app/items/${assignment.itemId}`)}
                          >
                            <TableCell className="font-medium">
                              {assignment.item.identifier || (
                                <span className="text-muted-foreground italic">
                                  {assignment.itemId.substring(0, 8)}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {assignment.item.variant?.product ? (
                                <div className="space-y-0.5">
                                  <div>{assignment.item.variant.product.name}</div>
                                  {assignment.item.variant && (
                                    <div className="text-xs text-muted-foreground">
                                      {assignment.item.variant.name}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(assignment.assignedFrom).toLocaleDateString('de-DE')}
                            </TableCell>
                            <TableCell>
                              {assignment.assignedUntil
                                ? new Date(assignment.assignedUntil).toLocaleDateString('de-DE')
                                : '-'}
                            </TableCell>
                            <TableCell>
                              {isActive ? (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Aktiv
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                                  Abgelaufen
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/app/items/${assignment.itemId}`);
                                }}
                              >
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {!assignmentsLoading && assignments.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {t('rowsPerPage')}:
                    </span>
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {t('page')} {state.page} {t('of')} {state.totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={previousPage}
                      disabled={state.page <= 1}
                    >
                      {t('previous')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={nextPage}
                      disabled={state.page >= state.totalPages}
                    >
                      {t('next')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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
            eMail: person.eMail ?? '',
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
            email: 'E-Mail',
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
