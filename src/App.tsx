import { client } from './api/client.gen';
import keycloak from './keycloak';
import { AppRouter } from './routes';

client.setConfig({
  auth: () => keycloak.token,
  baseURL: 'https://localhost:7197',
});

export default function App() {
  return <AppRouter />;
}
