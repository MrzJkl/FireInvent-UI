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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { usePersons } from '@/features/persons/usePersons';
import { useStorageLocations } from '@/features/storage-locations/useStorageLocations';
import type { ItemAssignmentHistoryModel } from '@/api/types.gen';
import { DatePicker } from '@/components/ui/date-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const schema = z
  .object({
    assignmentType: z.enum(['person', 'storageLocation']),
    personId: z.string().optional(),
    storageLocationId: z.string().optional(),
    assignedFrom: z.string(),
    assignedUntil: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.assignmentType === 'person') return !!data.personId;
      if (data.assignmentType === 'storageLocation')
        return !!data.storageLocationId;
      return false;
    },
    {
      message: 'Either person or storage location must be selected',
      path: ['assignmentType'],
    },
  );

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
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'de' ? de : enUS;
  const { persons, initialLoading: personsLoading } = usePersons();
  const { items: locations, initialLoading: locationsLoading } =
    useStorageLocations();

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    control,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      assignmentType: 'person',
      personId: '',
      storageLocationId: undefined,
      assignedFrom: new Date().toISOString().substring(0, 10),
      assignedUntil: undefined,
    },
  });

  const assignmentType = watch('assignmentType');
  const currentPersonId = watch('personId');
  const currentStorageLocationId = watch('storageLocationId');
  const assignedFrom = watch('assignedFrom');
  const assignedUntil = watch('assignedUntil');

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          assignmentType: 'person',
          personId: '',
          storageLocationId: undefined,
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
            <Label>{t('itemAssignments.assignmentType')}</Label>
            <RadioGroup
              value={assignmentType}
              onValueChange={(value: string) =>
                setValue(
                  'assignmentType',
                  value as 'person' | 'storageLocation',
                )
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="person" id="person" />
                <Label htmlFor="person" className="cursor-pointer font-normal">
                  {t('person')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="storageLocation" id="storageLocation" />
                <Label
                  htmlFor="storageLocation"
                  className="cursor-pointer font-normal"
                >
                  {t('storageLocation')}
                </Label>
              </div>
            </RadioGroup>
            {errors.assignmentType && (
              <p className="text-sm text-destructive mt-1">
                {errors.assignmentType.message}
              </p>
            )}
          </div>

          {assignmentType === 'person' && (
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
          )}

          {assignmentType === 'storageLocation' && (
            <div>
              <Label>{t('storageLocation')}</Label>
              <Select
                value={currentStorageLocationId}
                onValueChange={(v) => setValue('storageLocationId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('select') as string} />
                </SelectTrigger>
                <SelectContent>
                  {locationsLoading
                    ? null
                    : locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
              {errors.storageLocationId && (
                <p className="text-sm text-destructive mt-1">
                  {errors.storageLocationId.message}
                </p>
              )}
            </div>
          )}

          <div>
            <Controller
              name="assignedFrom"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  locale={locale}
                  dateLabel={t('itemAssignments.assignedFrom')}
                  placeholder={t('selectDate')}
                />
              )}
            />
            {errors.assignedFrom && (
              <p className="text-sm text-destructive mt-1">
                {errors.assignedFrom.message}
              </p>
            )}
          </div>

          <div>
            <Controller
              name="assignedUntil"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  locale={locale}
                  dateLabel={t('itemAssignments.assignedUntil')}
                  placeholder={t('selectDate')}
                />
              )}
            />
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
