/**
 * Types and utilities for paginated list endpoints
 */

/**
 * Parameters for paginated list requests
 */
export type ListParams = {
  page: number;
  pageSize: number;
  searchTerm: string | null;
};

/**
 * Generic paginated result structure
 */
export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
