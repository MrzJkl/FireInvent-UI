import { useEffect, useMemo, useState } from 'react';
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
import { VariantFormDialog } from '@/features/variants/VariantFormDialog';
import { ItemFormDialog } from '@/features/items/ItemFormDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import { IconArrowLeft, IconEdit } from '@tabler/icons-react';
import { useAuthorization } from '@/auth/permissions';
import { useApiRequest } from '@/hooks/useApiRequest';
import { useCrudList } from '@/hooks/useCrudList';
import {
  getVariantsById,
  getVariantsByIdItemsPaginated,
  putVariantsById,
  deleteVariantsById,
  postItems,
  putItemsById,
  deleteItemsById,
  type VariantModel,
  type ItemModel,
  type CreateOrUpdateVariantModel,
  type CreateOrUpdateItemModel,
} from '@/api';

export default function VariantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { canEditCatalog } = useAuthorization();
  const canManage = canEditCatalog;

  const [variant, setVariant] = useState<VariantModel | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [confirmItemOpen, setConfirmItemOpen] = useState(false);
  const [confirmVariantDeleteOpen, setConfirmVariantDeleteOpen] =
    useState(false);

  const { callApi: fetchVariant, loading: variantLoading } = useApiRequest(
    getVariantsById,
    { showSuccess: false, showError: false },
  );
  const { callApi: updateVariantApi, loading: updatingVariant } =
    useApiRequest(putVariantsById);
  const { callApi: deleteVariantApi, loading: deletingVariant } =
    useApiRequest(deleteVariantsById);

  // Items list with pagination
  const listFn = useMemo(
    () =>
      (
        params: Partial<{
          page?: number;
          pageSize?: number;
          searchTerm?: string | null;
        }>,
      ) => {
        if (!id) {
          return Promise.resolve({
            data: {
              items: [],
              page: 1,
              pageSize: 20,
              totalItems: 0,
              totalPages: 0,
            },
          });
        }
        return getVariantsByIdItemsPaginated(id, params);
      },
    [id],
  );

  const {
    items,
    state,
    isInitialLoading: itemsLoading,
    isCreating: creatingItem,
    isUpdating: updatingItem,
    isDeleting: deletingItem,
    error: itemsError,
    create: createItem,
    update: updateItem,
    delete: deleteItem,
    nextPage,
    previousPage,
    setPageSize,
    setSearchTerm,
    refetch: refetchItems,
  } = useCrudList<ItemModel, CreateOrUpdateItemModel, CreateOrUpdateItemModel>(
    listFn,
    postItems,
    putItemsById,
    deleteItemsById,
    {
      initialPageSize: 20,
    },
  );

  useEffect(() => {
    if (!id) return;
    const loadVariant = async () => {
      const res = await fetchVariant({ path: { id } });
      if (res) {
        setVariant(res);
      }
    };
    loadVariant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdateVariant = async (
    data: Omit<CreateOrUpdateVariantModel, 'productId'>,
  ) => {
    if (!variant || !id) return;
    const payload = {
      ...data,
      productId: variant.productId,
      additionalSpecs: data.additionalSpecs || undefined,
      externalIdentifier: data.externalIdentifier || undefined,
    };
    const res = await updateVariantApi({
      path: { id },
      body: payload as CreateOrUpdateVariantModel,
    });
    if (res) {
      setVariant(res);
      setFormOpen(false);
    }
  };

  const handleDeleteVariant = async () => {
    if (!id || !variant) return;
    await deleteVariantApi({ path: { id } });
    navigate(`/app/products/${variant.productId}`);
  };

  if (variantLoading) return <LoadingIndicator />;
  if (itemsError && itemsError.message) {
    return <ErrorState error={itemsError} onRetry={refetchItems} />;
  }

  if (!variant) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {t('variant')} {t('notFound')}
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
            onClick={() => navigate(`/app/products/${variant.productId}`)}
          >
            <IconArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{variant.name}</h1>
            <p className="text-sm text-muted-foreground">
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => navigate(`/app/products/${variant.productId}`)}
              >
                {variant.product.name}
              </Button>
            </p>
          </div>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setFormOpen(true)}
              className="gap-2"
            >
              <IconEdit className="size-4" />
              {t('edit')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmVariantDeleteOpen(true)}
            >
              {t('delete')}
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="variant" className="w-full">
        <TabsList>
          <TabsTrigger value="variant">{t('variant')}</TabsTrigger>
          <TabsTrigger value="items">{t('items.label')}</TabsTrigger>
        </TabsList>

        {/* Variant Tab */}
        <TabsContent value="variant" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('variant')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('name')}
                </div>
                <div className="mt-1">{variant.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('product')}
                </div>
                <div className="mt-1">
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    onClick={() =>
                      navigate(`/app/products/${variant.productId}`)
                    }
                  >
                    {variant.product.name}
                  </Button>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('additionalSpecs')}
                </div>
                <div className="mt-1">
                  {variant.additionalSpecs || (
                    <span className="text-muted-foreground italic">-</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('externalIdentifier')}
                </div>
                <div className="mt-1">
                  {variant.externalIdentifier || (
                    <span className="text-muted-foreground italic">
                      {variant.product.externalIdentifier
                        ? `${variant.product.externalIdentifier} (${t('inheritedFromProduct')})`
                        : '-'}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle>{t('items.label')}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {state.totalItems} {t('items.label')}
                </div>
              </div>
              {canManage && (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingItemId(null);
                    setItemFormOpen(true);
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
                      <TableHead>{t('identifier')}</TableHead>
                      <TableHead>{t('condition')}</TableHead>
                      <TableHead>{t('purchaseDate')}</TableHead>
                      <TableHead>{t('isDemoItem')}</TableHead>
                      {canManage && (
                        <TableHead className="text-right">
                          {t('actions')}
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={canManage ? 5 : 4}
                          className="h-24 text-center"
                        >
                          <LoadingIndicator />
                        </TableCell>
                      </TableRow>
                    ) : items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={canManage ? 5 : 4}
                          className="h-24 text-center"
                        >
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <p>{t('noResults')}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow
                          key={item.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/app/items/${item.id}`)}
                        >
                          <TableCell className="font-medium">
                            {item.identifier || (
                              <span className="text-muted-foreground italic">
                                {item.id.substring(0, 8)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{item.condition}</TableCell>
                          <TableCell>
                            {item.purchaseDate
                              ? new Date(item.purchaseDate).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {item.isDemoItem ? t('yes') : t('no')}
                          </TableCell>
                          {canManage && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingItemId(item.id);
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
                                    setDeleteItemId(item.id);
                                    setConfirmItemOpen(true);
                                  }}
                                >
                                  {t('delete')}
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {!itemsLoading && items.length > 0 && (
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
          {/* Variant Edit Dialog */}
          <VariantFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            mode="edit"
            initialValues={{
              name: variant.name,
              additionalSpecs: variant.additionalSpecs ?? '',
              externalIdentifier: variant.externalIdentifier ?? '',
            }}
            loading={updatingVariant}
            onSubmit={handleUpdateVariant}
          />

          {/* Variant Delete Confirm */}
          <ConfirmDialog
            open={confirmVariantDeleteOpen}
            onOpenChange={setConfirmVariantDeleteOpen}
            title={t('confirmDeleteTitle')}
            description={t('confirmDeleteDescription', {
              name: variant.name,
            })}
            confirmLabel={t('delete')}
            cancelLabel={t('cancel')}
            confirmVariant="destructive"
            confirmDisabled={deletingVariant}
            onConfirm={handleDeleteVariant}
          />

          {/* Item Form Dialog */}
          <ItemFormDialog
            open={itemFormOpen}
            onOpenChange={(o) => {
              setItemFormOpen(o);
              if (!o) setEditingItemId(null);
            }}
            mode={editingItemId ? 'edit' : 'create'}
            variantId={variant.id}
            initialValues={
              editingItemId
                ? (() => {
                    const current = items.find((it) => it.id === editingItemId);
                    if (!current) return undefined;
                    return {
                      variantId: current.variantId,
                      identifier: current.identifier ?? '',
                      condition: current.condition,
                      purchaseDate: current.purchaseDate
                        ? new Date(current.purchaseDate)
                            .toISOString()
                            .substring(0, 10)
                        : new Date().toISOString().substring(0, 10),
                      isDemoItem: current.isDemoItem ?? false,
                      retirementDate: current.retirementDate
                        ? new Date(current.retirementDate)
                            .toISOString()
                            .substring(0, 10)
                        : undefined,
                    };
                  })()
                : {
                    variantId: variant.id,
                    identifier: '',
                    condition: 'New' as const,
                    purchaseDate: new Date().toISOString().substring(0, 10),
                    isDemoItem: false,
                    retirementDate: undefined,
                  }
            }
            loading={editingItemId ? updatingItem : creatingItem}
            onSubmit={async (values) => {
              const payload = {
                variantId: values.variantId,
                identifier: values.identifier || undefined,
                condition: values.condition,
                purchaseDate:
                  values.purchaseDate ||
                  new Date().toISOString().substring(0, 10),
                isDemoItem: values.isDemoItem,
                retirementDate: values.retirementDate || undefined,
              };
              if (editingItemId) {
                await updateItem(editingItemId, payload);
              } else {
                await createItem(payload);
              }
              setItemFormOpen(false);
              setEditingItemId(null);
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
              name:
                items.find((it) => it.id === deleteItemId)?.identifier ?? '',
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
        </>
      )}
    </div>
  );
}
