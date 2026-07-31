import type { PaginationMeta } from '../common/responses/api.response.js';

/**
 * Pagination utility functions to support paginated queries and responses.
 * Provides methods to build pagination parameters and metadata for API responses.
 */
export interface PaginationQuery {
  page: number;
  limit: number;
}

/**
 * Builds pagination parameters for database queries based on the provided page and limit.
 * @param page - The current page number (default is 1)
 * @param limit - The number of items per page (default is 10)
 * @returns An object containing 'skip' and 'take' values for database queries
 */
export function buildPagination(page: number | string, limit: number | string) {
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  return {
    skip: (pageNumber - 1) * limitNumber,
    take: limitNumber,
  };
}

/**
 * Builds pagination metadata for API responses based on the provided page, limit, and total items.
 * @param page - The current page number
 * @param limit - The number of items per page
 * @param totalItems - The total number of items available
 * @returns An object containing pagination metadata including total pages and navigation flags
 */
export function buildPaginationMeta(
  page: number | string,
  limit: number | string,
  totalItems: number,
): PaginationMeta {
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const totalPages = Math.ceil(totalItems / limitNumber);

  return {
    page: pageNumber,
    limit: limitNumber,
    totalItems,
    totalPages,
    hasNext: pageNumber < totalPages,
    hasPrevious: pageNumber > 1,
  };
}
