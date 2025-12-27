import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';

type Organization = {
  key: string; // claim key, e.g. "load-testing"
  id: string; // GUID
};

type TenantContextValue = {
  organizations: Organization[];
  selectedTenantId?: string;
  setSelectedTenantId: (id?: string) => void;
};

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

// Module-level store for non-React consumers (e.g., Axios interceptor)
let currentTenantId: string | undefined;

export const getTenantId = () => currentTenantId;
export const setTenantId = (id?: string) => {
  currentTenantId = id;
};

const STORAGE_KEY = 'fireinvent.selectedTenantId';

function parseOrganizations(tokenParsed: unknown): Organization[] {
  if (!tokenParsed || typeof tokenParsed !== 'object') return [];
  const claim = (tokenParsed as any).organization as
    | Record<string, { id?: string } | undefined>
    | undefined;
  if (!claim || typeof claim !== 'object') return [];
  const entries = Object.entries(claim)
    .filter(([, val]) => !!val?.id)
    .map(([key, val]) => ({ key, id: String(val!.id) }));
  // dedupe by id
  const seen = new Set<string>();
  const unique: Organization[] = [];
  for (const org of entries) {
    if (!seen.has(org.id)) {
      unique.push(org);
      seen.add(org.id);
    }
  }
  return unique;
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { keycloak } = useKeycloak();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedTenantId, setSelectedTenantIdState] = useState<
    string | undefined
  >(undefined);

  // initialize from token
  useEffect(() => {
    const orgs = parseOrganizations(keycloak?.tokenParsed);
    setOrganizations(orgs);

    const persisted = localStorage.getItem(STORAGE_KEY) || undefined;
    const hasPersisted = persisted && orgs.some((o) => o.id === persisted);
    const single = orgs.length === 1 ? orgs[0].id : undefined;
    const next = hasPersisted ? persisted : single;
    setSelectedTenantIdState(next);
    setTenantId(next);
  }, [keycloak?.tokenParsed]);

  const setSelectedTenantId = (id?: string) => {
    setSelectedTenantIdState(id);
    setTenantId(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value = useMemo(
    () => ({ organizations, selectedTenantId, setSelectedTenantId }),
    [organizations, selectedTenantId],
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}
