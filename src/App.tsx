import { client } from './api/client.gen';
import keycloak from './auth/keycloak';
import { AppRouter } from './routes';
import { getTenantId } from './auth/tenant';

client.setConfig({
  auth: () => keycloak.token,
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197',
});

// Attach X-Tenant-ID header dynamically based on current selection
client.instance.interceptors.request.use((config) => {
  const tenantId = getTenantId();
  // Set header when we have a selected tenant
  if (tenantId) {
    config.headers = config.headers ?? {};
    // Don't overwrite if user explicitly set a different header
    if (!('X-Tenant-ID' in (config.headers as any))) {
      (config.headers as any)['X-Tenant-ID'] = tenantId;
    }
  }
  return config;
});

export default function App() {
  return <AppRouter />;
}
