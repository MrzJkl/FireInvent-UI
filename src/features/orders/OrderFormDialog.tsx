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
import { OrderStatus } from '@/api/types.gen';

const orderStatusOptions: (keyof typeof OrderStatus)[] = [
  'DRAFT',
  'SUBMITTED',
  'DELIVERED',
  'COMPLETED',
];

const schema = z.object({
  orderIdentifier: z.string().optional(),
  orderDate: z.string().min(1, 'Order date is required'),
  status: z.enum(['Draft', 'Submitted', 'Delivered', 'Completed']),
  deliveryDate: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof schema>;

export type OrderFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: OrderFormValues;
  loading?: boolean;
  onSubmit: (values: OrderFormValues) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  labels?: {
    titleCreate?: string;
    titleEdit?: string;
    orderIdentifier?: string;
    orderDate?: string;
    status?: string;
    deliveryDate?: string;
    cancel?: string;
    save?: string;
    add?: string;
  };
};

export function OrderFormDialog({
  open,
  mode,
  initialValues,
  loading,
  onSubmit,
  onOpenChange,
  labels,
}: OrderFormDialogProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      orderIdentifier: '',
      orderDate: new Date().toISOString().substring(0, 10),
      status: 'Draft',
      deliveryDate: '',
    },
  });

  const currentStatus = watch('status');

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          orderIdentifier: '',
          orderDate: new Date().toISOString().substring(0, 10),
          status: 'Draft',
          deliveryDate: '',
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
              ? (labels?.titleEdit ?? 'Edit Order')
              : (labels?.titleCreate ?? 'Add new Order')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? t('orders.descriptionEdit')
              : t('orders.descriptionAdd')}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-2" onSubmit={submit}>
          <div className="grid gap-4">
            <div>
              <Label>{labels?.orderIdentifier ?? t('orderIdentifier')}</Label>
              <Input {...register('orderIdentifier')} />
            </div>
            <div>
              <Label>{labels?.orderDate ?? t('orderDate')}</Label>
              <Input type="date" {...register('orderDate')} />
              {errors.orderDate ? (
                <p className="text-sm text-red-500 mt-1">
                  {errors.orderDate.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label>{labels?.status ?? t('status')}</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {['Draft', 'Submitted', 'Delivered', 'Completed'].map(
                        (s) => (
                          <SelectItem key={s} value={s}>
                            {t(`orderStatus.${s}`)}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label>{labels?.deliveryDate ?? t('deliveryDate')}</Label>
              <Input type="date" {...register('deliveryDate')} />
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
