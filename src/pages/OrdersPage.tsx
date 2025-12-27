import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { OrderFormDialog } from '@/features/orders/OrderFormDialog';
import { useOrders } from '@/features/orders/useOrders';
import { type OrderModel } from '@/api/types.gen';
import { useTranslation } from 'react-i18next';
import { useAuthorization } from '@/auth/permissions';

export default function OrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canEditCatalog } = useAuthorization();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OrderModel | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<OrderModel | null>(null);

  const {
    orders,
    initialLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    refetch,
  } = useOrders();

  useEffect(() => {
    if (!formOpen) setEditingItem(null);
  }, [formOpen]);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (initialLoading) return <LoadingIndicator />;

  const showActions = canEditCatalog;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('orderPlural')}</h1>
        {showActions && (
          <Button
            onClick={() => {
              setEditingItem(null);
              setFormOpen(true);
            }}
          >
            {t('add')}
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('orderIdentifier')}</TableHead>
            <TableHead>{t('orderDate')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('deliveryDate')}</TableHead>
            {showActions && <TableHead>{t('actions')}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/app/orders/${order.id}`)}
            >
              <TableCell>{order.orderIdentifier || order.id}</TableCell>
              <TableCell>
                {new Date(order.orderDate).toLocaleDateString('de-DE')}
              </TableCell>
              <TableCell>{t(`orderStatus.${order.status}`)}</TableCell>
              <TableCell>
                {order.deliveryDate
                  ? new Date(order.deliveryDate).toLocaleDateString('de-DE')
                  : '–'}
              </TableCell>
              {showActions && (
                <TableCell className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem(order);
                      setFormOpen(true);
                    }}
                  >
                    {t('edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete(order);
                      setConfirmOpen(true);
                    }}
                  >
                    {t('delete')}
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showActions && (
        <OrderFormDialog
          open={formOpen}
          mode={editingItem ? 'edit' : 'create'}
          initialValues={
            editingItem
              ? {
                  orderIdentifier: editingItem.orderIdentifier ?? '',
                  orderDate: new Date(editingItem.orderDate)
                    .toISOString()
                    .substring(0, 10),
                  status: editingItem.status,
                  deliveryDate: editingItem.deliveryDate
                    ? new Date(editingItem.deliveryDate)
                        .toISOString()
                        .substring(0, 10)
                    : '',
                }
              : undefined
          }
          loading={editingItem ? isUpdating : isCreating}
          onOpenChange={setFormOpen}
          labels={{
            titleCreate: t('orders.add'),
            titleEdit: t('orders.edit'),
            orderIdentifier: t('orderIdentifier'),
            orderDate: t('orderDate'),
            status: t('status'),
            deliveryDate: t('deliveryDate'),
            cancel: t('cancel'),
            save: t('save'),
            add: t('add'),
          }}
          onSubmit={async (values) => {
            const payload = {
              orderIdentifier: values.orderIdentifier || undefined,
              orderDate: values.orderDate,
              status: values.status,
              deliveryDate: values.deliveryDate || undefined,
            };
            if (editingItem) {
              await updateOrder(editingItem.id, payload);
            } else {
              await createOrder(payload);
            }
            setFormOpen(false);
          }}
        />
      )}

      {showActions && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={(o) => {
            setConfirmOpen(o);
            if (!o) setItemToDelete(null);
          }}
          title={t('confirmDeleteTitle')}
          description={t('confirmDeleteDescription', {
            name: itemToDelete?.orderIdentifier ?? itemToDelete?.id ?? '',
          })}
          confirmLabel={t('delete')}
          cancelLabel={t('cancel')}
          confirmVariant="destructive"
          confirmDisabled={isDeleting}
          onConfirm={async () => {
            if (!itemToDelete) return;
            await deleteOrder(itemToDelete.id);
            setConfirmOpen(false);
            setItemToDelete(null);
          }}
        />
      )}
    </div>
  );
}
