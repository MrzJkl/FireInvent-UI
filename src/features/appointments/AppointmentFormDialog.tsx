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
  scheduledAt: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
});

export type AppointmentFormValues = z.infer<typeof schema>;

export type AppointmentFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: AppointmentFormValues;
  loading?: boolean;
  onSubmit: (values: AppointmentFormValues) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  labels?: {
    titleCreate?: string;
    titleEdit?: string;
    date?: string;
    description?: string;
    cancel?: string;
    save?: string;
    add?: string;
  };
};

export function AppointmentFormDialog({
  open,
  mode,
  initialValues,
  loading,
  onSubmit,
  onOpenChange,
  labels,
}: AppointmentFormDialogProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      scheduledAt: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          scheduledAt: '',
          description: '',
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
              ? (labels?.titleEdit ?? t('appointments.titleEdit'))
              : (labels?.titleCreate ?? t('appointments.titleCreate'))}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? t('appointments.descriptionEdit')
              : t('appointments.descriptionCreate')}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-2" onSubmit={submit}>
          <div className="grid gap-4">
            <div>
              <Label>{labels?.date ?? t('appointmentDate')}</Label>
              <Input type="datetime-local" {...register('scheduledAt')} />
              {errors.scheduledAt ? (
                <p className="text-sm text-red-500 mt-1">
                  {errors.scheduledAt.message}
                </p>
              ) : null}
            </div>

            <div>
              <Label>
                {labels?.description ?? t('description')} (Optional)
              </Label>
              <Input {...register('description')} />
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
