import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PrivateRoutes } from './PrivateRoutes';
import { LoadingIndicator } from '@/components/LoadingIndicator';

const LandingPage = lazy(() => import('@/pages/LandingPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingIndicator />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: '/app/*',
    element: <PrivateRoutes />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
