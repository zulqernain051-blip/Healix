/**
 * Global HTTP Status Codes.
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
} as const;

/**
 * Authentication and security settings.
 */
export const AUTH_CONSTANTS = {
  OTP_EXPIRY_MINUTES: 10,
  OTP_RESEND_LIMIT_PER_HOUR: 5,
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_MINUTES: 15,
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY_DAYS: 30
} as const;

/**
 * Query and pagination default values.
 */
export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
} as const;
