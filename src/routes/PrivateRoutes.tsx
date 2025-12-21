import { type ReactElement } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage';
import ProductTypesPage from '@/pages/ProductTypesPage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import ItemDetailPage from '@/pages/ItemDetailPage';
import MaintenanceTypesPage from '@/pages/MaintenanceTypesPage';
import DepartmentsPage from '@/pages/DepartmentsPage';
import PersonsPage from '@/pages/PersonsPage';
import UsersPage from '@/pages/UsersPage';
import AppLayout from '@/layouts/AppLayout';
import StorageLocationsPage from '@/pages/StorageLocationsPage';
import StorageLocationDetailPage from '@/pages/StorageLocationDetailPage';
import ApiIntegrationsPage from '@/pages/ApiIntegrationsPage';
import ManufacturersPage from '@/pages/ManufacturersPage';
import ManufacturerDetailPage from '@/pages/ManufacturerDetailPage';
import OrdersPage from '@/pages/OrdersPage';
import OrderDetailPage from '@/pages/OrderDetailPage';
import { useAuthorization } from '@/auth/permissions';

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
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="manufacturers" element={<ManufacturersPage />} />
        <Route path="manufacturers/:id" element={<ManufacturerDetailPage />} />
        <Route path="productTypes" element={<ProductTypesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="items/:id" element={<ItemDetailPage />} />
        <Route path="persons" element={<PersonsPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="storageLocations" element={<StorageLocationsPage />} />
        <Route
          path="storageLocations/:id"
          element={<StorageLocationDetailPage />}
        />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
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
  );
}
