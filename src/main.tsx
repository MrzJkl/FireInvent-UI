import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import './index.css';
import App from './App.tsx';
import './i18n';
import keycloak from './auth/keycloak.ts';
import { AuthGate } from './auth/AuthGate.tsx';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider.tsx';

const keycloakEventLogger = (event: unknown, error: unknown) => {
  console.log('Keycloak event:', event, error);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactKeycloakProvider
      authClient={keycloak}
      onEvent={keycloakEventLogger}
      initOptions={{
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false,
        pkceMethod: 'S256',
      }}
      autoRefreshToken={true}
    >
      <ThemeProvider defaultTheme="system" storageKey="fireinvent-ui-theme">
        <AuthGate>
          <App />
        </AuthGate>
        <Toaster position="top-right" richColors closeButton />
      </ThemeProvider>
    </ReactKeycloakProvider>
  </StrictMode>,
);
