import LandingPage from '@/pages/LandingPage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PrivateRoutes } from './PrivateRoutes';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/app/*',
    element: <PrivateRoutes />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
