import { client } from './api/client.gen';
import keycloak from './auth/keycloak';
import { AppRouter } from './routes';

client.setConfig({
  auth: () => keycloak.token,
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197',
});

export default function App() {
  return <AppRouter />;
}
