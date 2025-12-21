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
import { useMaintenanceTypes } from '@/features/maintenance-types/useMaintenanceTypes';
import { useUsers } from '@/hooks/useUsers';

const schema = z.object({
  typeId: z.string().min(1),
  performedAt: z.string(),
  performedById: z.string().optional(),
  remarks: z.string().optional(),
});

export type MaintenanceFormValues = z.infer<typeof schema>;

export type MaintenanceFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: MaintenanceFormValues;
  loading?: boolean;
  onSubmit: (values: MaintenanceFormValues) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
};

export function MaintenanceFormDialog({
  open,
  mode,
  initialValues,
  loading,
  onSubmit,
  onOpenChange,
}: MaintenanceFormDialogProps) {
  const { t } = useTranslation();
  const { items: maintenanceTypes, initialLoading: typesLoading } =
    useMaintenanceTypes();
  const { users, initialLoading: usersLoading } = useUsers();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      typeId: '',
      performedAt: new Date().toISOString().substring(0, 10),
      performedById: undefined,
      remarks: '',
    },
  });

  const currentTypeId = watch('typeId');
  const currentPerformedById = watch('performedById');

  const getValidationError = (): string => {
    return t('validationMaintenanceTypeRequired');
  };

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          typeId: '',
          performedAt: new Date().toISOString().substring(0, 10),
          performedById: undefined,
          remarks: '',
        },
      );
    }
  }, [open, initialValues, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? t('maintenances.add') : t('maintenances.edit')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? t('maintenances.descriptionAdd')
              : t('maintenances.descriptionEdit')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>{t('maintenances.type')}</Label>
            <Select
              value={currentTypeId}
              onValueChange={(v) => setValue('typeId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('select') as string} />
              </SelectTrigger>
              <SelectContent>
                {typesLoading
                  ? null
                  : maintenanceTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            {errors.typeId && (
              <p className="text-sm text-destructive mt-1">
                {getValidationError()}
              </p>
            )}
          </div>

          <div>
            <Label>{t('maintenances.performedAt')}</Label>
            <Input type="date" {...register('performedAt')} />
            {errors.performedAt && (
              <p className="text-sm text-destructive mt-1">
                {errors.performedAt.message}
              </p>
            )}
          </div>

          <div>
            <Label>
              {t('maintenances.performedBy')} ({t('optional')})
            </Label>
            <Select
              value={currentPerformedById}
              onValueChange={(v) => setValue('performedById', v)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t('maintenances.noUserSelected') as string}
                />
              </SelectTrigger>
              <SelectContent>
                {usersLoading
                  ? null
                  : users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.eMail}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            {errors.performedById && (
              <p className="text-sm text-destructive mt-1">
                {errors.performedById.message}
              </p>
            )}
          </div>

          <div>
            <Label>{t('maintenances.remarks')}</Label>
            <Input
              {...register('remarks')}
              placeholder={t('optional') as string}
            />
            {errors.remarks && (
              <p className="text-sm text-destructive mt-1">
                {errors.remarks.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {mode === 'create' ? t('add') : t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
