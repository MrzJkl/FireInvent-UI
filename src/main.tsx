import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import './index.css';
import App from './App.tsx';
import './i18n';
import keycloak from './keycloak';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/silent-check-sso.html',
      }}
    >
      <App />
    </ReactKeycloakProvider>
  </StrictMode>,
);
