import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'fireinvent', // Realm-Name
  clientId: 'fireinvent-spa', // Client-ID der SPA
});

export default keycloak;
