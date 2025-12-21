import { useCallback, useEffect, useRef, useState } from 'react';
import { getVariants, type VariantModel } from '@/api';
import { useApiRequest, type ApiError } from '@/hooks/useApiRequest';

export function useAllVariants() {
  const [variants, setVariants] = useState<VariantModel[]>([]);
  const [error, setError] = useState<ApiError | null>(null);

  const { callApi: listApi, loading: initialLoading } = useApiRequest(
    getVariants,
    { showSuccess: false, showError: false },
  );

  const listApiRef = useRef(listApi);
  useEffect(() => {
    listApiRef.current = listApi;
  }, [listApi]);

  const refetch = useCallback(async () => {
    setError(null);
    const res = await listApiRef.current({});
    if (res) {
      setVariants(res);
    } else {
      setError({
        message:
          'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
      });
    }
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    variants,
    error,
    initialLoading,
    refetch,
  };
}
