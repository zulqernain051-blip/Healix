export interface SortParams {
  orderBy: {
    [key: string]: 'asc' | 'desc';
  };
}

export interface SearchParams {
  OR: Array<{
    [key: string]: {
      contains: string;
      mode: 'insensitive';
    };
  }>;
}

/**
 * Parses sort query options into Prisma orderBy configurations.
 * E.g., ?sortBy=createdAt&sortOrder=desc => { orderBy: { createdAt: 'desc' } }
 */
export const getSortParams = (
  query: any, 
  defaultField: string = 'createdAt', 
  defaultOrder: 'asc' | 'desc' = 'desc'
): SortParams => {
  const sortBy = (query.sortBy as string) || defaultField;
  const sortOrder = (query.sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : defaultOrder;

  return {
    orderBy: {
      [sortBy]: sortOrder
    }
  };
};

/**
 * Parses a search query string into Prisma conditional checks across specified fields.
 */
export const getSearchParams = (query: any, searchableFields: string[]): SearchParams | undefined => {
  const search = query.search as string | undefined;
  if (!search || !searchableFields.length) {
    return undefined;
  }

  const cleanSearch = search.trim();
  if (cleanSearch === '') {
    return undefined;
  }

  return {
    OR: searchableFields.map((field) => ({
      [field]: {
        contains: cleanSearch,
        mode: 'insensitive' as const
      }
    }))
  };
};
