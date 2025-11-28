import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import type { ApiError } from '@/hooks/useApiRequest';

type ErrorStateProps = {
  error: ApiError;
  onRetry?: () => void;
};

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">{t('error.loadingFailed')}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {error.message}
        {error.statusCode && (
          <span className="block mt-1 text-xs">
            {t('error.statusCode')}: {error.statusCode}
          </span>
        )}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          {t('error.retry')}
        </Button>
      )}
    </div>
  );
}
