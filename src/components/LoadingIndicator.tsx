import { Loader2 } from 'lucide-react';

export function LoadingIndicator({
  message = 'Laden...',
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin mb-2" />
      <span>{message}</span>
    </div>
  );
}
