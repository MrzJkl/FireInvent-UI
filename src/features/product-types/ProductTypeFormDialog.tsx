import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export type ProductTypeFormValues = z.infer<typeof schema>;

export type ProductTypeFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: ProductTypeFormValues;
  loading?: boolean;
  onSubmit: (values: ProductTypeFormValues) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  labels?: {
    titleCreate?: string;
    titleEdit?: string;
    name?: string;
    description?: string;
    cancel?: string;
    save?: string;
    add?: string;
  };
};

export function ProductTypeFormDialog({
  open,
  mode,
  initialValues,
  loading,
  onSubmit,
  onOpenChange,
  labels,
}: ProductTypeFormDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductTypeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? { name: '', description: '' },
  });

  useEffect(() => {
    if (open) {
      reset(initialValues ?? { name: '', description: '' });
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
              ? (labels?.titleEdit ?? 'Edit Product-Type')
              : (labels?.titleCreate ?? 'Add new Product-Type')}
          </DialogTitle>
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
            <Label>{labels?.description ?? 'Description'}</Label>
            <Input {...register('description')} />
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
