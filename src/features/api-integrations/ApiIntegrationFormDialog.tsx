import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
  name: z.string().min(1, 'Name ist erforderlich').max(100),
  description: z.string().max(500).optional(),
});

export type ApiIntegrationFormValues = z.infer<typeof schema>;

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
          <DialogTitle>Neue API-Integration erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie eine neue API-Integration. Nach dem Erstellen werden
            die Zugangsdaten einmalig angezeigt.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-2" onSubmit={submit}>
          <div>
            <Label>Name *</Label>
            <Input {...register('name')} placeholder="Meine Integration" />
            {errors.name ? (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            ) : null}
          </div>
          <div>
            <Label>Beschreibung</Label>
            <Input
              {...register('description')}
              placeholder="Optionale Beschreibung der Integration"
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
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Erstelle...' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
