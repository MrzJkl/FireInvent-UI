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

export type ApiIntegrationFormValues = {
  name: string;
  description?: string;
};

export type ApiIntegrationFormDialogProps = {
  open: boolean;
  loading?: boolean;
  onSubmit: (values: ApiIntegrationFormValues) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
};

export function ApiIntegrationFormDialog({
  open,
  loading,
  onSubmit,
  onOpenChange,
}: ApiIntegrationFormDialogProps) {
  const { t } = useTranslation();

  const schema = z.object({
    name: z
      .string()
      .min(1, t('apiIntegrations.nameRequired'))
      .max(100, t('apiIntegrations.nameMaxLength')),
    description: z
      .string()
      .max(500, t('apiIntegrations.descriptionMaxLength'))
      .optional(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApiIntegrationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ name: '', description: '' });
    }
  }, [open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('apiIntegrations.add')}</DialogTitle>
          <DialogDescription>
            {t('apiIntegrations.descriptionAdd')}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-2" onSubmit={submit}>
          <div>
            <Label>{t('name')} *</Label>
            <Input
              {...register('name')}
              placeholder={t('apiIntegrations.namePlaceholder')}
            />
            {errors.name ? (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            ) : null}
          </div>
          <div>
            <Label>{t('description')}</Label>
            <Input
              {...register('description')}
              placeholder={t('apiIntegrations.descriptionPlaceholder')}
            />
            {errors.description ? (
              <p className="text-sm text-red-500 mt-1">
                {errors.description.message}
              </p>
            ) : null}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? t('apiIntegrations.creating')
                : t('apiIntegrations.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
