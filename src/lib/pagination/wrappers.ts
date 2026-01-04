/**
 * Wrapper functions for paginated list endpoints
 *
 * These are convenience wrappers around the auto-generated SDK functions
 * that handle pagination and search parameters consistently.
 *
 * Note: The API now uses query parameters (Page, PageSize, SearchTerm) instead of request body.
 */

import {
  getAppointments,
  getAppointmentsByIdVisits,
  getAssignments,
  getDepartments,
  getItems,
  getMaintenances,
  getMaintenanceTypes,
  getManufacturers,
  getOrderItems,
  getOrderItemsByOrderByOrderId,
  getOrders,
  getPersons,
  getPersonsByIdAssignments,
  getProducts,
  getProductTypes,
  getProductsByIdVariants,
  getStorageLocations,
  getVariants,
  getVariantsByIdItems,
  getVisits,
} from '@/api/sdk.gen';
import type { ListParams } from './types';

/**
 * Fetch paginated list of appointments with search
 */
export const getAppointmentsPaginated = (
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getAppointments({
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of departments with search
 */
export const getDepartmentsPaginated = (
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getDepartments({
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of items with search
 */
export const getItemsPaginated = (
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getItems({
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of maintenances with search
 */
export const getMaintenancesPaginated = (
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getMaintenances({
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of maintenance types with search
 */
export const getMaintenanceTypesPaginated = (
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getMaintenanceTypes({
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of manufacturers with search
 */
export const getManufacturersPaginated = (
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getManufacturers({
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of order items with search
 */
export const getOrderItemsPaginated = (
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getOrderItems({
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of orders with search
 */
export const getOrdersPaginated = (
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getOrders({
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of persons with search
 */
export const getPersonsPaginated = (
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getPersons({
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of products with search
 */
export const getProductsPaginated = (
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getProducts({
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of product types with search
 */
export const getProductTypesPaginated = (
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getProductTypes({
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of storage locations with search
 */
export const getStorageLocationsPaginated = (
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getStorageLocations({
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of variants with search
 */
export const getVariantsPaginated = (
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getVariants({
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of variants for a specific product with search
 */
export const getProductsByIdVariantsPaginated = (
  productId: string,
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getProductsByIdVariants({
    path: { id: productId },
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of items for a specific variant with search
 */
export const getVariantsByIdItemsPaginated = (
  variantId: string,
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getVariantsByIdItems({
    path: { id: variantId },
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of assignments for a specific person with search
 */
export const getPersonsByIdAssignmentsPaginated = (
  personId: string,
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getPersonsByIdAssignments({
    path: { id: personId },
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of order items for a specific order with search
 */
export const getOrderItemsByOrderByOrderIdPaginated = (
  orderId: string,
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getOrderItemsByOrderByOrderId({
    path: { orderId },
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of visits for a specific appointment with search
 */
export const getAppointmentsByIdVisitsPaginated = (
  appointmentId: string,
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getAppointmentsByIdVisits({
    path: { id: appointmentId },
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of assignments with search
 */
export const getAssignmentsPaginated = (
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getAssignments({
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};

/**
 * Fetch paginated list of visits with search
 */
export const getVisitsPaginated = (
  params: Partial<ListParams> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) => {
  return getVisits({
    query: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      SearchTerm: params.searchTerm ?? undefined,
    },
    ...options,
  });
};
