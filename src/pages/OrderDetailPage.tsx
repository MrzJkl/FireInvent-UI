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
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { OrderFormDialog } from '@/features/orders/OrderFormDialog';
import { OrderItemFormDialog } from '@/features/orders/OrderItemFormDialog';
import { useTranslation } from 'react-i18next';
import { IconArrowLeft, IconEdit } from '@tabler/icons-react';
import { useAuthorization } from '@/auth/permissions';
import {
  getOrdersById,
  getOrderItemsByOrderByOrderIdPaginated,
  deleteOrderItemsById,
  putOrderItemsById,
  postOrderItems,
  putOrdersById,
  type OrderModel,
  type OrderItemModel,
  type CreateOrUpdateOrderItemModel,
} from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';
import { useCrudList } from '@/hooks/useCrudList';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { canEditCatalog } = useAuthorization();
  const canManage = canEditCatalog;

  const [order, setOrder] = useState<OrderModel | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [confirmItemOpen, setConfirmItemOpen] = useState(false);

  const { callApi: fetchOrder, loading: orderLoading } = useApiRequest(
    getOrdersById,
    { showSuccess: false, showError: false },
  );
  const { callApi: updateOrder, loading: updatingOrder } =
    useApiRequest(putOrdersById);

  // Order items list with pagination
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
        return getOrderItemsByOrderByOrderIdPaginated(id, params);
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
  } = useCrudList<
    OrderItemModel,
    CreateOrUpdateOrderItemModel,
    CreateOrUpdateOrderItemModel
  >(listFn, postOrderItems, putOrderItemsById, deleteOrderItemsById, {
    initialPageSize: 20,
  });

  useEffect(() => {
    if (!id) return;
    const loadOrder = async () => {
      setError(null);
      const res = await fetchOrder({ path: { id } });
      if (res) {
        setOrder(res);
      } else {
        setError({ message: 'Bestellung konnte nicht geladen werden.' });
      }
    };
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!itemFormOpen) setEditingItemId(null);
  }, [itemFormOpen]);

  const refetchData = async () => {
    if (!id) return;
    setError(null);
    const res = await fetchOrder({ path: { id } });
    if (res) {
      setOrder(res);
    }
    refetchItems();
  };

  if (error) return <ErrorState error={error} onRetry={refetchData} />;
  if (itemsError && itemsError.message) {
    return <ErrorState error={itemsError} onRetry={refetchItems} />;
  }
  if (orderLoading) return <LoadingIndicator />;

  if (!order) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('order')} nicht gefunden</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/app/orders')}>
              {t('orderPlural')}
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
            onClick={() => navigate('/app/orders')}
          >
            <IconArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {order.orderIdentifier || order.id}
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date(order.orderDate).toLocaleDateString('de-DE')} ·{' '}
              {t(`orderStatus.${order.status}`)}
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

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">{t('details')}</TabsTrigger>
          <TabsTrigger value="items">{t('orderItems.label')}</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('details')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('orderIdentifier')}
                </div>
                <div className="mt-1">
                  {order.orderIdentifier || (
                    <span className="text-muted-foreground italic">–</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('orderDate')}
                </div>
                <div className="mt-1">
                  {new Date(order.orderDate).toLocaleDateString('de-DE')}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('status')}
                </div>
                <div className="mt-1">{t(`orderStatus.${order.status}`)}</div>
              </div>
              {order.deliveryDate && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {t('deliveryDate')}
                  </div>
                  <div className="mt-1">
                    {new Date(order.deliveryDate).toLocaleDateString('de-DE')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle>{t('orderItems.label')}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {state.totalItems}{' '}
                    {state.totalItems === 1 ? 'Position' : 'Positionen'}
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
              </div>
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
                      <TableHead>Produkt / Variante</TableHead>
                      <TableHead>Menge</TableHead>
                      <TableHead>Person</TableHead>
                      {canManage && (
                        <TableHead className="text-right">Aktionen</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={canManage ? 4 : 3}
                          className="h-24 text-center"
                        >
                          <LoadingIndicator />
                        </TableCell>
                      </TableRow>
                    ) : items.length === 0 ? (
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
                      items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {item.variant?.product && item.variant ? (
                              <div className="space-y-0.5">
                                <div>{item.variant.product.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {item.variant.name}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {item.person ? (
                              <Button
                                variant="link"
                                className="h-auto p-0 text-sm"
                                onClick={() =>
                                  navigate(`/app/persons/${item.personId}`)
                                }
                              >
                                {item.person.firstName} {item.person.lastName}
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          {canManage && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingItemId(item.id);
                                    setItemFormOpen(true);
                                  }}
                                >
                                  {t('edit')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
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
          <OrderFormDialog
            open={formOpen}
            mode="edit"
            initialValues={{
              orderIdentifier: order.orderIdentifier ?? '',
              orderDate: new Date(order.orderDate)
                .toISOString()
                .substring(0, 10),
              status: order.status,
              deliveryDate: order.deliveryDate
                ? new Date(order.deliveryDate).toISOString().substring(0, 10)
                : '',
            }}
            onOpenChange={setFormOpen}
            onSubmit={async (data) => {
              await updateOrder({
                path: { id: id! },
                body: {
                  orderIdentifier: data.orderIdentifier || null,
                  orderDate: data.orderDate,
                  status: data.status,
                  deliveryDate: data.deliveryDate || null,
                },
              });
              await refetchData();
              setFormOpen(false);
            }}
            loading={updatingOrder}
            labels={{
              titleEdit: t('orders.edit'),
              orderIdentifier: t('orderIdentifier'),
              orderDate: t('orderDate'),
              status: t('status'),
              deliveryDate: t('deliveryDate'),
              cancel: t('cancel'),
              save: t('save'),
            }}
          />

          <OrderItemFormDialog
            open={itemFormOpen}
            onOpenChange={(o) => {
              setItemFormOpen(o);
              if (!o) setEditingItemId(null);
            }}
            orderId={id!}
            mode={editingItemId ? 'edit' : 'create'}
            initialValues={
              editingItemId
                ? (() => {
                    const current = items.find((it) => it.id === editingItemId);
                    return current
                      ? {
                          variantId: current.variantId,
                          personId: current.personId || undefined,
                          quantity: String(current.quantity),
                        }
                      : undefined;
                  })()
                : undefined
            }
            loading={editingItemId ? updatingItem : creatingItem}
            onSubmit={async (values) => {
              const payload = {
                orderId: id!,
                variantId: values.variantId,
                personId: values.personId || null,
                quantity: parseFloat(values.quantity),
              };
              if (editingItemId) {
                await updateItem(editingItemId, payload);
              } else {
                await createItem(payload);
              }
              setItemFormOpen(false);
              setEditingItemId(null);
            }}
            labels={{
              titleCreate: t('orderItems.add'),
              titleEdit: t('orderItems.edit'),
              variant: t('variant'),
              person: t('person'),
              quantity: t('quantity'),
              cancel: t('cancel'),
              save: t('save'),
              add: t('add'),
            }}
          />

          <ConfirmDialog
            open={confirmItemOpen}
            onOpenChange={(o) => {
              setConfirmItemOpen(o);
              if (!o) setDeleteItemId(null);
            }}
            title={t('confirmDeleteTitle')}
            description={t('confirmDeleteDescription', {
              name:
                items.find((it) => it.id === deleteItemId)?.variant?.name ?? '',
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
