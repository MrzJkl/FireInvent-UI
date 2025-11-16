import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { useApiRequest } from '@/hooks/useApiRequest';
import {
  deleteProductTypesById,
  getProductTypes,
  postProductTypes,
  putProductTypesById,
  type CreateProductTypeModel,
  type ProductTypeModel,
} from '@/api';
import { useTranslation } from 'react-i18next';

export default function ProductTypesPage() {
  const { t } = useTranslation();

  const [productTypes, setProductTypes] = useState<ProductTypeModel[]>([]);
  const [editing, setEditing] = useState<ProductTypeModel | null>(null);
  const [newProductType, setNewProductType] = useState<CreateProductTypeModel>({
    name: '',
    description: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ProductTypeModel | null>(null);

  const { callApi: fetchApi, loading: loadingList } = useApiRequest(
    getProductTypes,
    {
      showSuccess: false,
    },
  );
  const { callApi: createApi, loading: loadingCreate } =
    useApiRequest(postProductTypes);
  const { callApi: updateApi, loading: loadingUpdate } =
    useApiRequest(putProductTypesById);
  const { callApi: deleteApi, loading: loadingDelete } = useApiRequest(
    deleteProductTypesById,
  );

  const fetchApiRef = useRef(fetchApi);
  useEffect(() => {
    fetchApiRef.current = fetchApi;
  }, [fetchApi]);

  const fetchProductTypes = useCallback(async () => {
    const res = await fetchApiRef.current({});
    if (res) setProductTypes(res);
  }, []);

  useEffect(() => {
    fetchProductTypes();
  }, [fetchProductTypes]);

  const handleSave = async () => {
    if (editing) {
      await updateApi({ path: { id: editing.id }, body: editing });
    } else {
      await createApi({ body: newProductType });
    }
    setEditing(null);
    setNewProductType({ name: '', description: '' });
    setOpenDialog(false);
    fetchProductTypes();
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await deleteApi({ path: { id: toDelete.id } });
    setDeleteDialogOpen(false);
    setToDelete(null);
    fetchProductTypes();
  };

  const loading =
    loadingList || loadingCreate || loadingUpdate || loadingDelete;

  if (loading) return <LoadingIndicator message={t('loadingData')} />;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('productType')}</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setNewProductType({ name: '', description: '' });
            setOpenDialog(true);
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
                    setEditing(pt);
                    setOpenDialog(true);
                  }}
                >
                  {t('edit')}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setToDelete(pt);
                    setDeleteDialogOpen(true);
                  }}
                >
                  {t('delete')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? t('productTypes.edit') : t('productTypes.add')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>{t('name')}</Label>
              <Input
                value={editing ? editing.name : newProductType.name}
                onChange={(e) =>
                  editing
                    ? setEditing({ ...editing, name: e.target.value })
                    : setNewProductType({
                        ...newProductType,
                        name: e.target.value,
                      })
                }
              />
            </div>
            <div>
              <Label>{t('description')}</Label>
              <Input
                value={
                  editing
                    ? (editing.description ?? '')
                    : (newProductType.description ?? '')
                }
                onChange={(e) =>
                  editing
                    ? setEditing({ ...editing, description: e.target.value })
                    : setNewProductType({
                        ...newProductType,
                        description: e.target.value,
                      })
                }
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleSave}>
                {editing ? t('save') : t('add')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('confirmDeleteTitle') ?? 'Delete item'}
            </DialogTitle>
            <DialogDescription>
              {t('confirmDeleteDescription', { name: toDelete?.name ?? '' }) ||
                'Are you sure you want to delete this item? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setToDelete(null);
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loadingDelete}
            >
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
