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
import { Checkbox } from '@/components/ui/checkbox';
import { useDepartments } from '@/features/departments/useDepartments';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  remarks: z.string().optional(),
  contactInfo: z.string().optional(),
  externalId: z.string().optional(),
  departmentIds: z.array(z.string()).optional(),
});

export type PersonFormValues = z.infer<typeof schema>;

export type PersonFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: PersonFormValues;
  loading?: boolean;
  onSubmit: (values: PersonFormValues) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  labels?: {
    titleCreate?: string;
    titleEdit?: string;
    firstName?: string;
    lastName?: string;
    remarks?: string;
    contactInfo?: string;
    externalId?: string;
    cancel?: string;
    save?: string;
    add?: string;
  };
};

export function PersonFormDialog({
  open,
  mode,
  initialValues,
  loading,
  onSubmit,
  onOpenChange,
  labels,
}: PersonFormDialogProps) {
  const { t } = useTranslation();
  const { items: departments, initialLoading: departmentsLoading } =
    useDepartments();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<PersonFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      firstName: '',
      lastName: '',
      remarks: '',
      contactInfo: '',
      externalId: '',
      departmentIds: [],
    },
  });

  const selectedDepartmentIds = watch('departmentIds') || [];

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          firstName: '',
          lastName: '',
          remarks: '',
          contactInfo: '',
          externalId: '',
          departmentIds: [],
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
              ? (labels?.titleEdit ?? 'Edit Person')
              : (labels?.titleCreate ?? 'Add new Person')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? t('persons.descriptionEdit')
              : t('persons.descriptionAdd')}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-6 mt-2" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{labels?.firstName ?? 'First Name'}</Label>
              <Input {...register('firstName')} />
              {errors.firstName ? (
                <p className="text-sm text-red-500 mt-1">
                  {errors.firstName.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label>{labels?.lastName ?? 'Last Name'}</Label>
              <Input {...register('lastName')} />
              {errors.lastName ? (
                <p className="text-sm text-red-500 mt-1">
                  {errors.lastName.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{labels?.contactInfo ?? 'Contact Info'}</Label>
              <Input {...register('contactInfo')} />
            </div>
            <div>
              <Label>{labels?.externalId ?? 'External ID'}</Label>
              <Input {...register('externalId')} />
            </div>
          </div>

          <div>
            <Label>{labels?.remarks ?? 'Remarks'}</Label>
            <Input {...register('remarks')} />
          </div>

          <div>
            <Label>{t('departmentPlural')}</Label>
            <div className="mt-2 space-y-2">
              {departmentsLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : !departments.length ? (
                <p className="text-sm text-muted-foreground">
                  Keine Abteilungen
                </p>
              ) : (
                departments.map((d) => {
                  const checked = selectedDepartmentIds.includes(d.id);
                  return (
                    <label
                      key={d.id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => {
                          const isChecked = value === true;
                          let next = selectedDepartmentIds;
                          if (isChecked && !checked) {
                            next = [...next, d.id];
                          } else if (!isChecked && checked) {
                            next = next.filter((id) => id !== d.id);
                          }
                          setValue('departmentIds', next, {
                            shouldDirty: true,
                          });
                        }}
                      />
                      <span>{d.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {labels?.cancel ?? 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading}>
              {mode === 'edit'
                ? (labels?.save ?? 'Save')
                : (labels?.add ?? 'Add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
