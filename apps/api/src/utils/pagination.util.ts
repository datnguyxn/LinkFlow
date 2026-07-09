import type { PaginationMeta } from "../common/responses/api.response.js";

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
export function buildPagination(page = 1, limit = 10) {
    return {
        skip: (page - 1) * limit,
        take: limit,
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
    page: number,
    limit: number,
    totalItems: number,
): PaginationMeta {

    const totalPages = Math.ceil(totalItems / limit);

    return {
        page,
        limit,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
    };
}