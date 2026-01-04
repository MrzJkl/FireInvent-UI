import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { ProductFormDialog } from '@/features/products/ProductFormDialog';
import { useVariants } from '@/features/variants/useVariants';
import { VariantFormDialog } from '@/features/variants/VariantFormDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useProducts } from '@/features/products/useProducts';
import { type ProductModel } from '@/api/types.gen';
import { useTranslation } from 'react-i18next';
import { IconArrowLeft, IconEdit } from '@tabler/icons-react';
import { useAuthorization } from '@/auth/permissions';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { canEditCatalog } = useAuthorization();
  const canManage = canEditCatalog;

  const [formOpen, setFormOpen] = useState(false);
  const [variantFormOpen, setVariantFormOpen] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);
  const [confirmVariantOpen, setConfirmVariantOpen] = useState(false);
  const [product, setProduct] = useState<ProductModel | null>(null);

  const {
    products,
    isLoading,
    updateProduct,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts();

  const {
    variants,
    state,
    isInitialLoading: variantsLoading,
    isCreating: creatingVariant,
    isUpdating: updatingVariant,
    isDeleting: deletingVariant,
    error: variantsError,
    createVariant,
    updateVariant,
    deleteVariant,
    nextPage,
    previousPage,
    setPageSize,
    setSearchTerm,
  } = useVariants(id);

  useEffect(() => {
    if (products && id) {
      const found = products.find((p) => p.id === id);
      setProduct(found || null);
    }
  }, [products, id]);

  if (productsError)
    return <ErrorState error={productsError} onRetry={refetchProducts} />;
  if (variantsError && variantsError.message)
    return (
      <ErrorState
        error={variantsError}
        onRetry={() => window.location.reload()}
      />
    );
  if (isLoading) return <LoadingIndicator />;

  if (!product) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {t('product')} {t('notFound')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/app/products')}>
              {t('productPlural')} {t('view')}
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
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => navigate('/app/productTypes')}
              >
                {product.type.name}
              </Button>
              {' · '}
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() =>
                  navigate(`/app/manufacturers/${product.manufacturerId}`)
                }
              >
                {product.manufacturer.name}
              </Button>
            </p>
          </div>
        </div>
        {canManage && (
          <Button
            variant="outline"
            onClick={() => setFormOpen(true)}
            className="gap-2"
          >
            <IconEdit className="size-4" />
            {t('edit')}
          </Button>
        )}
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
              <CardTitle>{t('product')}</CardTitle>
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
                <div className="mt-1">
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    onClick={() =>
                      navigate(`/app/manufacturers/${product.manufacturerId}`)
                    }
                  >
                    {product.manufacturer.name}
                  </Button>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('productType')}
                </div>
                <div className="mt-1">
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => navigate('/app/productTypes')}
                  >
                    {product.type.name}
                  </Button>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('externalIdentifier')}
                </div>
                <div className="mt-1">
                  {product.externalIdentifier || (
                    <span className="text-muted-foreground italic">-</span>
                  )}
                </div>
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
              <div className="flex items-center gap-4">
                <CardTitle>{t('variantPlural')}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {state.totalItems} {t('variantPlural')}
                </div>
              </div>
              {canManage && (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingVariantId(null);
                    setVariantFormOpen(true);
                  }}
                >
                  {t('add')}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <Input
                  placeholder={t('search')}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('name')}</TableHead>
                      <TableHead>{t('additionalSpecs')}</TableHead>
                      <TableHead>{t('externalIdentifier')}</TableHead>
                      {canManage && (
                        <TableHead className="text-right">
                          {t('actions')}
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variantsLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={canManage ? 4 : 3}
                          className="h-24 text-center"
                        >
                          <LoadingIndicator />
                        </TableCell>
                      </TableRow>
                    ) : variants.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={canManage ? 4 : 3}
                          className="h-24 text-center"
                        >
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <p>{t('noResults')}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      variants.map((v) => {
                        const effectiveExternalIdentifier =
                          v.externalIdentifier ?? product.externalIdentifier;
                        const isInherited =
                          !v.externalIdentifier && !!product.externalIdentifier;

                        return (
                          <TableRow
                            key={v.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/app/variants/${v.id}`)}
                          >
                            <TableCell className="font-medium">
                              {v.name}
                            </TableCell>
                            <TableCell>
                              {v.additionalSpecs || (
                                <span className="text-muted-foreground italic">
                                  -
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {effectiveExternalIdentifier ? (
                                <>
                                  {effectiveExternalIdentifier}
                                  {isInherited && (
                                    <span className="ml-1 text-xs text-muted-foreground">
                                      ({t('inheritedFromProduct')})
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-muted-foreground italic">
                                  -
                                </span>
                              )}
                            </TableCell>
                            {canManage && (
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingVariantId(v.id);
                                      setVariantFormOpen(true);
                                    }}
                                  >
                                    {t('edit')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteVariantId(v.id);
                                      setConfirmVariantOpen(true);
                                    }}
                                  >
                                    {t('delete')}
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {!variantsLoading && variants.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {t('rowsPerPage')}:
                    </span>
                    <Select
                      value={state.pageSize.toString()}
                      onValueChange={(value) => setPageSize(Number(value))}
                    >
                      <SelectTrigger className="h-8 w-17.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 20, 30, 50].map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {t('page')} {state.page} {t('of')} {state.totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={previousPage}
                      disabled={state.page <= 1}
                    >
                      {t('previous')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={nextPage}
                      disabled={state.page >= state.totalPages}
                    >
                      {t('next')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {canManage && (
        <>
          {/* Product Edit Dialog */}
          <ProductFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            mode="edit"
            initialValues={{
              name: product.name,
              manufacturerId: product.manufacturerId,
              description: product.description ?? '',
              externalIdentifier: product.externalIdentifier ?? '',
              typeId: product.typeId,
            }}
            onSubmit={async (data) => {
              const payload = {
                ...data,
                description: data.description || undefined,
                externalIdentifier: data.externalIdentifier || undefined,
              };
              await updateProduct(product.id, payload);
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
                    const current = variants.find(
                      (v) => v.id === editingVariantId,
                    );
                    return current
                      ? {
                          name: current.name,
                          additionalSpecs: current.additionalSpecs ?? '',
                          externalIdentifier: current.externalIdentifier ?? '',
                        }
                      : undefined;
                  })()
                : undefined
            }
            loading={editingVariantId ? updatingVariant : creatingVariant}
            onSubmit={async (values) => {
              const payload = {
                ...values,
                additionalSpecs: values.additionalSpecs || undefined,
                externalIdentifier: values.externalIdentifier || undefined,
              };
              if (editingVariantId) {
                await updateVariant(editingVariantId, payload);
              } else {
                await createVariant(payload);
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
        </>
      )}
    </div>
  );
}
