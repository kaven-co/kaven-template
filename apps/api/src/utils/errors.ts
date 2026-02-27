/**
 * Standardized error response utilities for the Kaven API.
 *
 * All API error responses follow this shape:
 * {
 *   error: string;       // HTTP status text (e.g. "Bad Request")
 *   message: string;     // Human-readable explanation
 *   code: string;        // Machine-readable error code (e.g. "VALIDATION_ERROR")
 *   statusCode: number;  // HTTP status code
 * }
 */

// ---------------------------------------------------------------------------
// HTTP status text mapping
// ---------------------------------------------------------------------------

const HTTP_STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
};

/**
 * Returns the standard HTTP status text for a given status code.
 */
export function httpStatusText(statusCode: number): string {
  return HTTP_STATUS_TEXT[statusCode] || 'Unknown Error';
}

// ---------------------------------------------------------------------------
// AppError — throwable error with standardized fields
// ---------------------------------------------------------------------------

export interface ErrorResponsePayload {
  error: string;
  message: string;
  code: string;
  statusCode: number;
  /** Optional validation details (Zod / Fastify schema errors). */
  details?: unknown;
}

/**
 * Application error that carries all fields needed for a standardized API response.
 *
 * Usage in controllers / services:
 *   throw new AppError(404, 'USER_NOT_FOUND', 'User with the given ID does not exist');
 *
 * The global error handler in app.ts will catch this and format the response.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintain proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Converts this error into the standard response payload.
   */
  toJSON(): ErrorResponsePayload {
    const payload: ErrorResponsePayload = {
      error: httpStatusText(this.statusCode),
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };
    if (this.details !== undefined) {
      payload.details = this.details;
    }
    return payload;
  }
}

// ---------------------------------------------------------------------------
// Convenience factory helpers
// ---------------------------------------------------------------------------

export function badRequest(message: string, code = 'BAD_REQUEST', details?: unknown): AppError {
  return new AppError(400, code, message, details);
}

export function unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED'): AppError {
  return new AppError(401, code, message);
}

export function forbidden(message = 'Insufficient permissions', code = 'FORBIDDEN'): AppError {
  return new AppError(403, code, message);
}

export function notFound(message = 'Resource not found', code = 'NOT_FOUND'): AppError {
  return new AppError(404, code, message);
}

export function conflict(message: string, code = 'CONFLICT'): AppError {
  return new AppError(409, code, message);
}

export function validationError(message: string, details?: unknown): AppError {
  return new AppError(422, 'VALIDATION_ERROR', message, details);
}

export function tooManyRequests(message = 'Rate limit exceeded', retryAfter?: number): AppError {
  return new AppError(429, 'RATE_LIMIT_EXCEEDED', message, retryAfter ? { retryAfter } : undefined);
}

export function internalError(message = 'Internal server error'): AppError {
  return new AppError(500, 'INTERNAL_ERROR', message);
}
