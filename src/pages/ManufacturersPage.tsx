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
import { ManufacturerFormDialog } from '@/features/manufacturers/ManufacturerFormDialog';
import { useManufacturers } from '@/features/manufacturers/useManufacturers';
import { type ManufacturerModel } from '@/api/types.gen';
import { useTranslation } from 'react-i18next';
import { useAuthorization } from '@/auth/permissions';

export default function ManufacturersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canEditCatalog } = useAuthorization();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ManufacturerModel | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ManufacturerModel | null>(
    null,
  );

  const {
    manufacturers,
    state,
    isInitialLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createManufacturer,
    updateManufacturer,
    deleteManufacturer,
    refetch,
    nextPage,
    previousPage,
    setPageSize,
    setSearchTerm,
  } = useManufacturers();

  useEffect(() => {
    if (!formOpen) setEditingItem(null);
  }, [formOpen]);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isInitialLoading) return <LoadingIndicator />;

  const showActions = canEditCatalog;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('manufacturerPlural')}</h1>
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
          {state.totalItems} {t('manufacturerPlural')}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('city')}</TableHead>
              <TableHead>{t('country')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('phoneNumber')}</TableHead>
              {showActions && <TableHead>{t('actions')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {manufacturers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 6 : 5}
                  className="h-24 text-center"
                >
                  {t('noResults')}
                </TableCell>
              </TableRow>
            ) : (
              manufacturers.map((manufacturer) => (
                <TableRow
                  key={manufacturer.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    navigate(`/app/manufacturers/${manufacturer.id}`)
                  }
                >
                  <TableCell className="font-medium">
                    {manufacturer.name}
                  </TableCell>
                  <TableCell>{manufacturer.city || '-'}</TableCell>
                  <TableCell>{manufacturer.country || '-'}</TableCell>
                  <TableCell>{manufacturer.email || '-'}</TableCell>
                  <TableCell>{manufacturer.phoneNumber || '-'}</TableCell>
                  {showActions && (
                    <TableCell className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem(manufacturer);
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
                          setItemToDelete(manufacturer);
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
        <ManufacturerFormDialog
          open={formOpen}
          mode={editingItem ? 'edit' : 'create'}
          initialValues={
            editingItem
              ? {
                  name: editingItem.name,
                  description: editingItem.description ?? '',
                  street: editingItem.street ?? '',
                  houseNumber: editingItem.houseNumber ?? '',
                  postalCode: editingItem.postalCode ?? '',
                  city: editingItem.city ?? '',
                  country: editingItem.country ?? '',
                  website: editingItem.website ?? '',
                  phoneNumber: editingItem.phoneNumber ?? '',
                  email: editingItem.email ?? '',
                }
              : undefined
          }
          loading={editingItem ? isUpdating : isCreating}
          onOpenChange={setFormOpen}
          onSubmit={async (values) => {
            if (editingItem) {
              await updateManufacturer(editingItem.id, values);
            } else {
              await createManufacturer(values);
            }
            setFormOpen(false);
          }}
        />
      )}

      {showActions && (
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
            await deleteManufacturer(itemToDelete.id);
            setConfirmOpen(false);
            setItemToDelete(null);
          }}
        />
      )}
    </div>
  );
}
