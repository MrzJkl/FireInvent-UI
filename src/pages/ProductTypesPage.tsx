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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  deleteProductTypesById,
  getProductTypes,
  postProductTypes,
  putProductTypesById,
  type CreateProductTypeModel,
  type ProductTypeModel,
} from '@/api';
import { useKeycloak } from '@react-keycloak/web';
import { useTranslation } from 'react-i18next';

export default function ProductTypesPage() {
  const [productTypes, setProductTypes] = useState<ProductTypeModel[]>([]);
  const [editing, setEditing] = useState<ProductTypeModel | null>(null);
  const [newProductType, setNewProductType] = useState<CreateProductTypeModel>({
    name: '',
    description: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const { t } = useTranslation();

  const fetchProductTypes = async () => {
    const { data } = await getProductTypes({});
    if (data) setProductTypes(data);
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  const handleSave = async () => {
    if (editing) {
      await putProductTypesById({ path: { id: editing.id }, body: editing });
    } else {
      const { data, error } = await postProductTypes({
        body: newProductType,
      });
    }
    setEditing(null);
    setNewProductType({ name: '', description: '' });
    setOpenDialog(false);
    fetchProductTypes();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie diesen ProductType wirklich löschen?')) {
      await deleteProductTypesById({ path: { id } });
      fetchProductTypes();
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Product Types</h1>
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
                  onClick={() => handleDelete(pt.id)}
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
    </div>
  );
}
