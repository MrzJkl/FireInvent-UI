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
import { usePersons } from '@/features/persons/usePersons';
import type { ItemAssignmentHistoryModel } from '@/api/types.gen';

const schema = z.object({
  personId: z.string().min(1),
  assignedFrom: z.string(),
  assignedUntil: z.string().optional(),
});

export type AssignmentFormValues = z.infer<typeof schema>;

export type ItemAssignmentFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: AssignmentFormValues;
  loading?: boolean;
  itemId: string;
  editingAssignmentId?: string | null;
  existingAssignments: ItemAssignmentHistoryModel[];
  onSubmit: (values: AssignmentFormValues) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
};

export function ItemAssignmentFormDialog({
  open,
  mode,
  initialValues,
  loading,
  editingAssignmentId,
  existingAssignments,
  onSubmit,
  onOpenChange,
}: ItemAssignmentFormDialogProps) {
  const { t } = useTranslation();
  const { persons, initialLoading: personsLoading } = usePersons();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      personId: '',
      assignedFrom: new Date().toISOString().substring(0, 10),
      assignedUntil: undefined,
    },
  });

  const currentPersonId = watch('personId');
  const assignedFrom = watch('assignedFrom');
  const assignedUntil = watch('assignedUntil');

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          personId: '',
          assignedFrom: new Date().toISOString().substring(0, 10),
          assignedUntil: undefined,
        },
      );
    }
  }, [open, initialValues, reset]);

  const checkOverlap = (from: string, until: string | undefined): boolean => {
    const newFrom = new Date(from);
    const newUntil = until ? new Date(until) : null;

    return existingAssignments.some((a) => {
      // Exclude current assignment when editing (matching server logic: a.Id != model.Id)
      if (editingAssignmentId && a.id === editingAssignmentId) {
        return false;
      }

      const existingFrom = new Date(a.assignedFrom);
      const existingUntil = a.assignedUntil ? new Date(a.assignedUntil) : null;

      // Check overlap: (newUntil == null || existingFrom <= newUntil) && (existingUntil == null || existingUntil >= newFrom)
      const overlaps =
        (!newUntil || existingFrom <= newUntil) &&
        (!existingUntil || existingUntil >= newFrom);

      return overlaps;
    });
  };

  const handleFormSubmit = async (values: AssignmentFormValues) => {
    // Check for overlapping assignments
    if (checkOverlap(values.assignedFrom, values.assignedUntil)) {
      setError('assignedFrom', {
        type: 'manual',
        message: t('itemAssignments.overlapError'),
      });
      return;
    }

    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? t('add') : t('edit')}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? t('itemAssignments.descriptionAdd')
              : t('itemAssignments.descriptionEdit')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label>{t('person')}</Label>
            <Select
              value={currentPersonId}
              onValueChange={(v) => setValue('personId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('select') as string} />
              </SelectTrigger>
              <SelectContent>
                {personsLoading
                  ? null
                  : persons.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.firstName} {person.lastName}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            {errors.personId && (
              <p className="text-sm text-destructive mt-1">
                {errors.personId.message}
              </p>
            )}
          </div>

          <div>
            <Label>{t('itemAssignments.assignedFrom')}</Label>
            <Input type="date" {...register('assignedFrom')} />
            {errors.assignedFrom && (
              <p className="text-sm text-destructive mt-1">
                {errors.assignedFrom.message}
              </p>
            )}
          </div>

          <div>
            <Label>{t('itemAssignments.assignedUntil')}</Label>
            <Input type="date" {...register('assignedUntil')} />
            {errors.assignedUntil && (
              <p className="text-sm text-destructive mt-1">
                {errors.assignedUntil.message}
              </p>
            )}
          </div>

          {assignedFrom && assignedUntil && (
            <div className="text-sm text-muted-foreground">
              {checkOverlap(assignedFrom, assignedUntil) && (
                <p className="text-destructive">
                  ⚠️ {t('itemAssignments.overlapWarning')}
                </p>
              )}
            </div>
          )}

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
