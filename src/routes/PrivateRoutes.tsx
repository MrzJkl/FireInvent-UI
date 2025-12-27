import { type ReactElement, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import { TenantProvider } from '@/auth/tenant';
import { useAuthorization } from '@/auth/permissions';
import { LoadingIndicator } from '@/components/LoadingIndicator';

// Lazy load all pages
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ProductTypesPage = lazy(() => import('@/pages/ProductTypesPage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const ItemDetailPage = lazy(() => import('@/pages/ItemDetailPage'));
const MaintenanceTypesPage = lazy(() => import('@/pages/MaintenanceTypesPage'));
const DepartmentsPage = lazy(() => import('@/pages/DepartmentsPage'));
const PersonsPage = lazy(() => import('@/pages/PersonsPage'));
const PersonDetailPage = lazy(() => import('@/pages/PersonDetailPage'));
const UsersPage = lazy(() => import('@/pages/UsersPage'));
const StorageLocationsPage = lazy(() => import('@/pages/StorageLocationsPage'));
const StorageLocationDetailPage = lazy(
  () => import('@/pages/StorageLocationDetailPage'),
);
const ApiIntegrationsPage = lazy(() => import('@/pages/ApiIntegrationsPage'));
const ManufacturersPage = lazy(() => import('@/pages/ManufacturersPage'));
const ManufacturerDetailPage = lazy(
  () => import('@/pages/ManufacturerDetailPage'),
);
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'));
const AppointmentsPage = lazy(() =>
  import('@/pages/AppointmentsPage').then((m) => ({
    default: m.AppointmentsPage,
  })),
);
const AppointmentDetailPage = lazy(() =>
  import('@/pages/AppointmentDetailPage').then((m) => ({
    default: m.AppointmentDetailPage,
  })),
);

function GuardedRoute({
  allow,
  children,
}: {
  allow: boolean;
  children: ReactElement;
}) {
  if (!allow) {
    return <Navigate to="/app" replace />;
  }

  return children;
}

export function PrivateRoutes() {
  const { canAccessApiIntegrations, canAccessUsers } = useAuthorization();

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Routes>
        <Route
          element={
            <TenantProvider>
              <AppLayout />
            </TenantProvider>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="manufacturers" element={<ManufacturersPage />} />
          <Route
            path="manufacturers/:id"
            element={<ManufacturerDetailPage />}
          />
          <Route path="productTypes" element={<ProductTypesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="items/:id" element={<ItemDetailPage />} />
          <Route path="persons" element={<PersonsPage />} />
          <Route path="persons/:id" element={<PersonDetailPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="storageLocations" element={<StorageLocationsPage />} />
          <Route
            path="storageLocations/:id"
            element={<StorageLocationDetailPage />}
          />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route
            path="appointments/:appointmentId"
            element={<AppointmentDetailPage />}
          />
          <Route path="maintenanceTypes" element={<MaintenanceTypesPage />} />
          <Route
            path="users"
            element={
              <GuardedRoute allow={canAccessUsers}>
                <UsersPage />
              </GuardedRoute>
            }
          />
          <Route
            path="api-integrations"
            element={
              <GuardedRoute allow={canAccessApiIntegrations}>
                <ApiIntegrationsPage />
              </GuardedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/app" />} />
      </Routes>
    </Suspense>
  );
}
