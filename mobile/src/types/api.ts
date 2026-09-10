/**
 * Represents the normalized error structure sent by the backend.
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Standard backend response format.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: FieldError[];
}

/**
 * Custom error class for API failures, used across the frontend.
 */
export class ApiError extends Error {
  public statusCode: number;
  public fieldErrors?: FieldError[];
  public rawErrors?: any;

  constructor(
    message: string,
    statusCode: number,
    fieldErrors?: FieldError[],
    rawErrors?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
    this.rawErrors = rawErrors;
  }
}
