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
import { ProductFormDialog } from '@/features/products/ProductFormDialog';
import { useProducts } from '@/features/products/useProducts';
import { type ProductModel } from '@/api/types.gen';
import { useTranslation } from 'react-i18next';

export default function ProductsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductModel | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ProductModel | null>(null);

  const {
    products,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch,
  } = useProducts();

  useEffect(() => {
    if (!formOpen) setEditingItem(null);
  }, [formOpen]);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('productPlural')}</h1>
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
            <TableHead>{t('manufacturer')}</TableHead>
            <TableHead>{t('productType')}</TableHead>
            <TableHead>{t('description')}</TableHead>
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/app/products/${product.id}`)}
            >
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.manufacturer}</TableCell>
              <TableCell>{product.type.name}</TableCell>
              <TableCell>{product.description}</TableCell>
              <TableCell className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingItem(product);
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
                    setItemToDelete(product);
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

      <ProductFormDialog
        open={formOpen}
        mode={editingItem ? 'edit' : 'create'}
        initialValues={
          editingItem
            ? {
                name: editingItem.name,
                manufacturer: editingItem.manufacturer,
                description: editingItem.description ?? '',
                typeId: editingItem.typeId,
              }
            : undefined
        }
        loading={editingItem ? isUpdating : isCreating}
        onOpenChange={setFormOpen}
        labels={{
          titleCreate: t('products.add'),
          titleEdit: t('products.edit'),
          name: t('name'),
          manufacturer: t('manufacturer'),
          description: t('description'),
          productType: t('productType'),
          cancel: t('cancel'),
          save: t('save'),
          add: t('add'),
        }}
        onSubmit={async (values) => {
          if (editingItem) {
            await updateProduct(editingItem.id, values);
          } else {
            await createProduct(values);
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
          name: itemToDelete?.name ?? '',
        })}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        confirmVariant="destructive"
        confirmDisabled={isDeleting}
        onConfirm={async () => {
          if (!itemToDelete) return;
          await deleteProduct(itemToDelete.id);
          setConfirmOpen(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
}
