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

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  additionalSpecs: z.string().optional(),
});

export type VariantFormValues = z.infer<typeof schema>;

export type VariantFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: VariantFormValues;
  loading?: boolean;
  onSubmit: (values: VariantFormValues) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  labels?: {
    titleCreate?: string;
    titleEdit?: string;
    name?: string;
    additionalSpecs?: string;
    cancel?: string;
    save?: string;
    add?: string;
  };
};

export function VariantFormDialog({
  open,
  mode,
  initialValues,
  loading,
  onSubmit,
  onOpenChange,
  labels,
}: VariantFormDialogProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VariantFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      name: '',
      additionalSpecs: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          name: '',
          additionalSpecs: '',
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
              ? labels?.titleCreate || t('variants.add')
              : labels?.titleEdit || t('variants.edit')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? t('variants.descriptionAdd')
              : t('variants.descriptionEdit')}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values);
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">{labels?.name || t('name')}</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="additionalSpecs">
              {labels?.additionalSpecs || t('additionalSpecs')}
            </Label>
            <Input
              id="additionalSpecs"
              {...register('additionalSpecs')}
              className="h-24"
            />
            {errors.additionalSpecs && (
              <p className="text-sm text-destructive">
                {errors.additionalSpecs.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {labels?.cancel || t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {mode === 'create'
                ? labels?.add || t('add')
                : labels?.save || t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
