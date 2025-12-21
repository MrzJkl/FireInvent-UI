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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePersons } from '@/features/persons/usePersons';

const schema = z.object({
  personId: z.string().min(1),
});

export type VisitFormValues = z.infer<typeof schema>;

export type VisitFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  appointmentId: string;
  initialValues?: VisitFormValues;
  loading?: boolean;
  onSubmit: (values: VisitFormValues) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  labels?: {
    titleCreate?: string;
    titleEdit?: string;
    person?: string;
    cancel?: string;
    save?: string;
    add?: string;
  };
};

export function VisitFormDialog({
  open,
  mode,
  initialValues,
  loading,
  onSubmit,
  onOpenChange,
  labels,
}: VisitFormDialogProps) {
  const { t } = useTranslation();
  const { persons, initialLoading: personsLoading } = usePersons();

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<VisitFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      personId: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          personId: '',
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
              ? (labels?.titleEdit ?? t('visits.titleEdit'))
              : (labels?.titleCreate ?? t('visits.titleCreate'))}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? t('visits.descriptionEdit')
              : t('visits.descriptionCreate')}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-2" onSubmit={submit}>
          <div className="grid gap-4">
            <div>
              <Label>{labels?.person ?? t('person')}</Label>
              <Controller
                name="personId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
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
              {errors.personId ? (
                <p className="text-sm text-red-500 mt-1">
                  {errors.personId.message}
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
