import { useEffect, useState } from 'react';
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

export default function ApiIntegrationsPage() {
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
  if (initialLoading)
    return <LoadingIndicator message="Lade API-Integrationen..." />;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">API-Integrationen</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Verwalten Sie API-Integrationen für externe Anwendungen
          </p>
        </div>
        <Button
          onClick={() => {
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Neue Integration
        </Button>
      </div>

      {integrations.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">
            Noch keine API-Integrationen vorhanden
          </p>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Erste Integration erstellen
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
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
                      {integration.enabled ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setItemToDelete(integration);
                        setConfirmOpen(true);
                      }}
                    >
                      Löschen
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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

      <ApiIntegrationCredentialsDialog
        open={credentialsOpen}
        credentials={credentials}
        onOpenChange={setCredentialsOpen}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => {
          setConfirmOpen(o);
          if (!o) setItemToDelete(null);
        }}
        title="Integration löschen"
        description={
          itemToDelete
            ? `Möchten Sie die Integration "${itemToDelete.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden und alle damit verbundenen Zugänge werden sofort widerrufen.`
            : ''
        }
        confirmLabel="Löschen"
        cancelLabel="Abbrechen"
        confirmVariant="destructive"
        confirmDisabled={deleting}
        onConfirm={async () => {
          if (!itemToDelete) return;
          await deleteItem(itemToDelete.clientId);
          setConfirmOpen(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
}
