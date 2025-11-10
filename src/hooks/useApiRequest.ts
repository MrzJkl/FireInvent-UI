import { useState } from 'react';
import { toast } from 'sonner';

type ApiOptions = {
  successMessage?: string;
  errorMessage?: string;
  showSuccess?: boolean;
  showError?: boolean;
};

export function useApiRequest<T extends (...args: any[]) => Promise<any>>(
  apiFn: T,
  defaultOptions: ApiOptions = {},
) {
  const [loading, setLoading] = useState(false);

  async function callApi(
    ...args: Parameters<T> & [ApiOptions?]
  ): Promise<any | null> {
    const options = args[args.length - 1] as ApiOptions | undefined;
    const merged = {
      showSuccess: true,
      showError: true,
      ...defaultOptions,
      ...options,
    };

    try {
      setLoading(true);

      const res = await apiFn(...args);

      const status = res?.status ?? 200;

      if (status >= 400) {
        if (merged.showError) {
          toast.error(merged.errorMessage ?? `Fehler ${status}`, {
            description: res?.data?.message ?? 'Ein Fehler ist aufgetreten.',
          });
        }
        return null;
      }

      if (merged.showSuccess) {
        toast.success(merged.successMessage ?? 'Erfolg');
      }

      return res.data ?? res;
    } catch (err: any) {
      if (merged.showError) {
        const msg =
          err?.response?.data?.message ?? err?.message ?? 'Unbekannter Fehler';
        toast.error(merged.errorMessage ?? 'Fehler bei der API-Anfrage', {
          description: msg,
        });
      }
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { callApi, loading };
}
