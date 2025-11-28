import { useState } from 'react';
import { toast } from 'sonner';

type ApiOptions = {
  successMessage?: string;
  errorMessage?: string;
  showSuccess?: boolean;
  showError?: boolean;
};

export type ApiError = {
  message: string;
  statusCode?: number;
};

export function useApiRequest<T extends (...args: any[]) => Promise<any>>(
  apiFn: T,
  defaultOptions: ApiOptions = {},
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

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
      setError(null);

      const res = await apiFn(...args);

      const status = res?.status ?? 200;

      if (status >= 400) {
        const errorMsg = res?.data?.message ?? 'Ein Fehler ist aufgetreten.';
        const apiError: ApiError = {
          message: errorMsg,
          statusCode: status,
        };
        setError(apiError);

        if (merged.showError) {
          toast.error(merged.errorMessage ?? `Fehler ${status}`, {
            description: errorMsg,
          });
        }
        return null;
      }

      if (merged.showSuccess) {
        toast.success(merged.successMessage ?? 'Erfolgreich');
      }

      return res?.data ?? res.data ?? null;
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ?? err?.message ?? 'Unbekannter Fehler';
      const apiError: ApiError = {
        message: errorMsg,
        statusCode: err?.response?.status,
      };
      setError(apiError);

      if (merged.showError) {
        toast.error(merged.errorMessage ?? 'Fehler bei der API-Anfrage', {
          description: errorMsg,
        });
      }
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { callApi, loading, error };
}
