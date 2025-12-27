import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { OrderFormDialog } from '@/features/orders/OrderFormDialog';
import { OrderItemFormDialog } from '@/features/orders/OrderItemFormDialog';
import { useOrderDetail } from '@/features/orders/useOrderDetail';
import { useTranslation } from 'react-i18next';
import { IconArrowLeft, IconEdit } from '@tabler/icons-react';
import { useAuthorization } from '@/auth/permissions';
import {
  deleteOrderItemsById,
  putOrderItemsById,
  postOrderItems,
  putOrdersById,
} from '@/api';
import { useApiRequest } from '@/hooks/useApiRequest';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { canEditCatalog } = useAuthorization();
  const canManage = canEditCatalog;

  const [formOpen, setFormOpen] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [confirmItemOpen, setConfirmItemOpen] = useState(false);

  const { order, items, initialLoading, error, refetch } = useOrderDetail(id);

  const { callApi: updateOrder, loading: updatingOrder } =
    useApiRequest(putOrdersById);
  const { callApi: createItem, loading: creatingItem } =
    useApiRequest(postOrderItems);
  const { callApi: updateItem, loading: updatingItem } =
    useApiRequest(putOrderItemsById);
  const { callApi: deleteItem, loading: deletingItem } =
    useApiRequest(deleteOrderItemsById);

  useEffect(() => {
    if (!itemFormOpen) setEditingItemId(null);
  }, [itemFormOpen]);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (initialLoading) return <LoadingIndicator />;

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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('orderItems.label')}</CardTitle>
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
              {items.length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  {t('orderItems.empty')}
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between rounded border p-3"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {item.variant?.product?.name} - {item.variant?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Menge: {item.quantity}
                        </p>
                        {item.person && (
                          <p className="text-sm text-muted-foreground">
                            Person: {item.person.firstName}{' '}
                            {item.person.lastName}
                          </p>
                        )}
                      </div>
                      {canManage && (
                        <div className="flex gap-2">
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
                      )}
                    </div>
                  ))}
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
              await refetch();
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
                await updateItem({
                  path: { id: editingItemId },
                  body: payload,
                });
              } else {
                await createItem({ body: payload });
              }
              await refetch();
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
              await deleteItem({ path: { id: deleteItemId } });
              await refetch();
              setConfirmItemOpen(false);
              setDeleteItemId(null);
            }}
          />
        </>
      )}
    </div>
  );
}
