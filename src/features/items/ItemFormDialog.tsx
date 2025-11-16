import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { useStorageLocations } from '@/features/storage-locations/useStorageLocations';

const schema = z.object({
  variantId: z.string().min(1, 'Variant is required'),
  identifier: z.string().optional(),
  storageLocationId: z.string().optional(),
  condition: z.number(),
  purchaseDate: z.string(),
  retirementDate: z.string().optional(),
});

export type ItemFormValues = z.infer<typeof schema>;

export type ItemFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: ItemFormValues;
  loading?: boolean;
  variants?: Array<{ id: string; name: string }>;
  variantsLoading?: boolean;
  onSubmit: (values: ItemFormValues) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  labels?: {
    titleCreate?: string;
    titleEdit?: string;
    variant?: string;
    identifier?: string;
    storageLocation?: string;
    condition?: string;
    purchaseDate?: string;
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
  variants,
  variantsLoading,
}: ItemFormDialogProps) {
  const { t } = useTranslation();
  const { items: locations, initialLoading: locationsLoading } =
    useStorageLocations();

  const { register, handleSubmit, reset, setValue } = useForm<ItemFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      variantId: '',
      identifier: '',
      storageLocationId: undefined,
      condition: 0,
      purchaseDate: new Date().toISOString().substring(0, 10),
      retirementDate: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          variantId: '',
          identifier: '',
          storageLocationId: undefined,
          condition: 0,
          purchaseDate: new Date().toISOString().substring(0, 10),
          retirementDate: undefined,
        },
      );
    }
  }, [open, initialValues, reset]);

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
            <Label>{labels?.variant ?? t('variant')}</Label>
            <Select onValueChange={(v) => setValue('variantId', v)}>
              <SelectTrigger>
                <SelectValue placeholder={t('select') as string} />
              </SelectTrigger>
              <SelectContent>
                {variantsLoading
                  ? null
                  : variants?.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{labels?.identifier ?? 'Identifier'}</Label>
            <Input {...register('identifier')} />
          </div>

          <div>
            <Label>{labels?.storageLocation ?? 'Storage Location'}</Label>
            <Select onValueChange={(v) => setValue('storageLocationId', v)}>
              <SelectTrigger>
                <SelectValue placeholder={t('select') as string} />
              </SelectTrigger>
              <SelectContent>
                {locationsLoading
                  ? null
                  : locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{labels?.condition ?? 'Condition'}</Label>
            <Input
              type="number"
              {...register('condition', { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label>{labels?.purchaseDate ?? 'Purchase Date'}</Label>
            <Input type="date" {...register('purchaseDate')} />
          </div>

          <div>
            <Label>{labels?.retirementDate ?? 'Retirement Date'}</Label>
            <Input type="date" {...register('retirementDate')} />
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
