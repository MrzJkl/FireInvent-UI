import { useKeycloak } from '@react-keycloak/web';
import Dashboard from '../pages/DashboardPage';

export function PrivateRoutes() {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading...</div>; // optional: Spinner
  }

  if (!keycloak?.authenticated) {
    keycloak.login({ redirectUri: window.location.origin + '/app' });
    return null; // während Login nichts rendern
  }

  return <Dashboard />;
}
