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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  street: z.string().optional(),
  houseNumber: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  website: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

export type ManufacturerFormValues = z.infer<typeof schema>;

export type ManufacturerFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: ManufacturerFormValues;
  loading?: boolean;
  onSubmit: (values: ManufacturerFormValues) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  labels?: {
    titleCreate?: string;
    titleEdit?: string;
    name?: string;
    description?: string;
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    website?: string;
    phoneNumber?: string;
    email?: string;
    cancel?: string;
    save?: string;
  };
};

export function ManufacturerFormDialog({
  open,
  mode,
  initialValues,
  loading = false,
  onSubmit,
  onOpenChange,
  labels = {},
}: ManufacturerFormDialogProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManufacturerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues || {
      name: '',
      description: '',
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      country: '',
      website: '',
      phoneNumber: '',
      email: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (initialValues) {
        reset(initialValues);
      } else {
        reset({
          name: '',
          description: '',
          street: '',
          houseNumber: '',
          postalCode: '',
          city: '',
          country: '',
          website: '',
          phoneNumber: '',
          email: '',
        });
      }
    }
  }, [open, initialValues, reset]);

  const onSubmitHandler = async (values: ManufacturerFormValues) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? labels.titleCreate || t('manufacturers.add')
              : labels.titleEdit || t('manufacturers.edit')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? t('manufacturers.addDescription')
              : t('manufacturers.editDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{labels.name || t('name')}</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  placeholder={labels.name || t('name')}
                  disabled={loading}
                />
              )}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {labels.description || t('description')}
            </Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="description"
                  placeholder={labels.description || t('description')}
                  disabled={loading}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">{labels.street || t('street')}</Label>
              <Controller
                name="street"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="street"
                    placeholder={labels.street || t('street')}
                    disabled={loading}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="houseNumber">
                {labels.houseNumber || t('houseNumber')}
              </Label>
              <Controller
                name="houseNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="houseNumber"
                    placeholder={labels.houseNumber || t('houseNumber')}
                    disabled={loading}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">
                {labels.postalCode || t('postalCode')}
              </Label>
              <Controller
                name="postalCode"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="postalCode"
                    placeholder={labels.postalCode || t('postalCode')}
                    disabled={loading}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{labels.city || t('city')}</Label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="city"
                    placeholder={labels.city || t('city')}
                    disabled={loading}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">{labels.country || t('country')}</Label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="country"
                    placeholder={labels.country || t('country')}
                    disabled={loading}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">{labels.website || t('website')}</Label>
            <Controller
              name="website"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="website"
                  placeholder={labels.website || t('website')}
                  disabled={loading}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              {labels.phoneNumber || t('phoneNumber')}
            </Label>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="phoneNumber"
                  placeholder={labels.phoneNumber || t('phoneNumber')}
                  disabled={loading}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{labels.email || t('email')}</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder={labels.email || t('email')}
                  disabled={loading}
                />
              )}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {labels.cancel || t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '...' : labels.save || t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
