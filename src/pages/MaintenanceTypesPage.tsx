import { useEffect, useState } from 'react';
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
import { MaintenanceTypeFormDialog } from '@/features/maintenance-types/MaintenanceTypeFormDialog';
import { useMaintenanceTypes } from '@/features/maintenance-types/useMaintenanceTypes';
import { type MaintenanceTypeModel } from '@/api';
import { useTranslation } from 'react-i18next';

export default function MaintenanceTypesPage() {
  const { t } = useTranslation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceTypeModel | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MaintenanceTypeModel | null>(
    null,
  );

  const {
    items: maintenanceTypes,
    initialLoading,
    creating,
    updating,
    deleting,
    error,
    createItem,
    updateItem,
    deleteItem,
    refetch,
  } = useMaintenanceTypes();

  useEffect(() => {
    if (!formOpen) setEditingItem(null);
  }, [formOpen]);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (initialLoading) return <LoadingIndicator message={t('loadingData')} />;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('maintenanceTypePlural')}</h1>
        <Button
          onClick={() => {
            setEditingItem(null);
            setFormOpen(true);
          }}
        >
          {t('add')}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('description')}</TableHead>
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {maintenanceTypes.map((mt) => (
            <TableRow key={mt.id}>
              <TableCell>{mt.name}</TableCell>
              <TableCell>{mt.description}</TableCell>
              <TableCell className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingItem(mt);
                    setFormOpen(true);
                  }}
                >
                  {t('edit')}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setItemToDelete(mt);
                    setConfirmOpen(true);
                  }}
                >
                  {t('delete')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <MaintenanceTypeFormDialog
        open={formOpen}
        mode={editingItem ? 'edit' : 'create'}
        initialValues={{
          name: editingItem?.name ?? '',
          description: editingItem?.description ?? '',
        }}
        loading={editingItem ? updating : creating}
        onOpenChange={setFormOpen}
        labels={{
          titleCreate: t('maintenanceTypes.add'),
          titleEdit: t('maintenanceTypes.edit'),
          name: t('name'),
          description: t('description'),
          cancel: t('cancel'),
          save: t('save'),
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
          t('confirmDeleteDescription', { name: itemToDelete?.name ?? '' }) ||
          'Are you sure you want to delete this item? This action cannot be undone.'
        }
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        confirmVariant="destructive"
        confirmDisabled={deleting}
        onConfirm={async () => {
          if (!itemToDelete) return;
          await deleteItem(itemToDelete.id);
          setConfirmOpen(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
}
