import { useEffect, useState, type ReactNode } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Loader2 } from 'lucide-react';

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { keycloak, initialized } = useKeycloak();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!initialized) return;

    if (!keycloak.authenticated) {
      keycloak.login({ redirectUri: window.location.origin + '/app' });
    } else {
      setChecking(false);
    }
  }, [initialized, keycloak]);

  if (!initialized || checking) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mb-2" />
        <span>Loading...</span>
      </div>
    );
  }

  return <>{children}</>;
}
