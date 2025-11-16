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
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { StorageLocationFormDialog } from '@/features/storage-locations/StorageLocationFormDialog';
import { useStorageLocations } from '@/features/storage-locations/useStorageLocations';
import { type StorageLocationModel } from '@/api';
import { useTranslation } from 'react-i18next';

export default function StorageLocationsPage() {
  const { t } = useTranslation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StorageLocationModel | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<StorageLocationModel | null>(
    null,
  );

  const {
    items: storageLocations,
    initialLoading,
    creating,
    updating,
    deleting,
    createItem,
    updateItem,
    deleteItem,
  } = useStorageLocations();

  useEffect(() => {
    if (!formOpen) setEditingItem(null);
  }, [formOpen]);

  if (initialLoading) return <LoadingIndicator message={t('loadingData')} />;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('storageLocation')}</h1>
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
            <TableHead>{t('remarks') ?? 'Remarks'}</TableHead>
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {storageLocations.map((sl) => (
            <TableRow key={sl.id}>
              <TableCell>{sl.name}</TableCell>
              <TableCell>{sl.remarks}</TableCell>
              <TableCell className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingItem(sl);
                    setFormOpen(true);
                  }}
                >
                  {t('edit')}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setItemToDelete(sl);
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

      <StorageLocationFormDialog
        open={formOpen}
        mode={editingItem ? 'edit' : 'create'}
        initialValues={{
          name: editingItem?.name ?? '',
          remarks: editingItem?.remarks ?? '',
        }}
        loading={editingItem ? updating : creating}
        onOpenChange={setFormOpen}
        labels={{
          titleCreate: t('storageLocations.add'),
          titleEdit: t('storageLocations.edit'),
          name: t('name'),
          remarks: t('remarks') ?? 'Remarks',
          cancel: t('cancel'),
          save: t('save') ?? 'Save',
          add: t('add'),
        }}
        onSubmit={async (values) => {
          if (editingItem) {
            await updateItem({ ...editingItem, ...values });
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
