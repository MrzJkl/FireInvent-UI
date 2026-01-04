import { useEffect, useState } from 'react';
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
import { DepartmentFormDialog } from '@/features/departments/DepartmentFormDialog';
import { useDepartments } from '@/features/departments/useDepartments';
import { type DepartmentModel } from '@/api';
import { useTranslation } from 'react-i18next';
import { useAuthorization } from '@/auth/permissions';

export default function DepartmentsPage() {
  const { t } = useTranslation();
  const { canEditCatalog } = useAuthorization();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DepartmentModel | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DepartmentModel | null>(
    null,
  );

  const {
    items: departments,
    state,
    isInitialLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createItem,
    updateItem,
    deleteItem,
    refetch,
    nextPage,
    previousPage,
    setPageSize,
    setSearchTerm,
  } = useDepartments();

  useEffect(() => {
    if (!formOpen) setEditingItem(null);
  }, [formOpen]);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isInitialLoading) return <LoadingIndicator />;

  const showActions = canEditCatalog;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('departmentPlural')}</h1>
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
          {state.totalItems} {t('departmentPlural')}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('description')}</TableHead>
              {showActions && <TableHead>{t('actions')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 3 : 2}
                  className="h-24 text-center"
                >
                  {t('noResults')}
                </TableCell>
              </TableRow>
            ) : (
              departments.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.description}</TableCell>
                  {showActions && (
                    <TableCell className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingItem(d);
                          setFormOpen(true);
                        }}
                      >
                        {t('edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setItemToDelete(d);
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
          <DepartmentFormDialog
            open={formOpen}
            mode={editingItem ? 'edit' : 'create'}
            initialValues={{
              name: editingItem?.name ?? '',
              description: editingItem?.description ?? '',
            }}
            loading={editingItem ? isUpdating : isCreating}
            onOpenChange={setFormOpen}
            labels={{
              titleCreate: t('departments.add'),
              titleEdit: t('departments.edit'),
              name: t('name'),
              description: t('description'),
              cancel: t('cancel'),
              save: t('save') ?? 'Save',
              add: t('add'),
            }}
            onSubmit={async (values) => {
              if (editingItem) {
                await updateItem(editingItem.id, values);
              } else {
                await createItem(values);
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
            title={t('confirmDeleteTitle') ?? 'Delete item'}
            description={
              t('confirmDeleteDescription', {
                name: itemToDelete?.name ?? '',
              }) ||
              'Are you sure you want to delete this item? This action cannot be undone.'
            }
            confirmLabel={t('delete')}
            cancelLabel={t('cancel')}
            confirmVariant="destructive"
            confirmDisabled={isDeleting}
            onConfirm={async () => {
              if (!itemToDelete) return;
              await deleteItem(itemToDelete.id);
              setConfirmOpen(false);
              setItemToDelete(null);
            }}
          />
        </>
      )}
    </div>
  );
}
