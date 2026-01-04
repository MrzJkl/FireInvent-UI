import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { PersonFormDialog } from '@/features/persons/PersonFormDialog';
import { usePersons } from '@/features/persons/usePersons';
import { type PersonModel } from '@/api/types.gen';
import { useTranslation } from 'react-i18next';
import { useAuthorization } from '@/auth/permissions';

export default function PersonsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canEditCatalog } = useAuthorization();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PersonModel | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PersonModel | null>(null);

  const {
    persons,
    state,
    isInitialLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createPerson,
    updatePerson,
    deletePerson,
    refetch,
    nextPage,
    previousPage,
    setPageSize,
    setSearchTerm,
  } = usePersons();

  useEffect(() => {
    if (!formOpen) setEditingItem(null);
  }, [formOpen]);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isInitialLoading) return <LoadingIndicator />;

  const showActions = canEditCatalog;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('personPlural')}</h1>
        {showActions && (
          <Button
            onClick={() => {
              setEditingItem(null);
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
          {state.totalItems} {t('personPlural')}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('firstName')}</TableHead>
              <TableHead>{t('lastName')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('externalId')}</TableHead>
              <TableHead>{t('departmentPlural')}</TableHead>
              {showActions && <TableHead>{t('actions')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {persons.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 6 : 5}
                  className="h-24 text-center"
                >
                  {t('noResults')}
                </TableCell>
              </TableRow>
            ) : (
              persons.map((person) => (
                <TableRow
                  key={person.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/app/persons/${person.id}`)}
                >
                  <TableCell>{person.firstName}</TableCell>
                  <TableCell>{person.lastName}</TableCell>
                  <TableCell>{person.eMail}</TableCell>
                  <TableCell>{person.externalId}</TableCell>
                  <TableCell>
                    {person.departments?.length
                      ? person.departments.map((d) => d.name).join(', ')
                      : '-'}
                  </TableCell>
                  {showActions && (
                    <TableCell
                      className="flex space-x-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingItem(person);
                          setFormOpen(true);
                        }}
                      >
                        {t('edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setItemToDelete(person);
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
          <PersonFormDialog
            open={formOpen}
            mode={editingItem ? 'edit' : 'create'}
            initialValues={
              editingItem
                ? {
                    firstName: editingItem.firstName,
                    lastName: editingItem.lastName,
                    remarks: editingItem.remarks ?? '',
                    eMail: editingItem.eMail ?? '',
                    externalId: editingItem.externalId ?? '',
                    departmentIds:
                      (editingItem.departmentIds &&
                      editingItem.departmentIds.length
                        ? editingItem.departmentIds
                        : editingItem.departments?.map((d) => d.id)) ?? [],
                  }
                : undefined
            }
            loading={editingItem ? isUpdating : isCreating}
            onOpenChange={setFormOpen}
            labels={{
              titleCreate: t('persons.add'),
              titleEdit: t('persons.edit'),
              firstName: t('firstName'),
              lastName: t('lastName'),
              email: t('email'),
              externalId: t('externalId'),
              remarks: t('remarks'),
              cancel: t('cancel'),
              save: t('save'),
              add: t('add'),
            }}
            onSubmit={async (values) => {
              const payload = { ...values };
              if (editingItem) {
                await updatePerson(editingItem.id, payload);
              } else {
                await createPerson(payload);
              }
              setFormOpen(false);
            }}
          />

          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={(o) => {
              setConfirmOpen(o);
              if (!o) setItemToDelete(null);
            }}
            title={t('confirmDeleteTitle')}
            description={t('confirmDeleteDescription', {
              name: `${itemToDelete?.firstName ?? ''} ${itemToDelete?.lastName ?? ''}`,
            })}
            confirmLabel={t('delete')}
            cancelLabel={t('cancel')}
            confirmVariant="destructive"
            confirmDisabled={isDeleting}
            onConfirm={async () => {
              if (!itemToDelete) return;
              await deletePerson(itemToDelete.id);
              setConfirmOpen(false);
              setItemToDelete(null);
            }}
          />
        </>
      )}
    </div>
  );
}
