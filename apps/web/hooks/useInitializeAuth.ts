'use client';

import { useMe } from '@/hooks/queries/useMe';

export function useInitializeAuth({
  enabled,
}: {
  enabled: boolean;
}) {
  const me = useMe({
    enabled,
  });

  return {
    user: enabled ? (me.data ?? null) : null,
    loading: enabled ? me.isLoading : false,
    authenticated: enabled && !!me.data,
    error: me.error,
    refetch: me.refetch,
  };
}