import { useMemo } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import type { KeycloakTokenParsed } from 'keycloak-js';

export const APP_ROLES = {
  ADMIN: 'admin',
  MAINTENANCE: 'maintenance',
  PROCUREMENT: 'procurement',
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

type RoleAwareToken = KeycloakTokenParsed & {
  roles?: string[];
  realm_access?: { roles?: string[] };
  resource_access?: Record<string, { roles?: string[] } | undefined>;
};

export type Permissions = {
  roles: string[];
  isAdmin: boolean;
  isMaintenance: boolean;
  isProcurement: boolean;
  isReadOnly: boolean;
  canAccessApiIntegrations: boolean;
  canAccessUsers: boolean;
  canEditCatalog: boolean;
  canEditAssignments: boolean;
  canEditMaintenances: boolean;
  canEditMaintenanceTypes: boolean;
  canEditProductTypes: boolean;
};

function extractRoles(token?: RoleAwareToken | null): string[] {
  if (!token) return [];

  const realmRoles = token.realm_access?.roles ?? [];
  const resourceRoles = Object.values(token.resource_access ?? {}).flatMap(
    (access) => access?.roles ?? [],
  );
  const customRoles = token.roles ?? [];

  const combined = [...realmRoles, ...resourceRoles, ...customRoles]
    .filter(Boolean)
    .map((role) => role.toLowerCase());

  return Array.from(new Set(combined));
}

function buildPermissions(roles: string[]): Permissions {
  const isAdmin = roles.includes(APP_ROLES.ADMIN);
  const isMaintenance = roles.includes(APP_ROLES.MAINTENANCE);
  const isProcurement = roles.includes(APP_ROLES.PROCUREMENT);
  const isReadOnly = !isAdmin && !isMaintenance && !isProcurement;

  return {
    roles,
    isAdmin,
    isMaintenance,
    isProcurement,
    isReadOnly,
    canAccessApiIntegrations: isAdmin,
    canAccessUsers: true,
    canEditCatalog: isAdmin || isProcurement,
    canEditAssignments: isAdmin || isProcurement,
    canEditMaintenances: isAdmin || isMaintenance,
    canEditMaintenanceTypes: isAdmin,
    canEditProductTypes: isAdmin,
  };
}

export function useAuthorization(): Permissions {
  const { keycloak } = useKeycloak();

  const roles = useMemo(
    () => extractRoles(keycloak?.tokenParsed as RoleAwareToken | undefined),
    [keycloak?.tokenParsed],
  );

  return useMemo(() => buildPermissions(roles), [roles]);
}
