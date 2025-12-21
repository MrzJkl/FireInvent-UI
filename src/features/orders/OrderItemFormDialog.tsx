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
import { useAllVariants } from '@/features/variants/useAllVariants';
import { usePersons } from '@/features/persons/usePersons';

const schema = z.object({
  variantId: z.string().min(1, 'Variant is required'),
  personId: z.string().optional(),
  quantity: z.string().min(1, 'Quantity is required'),
});

export type OrderItemFormValues = z.infer<typeof schema>;

export type OrderItemFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  orderId: string;
  initialValues?: OrderItemFormValues;
  loading?: boolean;
  onSubmit: (values: OrderItemFormValues) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  labels?: {
    titleCreate?: string;
    titleEdit?: string;
    variant?: string;
    person?: string;
    quantity?: string;
    cancel?: string;
    save?: string;
    add?: string;
  };
};

export function OrderItemFormDialog({
  open,
  mode,
  initialValues,
  loading,
  onSubmit,
  onOpenChange,
  labels,
}: OrderItemFormDialogProps) {
  const { t } = useTranslation();
  const { variants, initialLoading: variantsLoading } = useAllVariants();
  const { persons, initialLoading: personsLoading } = usePersons();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<OrderItemFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      variantId: '',
      personId: undefined,
      quantity: '1',
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          variantId: '',
          personId: undefined,
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
              ? (labels?.titleEdit ?? 'Edit Order Item')
              : (labels?.titleCreate ?? 'Add Order Item')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? t('orderItems.descriptionEdit')
              : t('orderItems.descriptionAdd')}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-2" onSubmit={submit}>
          <div className="grid gap-4">
            <div>
              <Label>{labels?.variant ?? t('variant')}</Label>
              <Controller
                name="variantId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={variantsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {variants.map((variant) => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.product?.name} - {variant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.variantId ? (
                <p className="text-sm text-red-500 mt-1">
                  {errors.variantId.message}
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

            <div>
              <Label>{labels?.person ?? t('person')} (Optional)</Label>
              <Controller
                name="personId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={(v) => field.onChange(v || undefined)}
                    disabled={personsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {persons.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.firstName && person.lastName
                            ? `${person.firstName} ${person.lastName}`
                            : person.contactInfo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
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
