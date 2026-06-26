/**
 * ApiError is the single error type every layer of the app throws.
 * It carries an HTTP status code so the global error middleware can
 * translate any thrown error into a consistent JSON response, and an
 * `isOperational` flag to distinguish expected failures (bad input, not
 * found, unauthorized) from genuine bugs.
 *
 * New error types are added by EXTENDING this class, never by branching
 * on string messages.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, isOperational = true, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad request", details?: unknown) {
    super(400, message, true, details);
  }
}

export class ValidationError extends ApiError {
  constructor(details: unknown, message = "Validation failed") {
    super(422, message, true, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, message, true);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden - you do not have access to this resource") {
    super(403, message, true);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(404, message, true);
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Resource conflict") {
    super(409, message, true);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = "Internal server error") {
    super(500, message, false);
  }
}
