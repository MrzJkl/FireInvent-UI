import { useState } from 'react';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';
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
import type { ApiIntegrationCredentialsModel } from '@/api';

export type ApiIntegrationCredentialsDialogProps = {
  open: boolean;
  credentials: ApiIntegrationCredentialsModel | null;
  onOpenChange: (open: boolean) => void;
};

export function ApiIntegrationCredentialsDialog({
  open,
  credentials,
  onOpenChange,
}: ApiIntegrationCredentialsDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!credentials) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>API-Integration erfolgreich erstellt</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>Die Integration wurde erfolgreich erstellt.</p>
            <p className="font-semibold text-yellow-600 dark:text-yellow-500">
              ⚠️ Wichtig: Die Zugangsdaten werden nur einmal angezeigt. Bitte
              speichern Sie diese sicher.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-sm font-medium">Name</Label>
            <div className="flex gap-2 mt-1">
              <Input value={credentials.name} readOnly />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(credentials.name, 'name')}
              >
                {copiedField === 'name' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Client ID</Label>
            <div className="flex gap-2 mt-1">
              <Input value={credentials.clientId} readOnly />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  copyToClipboard(credentials.clientId, 'clientId')
                }
              >
                {copiedField === 'clientId' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Client Secret</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type={showSecret ? 'text' : 'password'}
                value={credentials.clientSecret}
                readOnly
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  copyToClipboard(credentials.clientSecret, 'clientSecret')
                }
              >
                {copiedField === 'clientSecret' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={() => onOpenChange(false)}>Schließen</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
