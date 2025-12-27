import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { de, enUS } from 'date-fns/locale';
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
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';

const conditionOptions = [
  'New',
  'Used',
  'Damaged',
  'Destroyed',
  'Lost',
] as const;

const schema = z.object({
  variantId: z.string().min(1),
  identifier: z.string().optional(),
  condition: z.enum(conditionOptions),
  purchaseDate: z.string().min(1),
  isDemoItem: z.boolean(),
  retirementDate: z.string().optional(),
});

export type ItemFormValues = z.infer<typeof schema>;

export type ItemFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: ItemFormValues;
  loading?: boolean;
  variantId?: string;
  onSubmit: (values: ItemFormValues) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  labels?: {
    titleCreate?: string;
    titleEdit?: string;
    variant?: string;
    identifier?: string;
    condition?: string;
    purchaseDate?: string;
    isDemoItem?: string;
    retirementDate?: string;
    cancel?: string;
    save?: string;
    add?: string;
  };
};

export function ItemFormDialog({
  open,
  mode,
  initialValues,
  loading,
  onSubmit,
  onOpenChange,
  labels,
  variantId,
}: ItemFormDialogProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'de' ? de : enUS;

  const { register, handleSubmit, reset, setValue, watch, control } =
    useForm<ItemFormValues>({
      resolver: zodResolver(schema),
      defaultValues: initialValues ?? {
        variantId: variantId ?? '',
        identifier: '',
        condition: 'New',
        purchaseDate: new Date().toISOString().substring(0, 10),
        isDemoItem: false,
        retirementDate: undefined,
      },
    });

  const currentCondition = watch('condition');
  const isDemoItem = watch('isDemoItem');

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          variantId: variantId ?? '',
          identifier: '',
          condition: 'New',
          purchaseDate: new Date().toISOString().substring(0, 10),
          isDemoItem: false,
          retirementDate: undefined,
        },
      );
    }
  }, [open, initialValues, reset, variantId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? labels?.titleCreate || t('add')
              : labels?.titleEdit || t('edit')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? t('items.descriptionAdd')
              : t('items.descriptionEdit')}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values);
          })}
          className="space-y-4"
        >
          <div>
            <Label>{labels?.identifier ?? t('identifier')}</Label>
            <Input {...register('identifier')} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDemoItem"
              checked={isDemoItem}
              onCheckedChange={(checked) => setValue('isDemoItem', !!checked)}
            />
            <Label htmlFor="isDemoItem" className="cursor-pointer">
              {labels?.isDemoItem ?? t('items.isDemoItem')}
            </Label>
          </div>

          <div>
            <Label>{labels?.condition ?? t('condition')}</Label>
            <Select
              value={currentCondition}
              onValueChange={(v) =>
                setValue('condition', v as ItemFormValues['condition'])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('select') as string} />
              </SelectTrigger>
              <SelectContent>
                {conditionOptions.map((cond) => (
                  <SelectItem key={cond} value={cond}>
                    {t(`itemCondition.${cond}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Controller
              name="purchaseDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  locale={locale}
                  dateLabel={labels?.purchaseDate ?? t('purchaseDate')}
                  placeholder={t('selectDate')}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="retirementDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  locale={locale}
                  dateLabel={labels?.retirementDate ?? t('retirementDate')}
                  placeholder={t('selectDate')}
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {labels?.cancel ?? t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {mode === 'create'
                ? (labels?.add ?? t('add'))
                : (labels?.save ?? t('save'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
