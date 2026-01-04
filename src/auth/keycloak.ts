import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:5000',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'fireinvent',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'fireinvent-spa',
});

export default keycloak;
