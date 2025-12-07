import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ApiIntegrationFormDialog } from '@/features/api-integrations/ApiIntegrationFormDialog';
import { ApiIntegrationCredentialsDialog } from '@/features/api-integrations/ApiIntegrationCredentialsDialog';
import { useApiIntegrations } from '@/features/api-integrations/useApiIntegrations';
import {
  type ApiIntegrationModel,
  type ApiIntegrationCredentialsModel,
} from '@/api';
import { Plus } from 'lucide-react';
import { useAuthorization } from '@/auth/permissions';

export default function ApiIntegrationsPage() {
  const { t } = useTranslation();
  const { canAccessApiIntegrations } = useAuthorization();
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ApiIntegrationModel | null>(
    null,
  );
  const [credentials, setCredentials] =
    useState<ApiIntegrationCredentialsModel | null>(null);
  const [credentialsOpen, setCredentialsOpen] = useState(false);

  const {
    items: integrations,
    initialLoading,
    creating,
    deleting,
    error,
    createItem,
    deleteItem,
    refetch,
  } = useApiIntegrations();

  useEffect(() => {
    if (!credentialsOpen) {
      setCredentials(null);
    }
  }, [credentialsOpen]);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (initialLoading) return <LoadingIndicator message={t('loadingData')} />;

  const showActions = canAccessApiIntegrations;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{t('apiIntegrations.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('apiIntegrations.subtitle')}
          </p>
        </div>
        {showActions && (
          <Button
            onClick={() => {
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('apiIntegrations.newIntegration')}
          </Button>
        )}
      </div>

      {integrations.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">
            {t('apiIntegrations.empty')}
          </p>
          {showActions && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('apiIntegrations.createFirst')}
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('description')}</TableHead>
                <TableHead>{t('apiIntegrations.clientId')}</TableHead>
                <TableHead>{t('apiIntegrations.status')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrations.map((integration) => (
                <TableRow key={integration.clientId}>
                  <TableCell className="font-medium">
                    {integration.name}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {integration.description || '-'}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {integration.clientId}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={integration.enabled ? 'default' : 'secondary'}
                    >
                      {integration.enabled
                        ? t('apiIntegrations.active')
                        : t('apiIntegrations.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {showActions && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setItemToDelete(integration);
                          setConfirmOpen(true);
                        }}
                      >
                        {t('delete')}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {showActions && (
        <ApiIntegrationFormDialog
          open={formOpen}
          loading={creating}
          onOpenChange={setFormOpen}
          onSubmit={async (values) => {
            const result = await createItem(values);
            if (result) {
              setFormOpen(false);
              setCredentials(result);
              setCredentialsOpen(true);
            }
          }}
        />
      )}

      <ApiIntegrationCredentialsDialog
        open={credentialsOpen}
        credentials={credentials}
        onOpenChange={setCredentialsOpen}
      />

      {showActions && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={(o) => {
            setConfirmOpen(o);
            if (!o) setItemToDelete(null);
          }}
          title={t('apiIntegrations.confirmDeleteTitle')}
          description={
            itemToDelete
              ? t('apiIntegrations.confirmDeleteDescription', {
                  name: itemToDelete.name,
                })
              : ''
          }
          confirmLabel={t('delete')}
          cancelLabel={t('cancel')}
          confirmVariant="destructive"
          confirmDisabled={deleting}
          onConfirm={async () => {
            if (!itemToDelete) return;
            await deleteItem(itemToDelete.clientId);
            setConfirmOpen(false);
            setItemToDelete(null);
          }}
        />
      )}
    </div>
  );
}
