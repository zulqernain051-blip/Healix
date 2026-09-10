import { PAGINATION_DEFAULTS } from '../constants';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMetadata;
}

/**
 * Parses page and limit parameters from request query, enforcing defaults and maximum limits.
 */
export const getPaginationParams = (query: any): PaginationParams => {
  const page = Math.max(
    1,
    parseInt(query.page as string, 10) || PAGINATION_DEFAULTS.DEFAULT_PAGE
  );
  
  let limit = parseInt(query.limit as string, 10) || PAGINATION_DEFAULTS.DEFAULT_LIMIT;
  
  // Enforce positive limit and cap at maximum
  limit = Math.max(1, limit);
  limit = Math.min(limit, PAGINATION_DEFAULTS.MAX_LIMIT);
  
  const skip = (page - 1) * limit;
  const take = limit;
  
  return { page, limit, skip, take };
};

/**
 * Computes pagination metadata based on page index, page limit, and total record count.
 */
export const formatPaginationMetadata = (
  page: number,
  limit: number,
  totalCount: number
): PaginationMetadata => {
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};
