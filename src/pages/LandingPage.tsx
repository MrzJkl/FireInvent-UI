import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useKeycloak } from '@react-keycloak/web';

export default function LandingPage() {
  const { t } = useTranslation();
  const { keycloak } = useKeycloak();

  const handleLogin = () => {
    if (keycloak) {
      keycloak.login({ redirectUri: window.location.origin + '/app' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-100 to-slate-600">
      <Card className="w-[400px] shadow-lg">
        <CardContent className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">{t('welcome')}</h1>
          <Button size="lg" onClick={handleLogin}>
            {t('login')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
