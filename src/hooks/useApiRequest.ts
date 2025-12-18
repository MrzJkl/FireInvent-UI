import { useState } from 'react';
import { toast } from 'sonner';
import keycloak from '@/auth/keycloak';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useApiRequest<T extends (...args: any[]) => Promise<any>>(
  apiFn: T,
  defaultOptions: ApiOptions = {},
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  async function callApi(
    ...args: Parameters<T> & [ApiOptions?]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        if (status === 401) {
          keycloak.login({ redirectUri: window.location.href });
          return null;
        }
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
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosError = err as any;
      const errorMsg =
        axiosError?.response?.data?.message ??
        axiosError?.message ??
        'Unbekannter Fehler';
      const apiError: ApiError = {
        message: errorMsg,
        statusCode: axiosError?.response?.status,
      };
      if (axiosError?.response?.status === 401) {
        keycloak.login({ redirectUri: window.location.href });
        return null;
      }
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
