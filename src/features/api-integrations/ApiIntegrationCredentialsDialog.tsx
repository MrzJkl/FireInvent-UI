import { useState } from 'react';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
          <DialogTitle>{t('apiIntegrations.credentialsTitle')}</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>{t('apiIntegrations.credentialsDescription')}</p>
            <p className="font-semibold text-yellow-600 dark:text-yellow-500">
              {t('apiIntegrations.credentialsWarning')}
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-sm font-medium">{t('name')}</Label>
            <div className="flex gap-2 mt-1">
              <Input value={credentials.name} readOnly />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(credentials.name, 'name')}
                title={t('apiIntegrations.copyToClipboard')}
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
            <Label className="text-sm font-medium">
              {t('apiIntegrations.clientId')}
            </Label>
            <div className="flex gap-2 mt-1">
              <Input value={credentials.clientId} readOnly />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  copyToClipboard(credentials.clientId, 'clientId')
                }
                title={t('apiIntegrations.copyToClipboard')}
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
            <Label className="text-sm font-medium">
              {t('apiIntegrations.clientSecret')}
            </Label>
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
                title={
                  showSecret
                    ? t('apiIntegrations.hideSecret')
                    : t('apiIntegrations.showSecret')
                }
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
                title={t('apiIntegrations.copyToClipboard')}
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
          <Button onClick={() => onOpenChange(false)}>
            {t('apiIntegrations.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
