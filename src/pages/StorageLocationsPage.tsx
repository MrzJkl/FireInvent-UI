import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { StorageLocationFormDialog } from '@/features/storage-locations/StorageLocationFormDialog';
import { useStorageLocations } from '@/features/storage-locations/useStorageLocations';
import { type StorageLocationModel } from '@/api';
import { useTranslation } from 'react-i18next';
import { useAuthorization } from '@/auth/permissions';

export default function StorageLocationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canEditCatalog } = useAuthorization();

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
    error,
    createItem,
    updateItem,
    deleteItem,
    refetch,
  } = useStorageLocations();

  useEffect(() => {
    if (!formOpen) setEditingItem(null);
  }, [formOpen]);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (initialLoading) return <LoadingIndicator message={t('loadingData')} />;

  const showActions = canEditCatalog;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('storageLocationPlural')}</h1>
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('remarks')}</TableHead>
            {showActions && <TableHead>{t('actions')}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {storageLocations.map((sl) => (
            <TableRow
              key={sl.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/app/storageLocations/${sl.id}`)}
            >
              <TableCell>{sl.name}</TableCell>
              <TableCell>{sl.remarks}</TableCell>
              {showActions && (
                <TableCell className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem(sl);
                      setFormOpen(true);
                    }}
                  >
                    {t('edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete(sl);
                      setConfirmOpen(true);
                    }}
                  >
                    {t('delete')}
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showActions && (
        <>
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
              remarks: t('remarks'),
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
            title={t('confirmDeleteTitle')}
            description={
              t('confirmDeleteDescription', {
                name: itemToDelete?.name ?? '',
              }) ||
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
        </>
      )}
    </div>
  );
}
