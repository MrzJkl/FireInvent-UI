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

export function PrivateRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="productTypes" element={<ProductTypesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="items/:id" element={<ItemDetailPage />} />
        <Route path="persons" element={<PersonsPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="storageLocations" element={<StorageLocationsPage />} />
        <Route path="maintenanceTypes" element={<MaintenanceTypesPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/app" />} />
    </Routes>
  );
}
