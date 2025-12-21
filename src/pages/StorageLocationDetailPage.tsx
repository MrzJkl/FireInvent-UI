import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { IconArrowLeft } from '@tabler/icons-react';
import { useStorageLocationDetail } from '@/features/storage-locations/useStorageLocationDetail';
import type { ItemModel } from '@/api/types.gen';
import { useAuthorization } from '@/auth/permissions';
import { StorageLocationFormDialog } from '@/features/storage-locations/StorageLocationFormDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useApiRequest } from '@/hooks/useApiRequest';
import { deleteStorageLocationsById, putStorageLocationsById } from '@/api';

export default function StorageLocationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { canEditCatalog } = useAuthorization();
  const canManage = canEditCatalog;

  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { callApi: updateLocation, loading: updating } = useApiRequest(
    putStorageLocationsById,
  );
  const { callApi: deleteLocation, loading: deleting } = useApiRequest(
    deleteStorageLocationsById,
  );

  const { storageLocation, items, initialLoading, error, refetch } =
    useStorageLocationDetail(id);

  const grouped = useMemo(() => {
    const productMap = new Map<
      string,
      {
        productName: string;
        productId: string;
        variants: Map<
          string,
          { variantName: string; variantId: string; items: ItemModel[] }
        >;
      }
    >();

    items.forEach((it) => {
      const product = it.variant?.product;
      const variant = it.variant;
      if (!product || !variant) return;

      if (!productMap.has(product.id)) {
        productMap.set(product.id, {
          productName: product.name,
          productId: product.id,
          variants: new Map(),
        });
      }
      const productEntry = productMap.get(product.id)!;

      if (!productEntry.variants.has(variant.id)) {
        productEntry.variants.set(variant.id, {
          variantName: variant.name,
          variantId: variant.id,
          items: [],
        });
      }
      productEntry.variants.get(variant.id)!.items.push(it);
    });

    return Array.from(productMap.values()).map((p) => ({
      ...p,
      variants: Array.from(p.variants.values()),
    }));
  }, [items]);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (initialLoading) return <LoadingIndicator />;

  if (!storageLocation) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {t('storageLocation')} {t('notFound')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/app/storageLocations')}>
              {t('storageLocationPlural')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/storageLocations')}
          >
            <IconArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{storageLocation.name}</h1>
            <p className="text-sm text-muted-foreground">
              {storageLocation.remarks || (
                <span className="italic text-muted-foreground">–</span>
              )}
            </p>
          </div>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFormOpen(true)}>
              {t('edit')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
              disabled={deleting}
            >
              {t('delete')}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">{t('details')}</TabsTrigger>
          <TabsTrigger value="items">{t('items.label')}</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('storageLocation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('name')}
                </div>
                <div className="mt-1">{storageLocation.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('remarks')}
                </div>
                <div className="mt-1">
                  {storageLocation.remarks || (
                    <span className="italic text-muted-foreground">–</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('items.label')}</CardTitle>
            </CardHeader>
            <CardContent>
              {grouped.length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  {t('itemsEmpty')}
                </div>
              ) : (
                <div className="space-y-4">
                  {grouped.map((product) => (
                    <div
                      key={product.productId}
                      className="rounded border p-3 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Button
                          variant="link"
                          className="h-auto p-0 text-base font-semibold"
                          onClick={() =>
                            navigate(`/app/products/${product.productId}`)
                          }
                        >
                          {product.productName}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {product.variants.map((variant) => (
                          <div
                            key={variant.variantId}
                            className="rounded border p-2 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <Button
                                variant="link"
                                className="h-auto p-0 font-medium"
                                onClick={() =>
                                  navigate(
                                    `/app/products/${product.productId}?variant=${variant.variantId}`,
                                  )
                                }
                              >
                                {variant.variantName}
                              </Button>
                              <span className="text-xs text-muted-foreground">
                                {t('itemsCount', {
                                  count: variant.items.length,
                                })}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {variant.items.map((it) => (
                                <div
                                  key={it.id}
                                  className="flex items-center justify-between rounded border p-2 hover:bg-muted/50 cursor-pointer"
                                  onClick={() =>
                                    navigate(`/app/items/${it.id}`)
                                  }
                                >
                                  <div>
                                    <p className="text-sm font-medium">
                                      {it.identifier || it.id}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {t(`itemCondition.${it.condition}`)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {canManage && storageLocation && (
        <>
          <StorageLocationFormDialog
            open={formOpen}
            mode="edit"
            initialValues={{
              name: storageLocation.name,
              remarks: storageLocation.remarks ?? '',
            }}
            loading={updating}
            onOpenChange={(o) => setFormOpen(o)}
            labels={{
              titleEdit: t('storageLocations.edit'),
              name: t('name'),
              remarks: t('remarks'),
              cancel: t('cancel'),
              save: t('save'),
            }}
            onSubmit={async (values) => {
              const payload = {
                name: values.name,
                remarks: values.remarks || undefined,
              };
              await updateLocation({
                path: { id: storageLocation.id },
                body: payload,
              });
              setFormOpen(false);
              await refetch();
            }}
          />

          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={(o) => setConfirmOpen(o)}
            title={t('confirmDeleteTitle')}
            description={t('confirmDeleteDescription', {
              name: storageLocation.name,
            })}
            confirmLabel={t('delete')}
            cancelLabel={t('cancel')}
            confirmVariant="destructive"
            confirmDisabled={deleting}
            onConfirm={async () => {
              await deleteLocation({ path: { id: storageLocation.id } });
              setConfirmOpen(false);
              navigate('/app/storageLocations');
            }}
          />
        </>
      )}
    </div>
  );
}
