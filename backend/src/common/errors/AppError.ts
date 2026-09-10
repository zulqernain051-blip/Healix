export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors: any;

  constructor(message: string, statusCode: number, errors: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    // Capture the stack trace so it doesn't include this constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}
