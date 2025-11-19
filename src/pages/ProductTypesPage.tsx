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
import { ProductTypeFormDialog } from '@/features/product-types/ProductTypeFormDialog';
import { useProductTypes } from '@/features/product-types/useProductTypes';
import { type ProductTypeModel } from '@/api';
import { useTranslation } from 'react-i18next';

export default function ProductTypesPage() {
  const { t } = useTranslation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductTypeModel | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ProductTypeModel | null>(
    null,
  );

  const {
    items: productTypes,
    initialLoading,
    creating,
    updating,
    deleting,
    createItem,
    updateItem,
    deleteItem,
  } = useProductTypes();

  useEffect(() => {
    if (!formOpen) setEditingItem(null);
  }, [formOpen]);

  if (initialLoading) return <LoadingIndicator message={t('loadingData')} />;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('productTypePlural')}</h1>
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
          {productTypes.map((pt) => (
            <TableRow key={pt.id}>
              <TableCell>{pt.name}</TableCell>
              <TableCell>{pt.description}</TableCell>
              <TableCell className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingItem(pt);
                    setFormOpen(true);
                  }}
                >
                  {t('edit')}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setItemToDelete(pt);
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

      <ProductTypeFormDialog
        open={formOpen}
        mode={editingItem ? 'edit' : 'create'}
        initialValues={{
          name: editingItem?.name ?? '',
          description: editingItem?.description ?? '',
        }}
        loading={editingItem ? updating : creating}
        onOpenChange={setFormOpen}
        labels={{
          titleCreate: t('productTypes.add'),
          titleEdit: t('productTypes.edit'),
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
