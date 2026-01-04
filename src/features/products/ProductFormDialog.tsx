import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProductTypes } from '@/features/product-types/useProductTypes';
import { useManufacturers } from '@/features/manufacturers/useManufacturers';

const schema = z.object({
  name: z.string().min(1),
  manufacturerId: z.string().min(1),
  description: z.string().optional(),
  externalIdentifier: z.string().optional(),
  typeId: z.string().min(1),
});

export type ProductFormValues = z.infer<typeof schema>;

export type ProductFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: ProductFormValues;
  loading?: boolean;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  labels?: {
    titleCreate?: string;
    titleEdit?: string;
    name?: string;
    manufacturer?: string;
    description?: string;
    externalIdentifier?: string;
    productType?: string;
    cancel?: string;
    save?: string;
    add?: string;
  };
};

export function ProductFormDialog({
  open,
  mode,
  initialValues,
  loading,
  onSubmit,
  onOpenChange,
  labels,
}: ProductFormDialogProps) {
  const { items: productTypes, isInitialLoading: loadingTypes } =
    useProductTypes();
  const { manufacturers, isLoading: loadingManufacturers } = useManufacturers();

  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      name: '',
      manufacturerId: '',
      description: '',
      externalIdentifier: '',
      typeId: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          name: '',
          manufacturerId: '',
          description: '',
          externalIdentifier: '',
          typeId: '',
        },
      );
    }
  }, [open, initialValues, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit'
              ? (labels?.titleEdit ?? 'Edit Product')
              : (labels?.titleCreate ?? 'Add new Product')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? t('products.descriptionEdit')
              : t('products.descriptionAdd')}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-2" onSubmit={submit}>
          <div className="grid gap-4">
            <div>
              <Label>{labels?.name ?? 'Name'}</Label>
              <Input {...register('name')} />
              {errors.name ? (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label>{labels?.manufacturer ?? 'Manufacturer'}</Label>
              <Controller
                name="manufacturerId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loadingManufacturers}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingManufacturers
                            ? 'Loading...'
                            : 'Select manufacturer'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.map((manufacturer) => (
                        <SelectItem
                          key={manufacturer.id}
                          value={manufacturer.id}
                        >
                          {manufacturer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.manufacturerId ? (
                <p className="text-sm text-red-500 mt-1">
                  {errors.manufacturerId.message}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <Label>{labels?.productType ?? 'Product Type'}</Label>
            <Controller
              name="typeId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={loadingTypes}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingTypes ? 'Loading...' : 'Select product type'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.typeId ? (
              <p className="text-sm text-red-500 mt-1">
                {errors.typeId.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label>{labels?.description ?? 'Description'}</Label>
            <Input {...register('description')} />
          </div>

          <div>
            <Label>
              {labels?.externalIdentifier ?? t('externalIdentifier')}
            </Label>
            <Input {...register('externalIdentifier')} />
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {labels?.cancel ?? 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingTypes || loadingManufacturers}
            >
              {mode === 'edit'
                ? (labels?.save ?? 'Save')
                : (labels?.add ?? 'Add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
