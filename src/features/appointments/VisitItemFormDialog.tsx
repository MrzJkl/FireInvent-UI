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
import { useProducts } from '@/features/products/useProducts';

const schema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.string().min(1, 'Quantity is required'),
});

export type VisitItemFormValues = z.infer<typeof schema>;

export type VisitItemFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  visitId: string;
  initialValues?: VisitItemFormValues;
  loading?: boolean;
  onSubmit: (values: VisitItemFormValues) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  labels?: {
    titleCreate?: string;
    titleEdit?: string;
    product?: string;
    quantity?: string;
    cancel?: string;
    save?: string;
    add?: string;
  };
};

export function VisitItemFormDialog({
  open,
  mode,
  initialValues,
  loading,
  onSubmit,
  onOpenChange,
  labels,
}: VisitItemFormDialogProps) {
  const { t } = useTranslation();
  const { products, initialLoading: productsLoading } = useProducts();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<VisitItemFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      productId: '',
      quantity: '1',
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          productId: '',
          quantity: '1',
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
              ? (labels?.titleEdit ?? t('visitItems.titleEdit'))
              : (labels?.titleCreate ?? t('visitItems.titleCreate'))}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? t('visitItems.descriptionEdit')
              : t('visitItems.descriptionCreate')}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-2" onSubmit={submit}>
          <div className="grid gap-4">
            <div>
              <Label>{labels?.product ?? t('product')}</Label>
              <Controller
                name="productId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={productsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.productId ? (
                <p className="text-sm text-red-500 mt-1">
                  {errors.productId.message}
                </p>
              ) : null}
            </div>

            <div>
              <Label>{labels?.quantity ?? t('quantity')}</Label>
              <Input type="number" min="1" {...register('quantity')} />
              {errors.quantity ? (
                <p className="text-sm text-red-500 mt-1">
                  {errors.quantity.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {labels?.cancel ?? t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {mode === 'edit'
                ? (labels?.save ?? t('save'))
                : (labels?.add ?? t('add'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
