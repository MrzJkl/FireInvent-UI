import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { ProductFormDialog } from '@/features/products/ProductFormDialog';
import { useVariants } from '@/features/variants/useVariants';
import { VariantFormDialog } from '@/features/variants/VariantFormDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useItems } from '@/features/items/useItems';
import { ItemFormDialog } from '@/features/items/ItemFormDialog';
import { useProducts } from '@/features/products/useProducts';
import { type ProductModel } from '@/api/types.gen';
import { useTranslation } from 'react-i18next';
import {
  IconArrowLeft,
  IconEdit,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formOpen, setFormOpen] = useState(false);
  const [variantFormOpen, setVariantFormOpen] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);
  const [confirmVariantOpen, setConfirmVariantOpen] = useState(false);
  const [product, setProduct] = useState<ProductModel | null>(null);

  const { products, isLoading, updateProduct, error: productsError, refetch: refetchProducts } = useProducts();
  const {
    variants,
    isLoading: variantsLoading,
    isCreating: creatingVariant,
    isUpdating: updatingVariant,
    isDeleting: deletingVariant,
    error: variantsError,
    createVariant,
    updateVariant,
    deleteVariant,
    refetch: refetchVariants,
  } = useVariants(id);

  const {
    items,
    isLoading: itemsLoading,
    isCreating: creatingItem,
    isUpdating: updatingItem,
    isDeleting: deletingItem,
    error: itemsError,
    createItem,
    updateItem,
    deleteItem,
    refetch: refetchItems,
  } = useItems(id, variants);

  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [confirmItemOpen, setConfirmItemOpen] = useState(false);
  const [expandedVariants, setExpandedVariants] = useState<
    Record<string, boolean>
  >({});
  const [createForVariantId, setCreateForVariantId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (products && id) {
      const found = products.find((p) => p.id === id);
      setProduct(found || null);
    }
  }, [products, id]);

  if (productsError) return <ErrorState error={productsError} onRetry={refetchProducts} />;
  if (variantsError) return <ErrorState error={variantsError} onRetry={refetchVariants} />;
  if (itemsError) return <ErrorState error={itemsError} onRetry={refetchItems} />;
  if (isLoading) return <LoadingIndicator />;

  if (!product) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('product')} nicht gefunden</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/app/products')}>
              {t('productPlural')} anzeigen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/products')}
          >
            <IconArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-sm text-muted-foreground">
              {product.type.name} · {product.manufacturer}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setFormOpen(true)}
          className="gap-2"
        >
          <IconEdit className="size-4" />
          {t('edit')}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="product" className="w-full">
        <TabsList>
          <TabsTrigger value="product">{t('product')}</TabsTrigger>
          <TabsTrigger value="variants">{t('variantPlural')}</TabsTrigger>
        </TabsList>

        {/* Product Tab */}
        <TabsContent value="product" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Produktdetails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('name')}
                </div>
                <div className="mt-1">{product.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('manufacturer')}
                </div>
                <div className="mt-1">{product.manufacturer}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('productType')}
                </div>
                <div className="mt-1">{product.type.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('description')}
                </div>
                <div className="mt-1">
                  {product.description || (
                    <span className="text-muted-foreground italic">-</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('variantPlural')}</CardTitle>
              <Button
                size="sm"
                onClick={() => {
                  setEditingVariantId(null);
                  setVariantFormOpen(true);
                }}
              >
                {t('add')}
              </Button>
            </CardHeader>
            <CardContent>
              {variantsLoading ? (
                <LoadingIndicator />
              ) : variants.length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  {t('variantPlural')} leer
                </div>
              ) : (
                <div className="space-y-2">
                  {variants.map((v) => {
                    const isOpen = !!expandedVariants[v.id];
                    const variantItems = items.filter(
                      (it) => it.variantId === v.id,
                    );
                    return (
                      <div key={v.id} className="rounded border">
                        <div className="flex items-start justify-between p-3">
                          <div className="flex items-start gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={isOpen ? t('hide') : t('show')}
                              onClick={() =>
                                setExpandedVariants((prev) => ({
                                  ...prev,
                                  [v.id]: !prev[v.id],
                                }))
                              }
                            >
                              {isOpen ? (
                                <IconChevronDown className="size-4" />
                              ) : (
                                <IconChevronRight className="size-4" />
                              )}
                            </Button>
                            <div className="space-y-1">
                              <p className="font-medium">{v.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(v.additionalSpecs || '–') +
                                  ' · ' +
                                  t('itemsCount', {
                                    count: variantItems.length,
                                  })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingVariantId(v.id);
                                setVariantFormOpen(true);
                              }}
                            >
                              {t('edit')}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setDeleteVariantId(v.id);
                                setConfirmVariantOpen(true);
                              }}
                            >
                              {t('delete')}
                            </Button>
                          </div>
                        </div>
                        {isOpen && (
                          <div className="border-t p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <p className="text-sm font-medium">
                                {t('items.label')}
                              </p>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setEditingItemId(null);
                                  setCreateForVariantId(v.id);
                                  setItemFormOpen(true);
                                }}
                              >
                                {t('add')}
                              </Button>
                            </div>
                            {itemsLoading ? (
                              <LoadingIndicator />
                            ) : variantItems.length === 0 ? (
                              <div className="flex h-16 items-center justify-center text-muted-foreground">
                                {t('itemsEmpty')}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {variantItems.map((it) => (
                                  <div
                                    key={it.id}
                                    className="flex items-start justify-between rounded border p-2 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() =>
                                      navigate(`/app/items/${it.id}`)
                                    }
                                  >
                                    <div>
                                      <p className="text-sm font-medium">
                                        {it.identifier ?? it.id}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {it.condition}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingItemId(it.id);
                                          setCreateForVariantId(null);
                                          setItemFormOpen(true);
                                        }}
                                      >
                                        {t('edit')}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteItemId(it.id);
                                          setConfirmItemOpen(true);
                                        }}
                                      >
                                        {t('delete')}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Edit Dialog */}
      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="edit"
        initialValues={{
          name: product.name,
          manufacturer: product.manufacturer,
          description: product.description ?? '',
          typeId: product.typeId,
        }}
        onSubmit={async (data) => {
          await updateProduct(product.id, data);
          setFormOpen(false);
        }}
      />

      {/* Variant Form Dialog */}
      <VariantFormDialog
        open={variantFormOpen}
        onOpenChange={(o) => {
          setVariantFormOpen(o);
          if (!o) setEditingVariantId(null);
        }}
        mode={editingVariantId ? 'edit' : 'create'}
        initialValues={
          editingVariantId
            ? (() => {
                const current = variants.find((v) => v.id === editingVariantId);
                return current
                  ? {
                      name: current.name,
                      additionalSpecs: current.additionalSpecs ?? '',
                    }
                  : undefined;
              })()
            : undefined
        }
        loading={editingVariantId ? updatingVariant : creatingVariant}
        onSubmit={async (values) => {
          if (editingVariantId) {
            await updateVariant(editingVariantId, values);
          } else {
            await createVariant(values);
          }
          setVariantFormOpen(false);
          setEditingVariantId(null);
        }}
      />

      {/* Variant Delete Confirm */}
      <ConfirmDialog
        open={confirmVariantOpen}
        onOpenChange={(o) => {
          setConfirmVariantOpen(o);
          if (!o) setDeleteVariantId(null);
        }}
        title={t('confirmDeleteTitle')}
        description={t('confirmDeleteDescription', {
          name: variants.find((v) => v.id === deleteVariantId)?.name ?? '',
        })}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        confirmVariant="destructive"
        confirmDisabled={deletingVariant}
        onConfirm={async () => {
          if (!deleteVariantId) return;
          await deleteVariant(deleteVariantId);
          setConfirmVariantOpen(false);
          setDeleteVariantId(null);
        }}
      />

      {/* Item Form Dialog */}
      <ItemFormDialog
        open={itemFormOpen}
        onOpenChange={(o) => {
          setItemFormOpen(o);
          if (!o) setEditingItemId(null);
        }}
        mode={editingItemId ? 'edit' : 'create'}
        variantId={createForVariantId ?? undefined}
        initialValues={
          editingItemId
            ? (() => {
                const current = items.find((it) => it.id === editingItemId);
                if (!current) return undefined;
                return {
                  variantId: current.variantId,
                  identifier: current.identifier ?? '',
                  storageLocationId: current.storageLocationId ?? undefined,
                  condition: current.condition,
                  purchaseDate: current.purchaseDate
                    ? new Date(current.purchaseDate)
                        .toISOString()
                        .substring(0, 10)
                    : new Date().toISOString().substring(0, 10),
                  retirementDate: current.retirementDate
                    ? new Date(current.retirementDate)
                        .toISOString()
                        .substring(0, 10)
                    : undefined,
                };
              })()
            : createForVariantId
              ? {
                  variantId: createForVariantId,
                  identifier: '',
                  storageLocationId: undefined,
                  condition: 'New' as const,
                  purchaseDate: new Date().toISOString().substring(0, 10),
                  retirementDate: undefined,
                }
              : undefined
        }
        loading={editingItemId ? updatingItem : creatingItem}
        onSubmit={async (values) => {
          const payload = {
            variantId: values.variantId,
            identifier: values.identifier || undefined,
            storageLocationId: values.storageLocationId || undefined,
            condition: values.condition,
            purchaseDate: values.purchaseDate
              ? new Date(values.purchaseDate + 'T00:00:00')
              : new Date(),
            retirementDate: values.retirementDate
              ? new Date(values.retirementDate + 'T00:00:00')
              : undefined,
          };
          if (editingItemId) {
            await updateItem(editingItemId, payload);
          } else {
            await createItem(payload);
          }
          setItemFormOpen(false);
          setEditingItemId(null);
          setCreateForVariantId(null);
        }}
      />

      {/* Item Delete Confirm */}
      <ConfirmDialog
        open={confirmItemOpen}
        onOpenChange={(o) => {
          setConfirmItemOpen(o);
          if (!o) setDeleteItemId(null);
        }}
        title={t('confirmDeleteTitle')}
        description={t('confirmDeleteDescription', {
          name: items.find((it) => it.id === deleteItemId)?.identifier ?? '',
        })}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        confirmVariant="destructive"
        confirmDisabled={deletingItem}
        onConfirm={async () => {
          if (!deleteItemId) return;
          await deleteItem(deleteItemId);
          setConfirmItemOpen(false);
          setDeleteItemId(null);
        }}
      />
    </div>
  );
}
