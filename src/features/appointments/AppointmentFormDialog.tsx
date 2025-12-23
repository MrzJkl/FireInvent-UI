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
import { DateTimePicker } from '@/components/ui/date-time-picker';

const schema = z.object({
  scheduledAt: z.string().min(1),
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
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'de' ? de : enUS;

  const {
    register,
    handleSubmit,
    control,
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
              <Controller
                name="scheduledAt"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    locale={locale}
                    dateLabel={labels?.date ?? t('appointmentDate')}
                    timeLabel={t('time')}
                    placeholder={t('selectDate')}
                  />
                )}
              />
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
