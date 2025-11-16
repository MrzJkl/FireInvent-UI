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
  remarks: z.string().optional(),
});

export type StorageLocationFormValues = z.infer<typeof schema>;

export type StorageLocationFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: StorageLocationFormValues;
  loading?: boolean;
  onSubmit: (values: StorageLocationFormValues) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  labels?: {
    titleCreate?: string;
    titleEdit?: string;
    name?: string;
    remarks?: string;
    cancel?: string;
    save?: string;
    add?: string;
  };
};

export function StorageLocationFormDialog({
  open,
  mode,
  initialValues,
  loading,
  onSubmit,
  onOpenChange,
  labels,
}: StorageLocationFormDialogProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StorageLocationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? { name: '', remarks: '' },
  });

  useEffect(() => {
    if (open) {
      reset(initialValues ?? { name: '', remarks: '' });
    }
  }, [open, initialValues, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit'
              ? (labels?.titleEdit ?? 'Edit Storage Location')
              : (labels?.titleCreate ?? 'Add new Storage Location')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? t('storageLocations.descriptionEdit')
              : t('storageLocations.descriptionAdd')}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-2" onSubmit={submit}>
          <div>
            <Label>{labels?.name ?? 'Name'}</Label>
            <Input {...register('name')} />
            {errors.name ? (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            ) : null}
          </div>
          <div>
            <Label>{labels?.remarks ?? 'Remarks'}</Label>
            <Input {...register('remarks')} />
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
