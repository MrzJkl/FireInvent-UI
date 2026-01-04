/**
 * Generic types and utilities for paginated list endpoints
 * 
 * This module provides generic types and wrapper functions to handle
 * the pagination and search functionality across all list endpoints.
 */

import type { PagedQuery, PagedResultOfAppointmentModel, PagedResultOfDepartmentModel, PagedResultOfItemModel, PagedResultOfPersonModel, PagedResultOfProductModel, PagedResultOfStorageLocationModel, PagedResultOfManufacturerModel, PagedResultOfProductTypeModel, PagedResultOfMaintenanceTypeModel, PagedResultOfOrderModel, PagedResultOfVariantModel } from './types.gen';
import { client } from './client.gen';
import type { Client, Options as ClientOptions } from './client';

/**
 * State for pagination
 */
export type PaginationState = {
  page: number;
  pageSize: number;
};

/**
 * Params for list requests
 */
export type ListParams = PaginationState & {
  searchTerm?: string | null;
};

/**
 * Generic type for paginated responses from the API
 */
export type PagedResult<T> = {
  items?: T[];
  totalItems?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
};

/**
 * Type map for all paginated responses
 */
export type PagedResponseTypeMap = {
  appointments: PagedResultOfAppointmentModel;
  departments: PagedResultOfDepartmentModel;
  items: PagedResultOfItemModel;
  persons: PagedResultOfPersonModel;
  products: PagedResultOfProductModel;
  storageLocations: PagedResultOfStorageLocationModel;
  manufacturers: PagedResultOfManufacturerModel;
  productTypes: PagedResultOfProductTypeModel;
  maintenanceTypes: PagedResultOfMaintenanceTypeModel;
  orders: PagedResultOfOrderModel;
  variants: PagedResultOfVariantModel;
};

/**
 * Generic wrapper function for paginated list endpoints
 * 
 * @param endpoint The API endpoint path (e.g. '/departments', '/items')
 * @param params Pagination and search parameters
 * @param options Additional client options (headers, etc.)
 * @returns The paginated result
 */
export async function getPagedList<T extends keyof PagedResponseTypeMap>(
  endpoint: T,
  params: Partial<ListParams> = {},
  options?: { headers?: Record<string, unknown> },
): Promise<PagedResponseTypeMap[T]> {
  const body: PagedQuery = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    searchTerm: params.searchTerm ?? null,
  };

  // Map endpoint names to URL paths
  const endpointMap: Record<string, string> = {
    appointments: '/appointments',
    departments: '/departments',
    items: '/items',
    persons: '/persons',
    products: '/products',
    storageLocations: '/storage-locations',
    manufacturers: '/manufacturers',
    productTypes: '/product-types',
    maintenanceTypes: '/maintenance-types',
    orders: '/orders',
    variants: '/variants',
  };

  const url = endpointMap[endpoint];
  if (!url) {
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }

  return client.get({
    url,
    body,
    responseType: 'json',
    headers: options?.headers,
    security: [
      {
        scheme: 'bearer',
        type: 'http',
      },
    ],
  });
}

/**
 * Helper function to extract items from paginated response
 */
export function extractItems<T>(response: PagedResult<T>): T[] {
  return response.items ?? [];
}

/**
 * Helper function to get pagination info from response
 */
export function getPaginationInfo<T>(response: PagedResult<T>) {
  return {
    totalItems: response.totalItems ?? 0,
    totalPages: response.totalPages ?? 0,
    currentPage: response.page ?? 1,
    pageSize: response.pageSize ?? 10,
  };
}
