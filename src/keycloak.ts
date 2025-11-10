import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'fireinvent',
  clientId: 'fireinvent-spa',
});

export default keycloak;
