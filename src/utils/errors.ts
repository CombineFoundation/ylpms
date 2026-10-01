import { ZodError } from "zod";

// Custom error classes
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: Record<string, string[]>) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "You don't have permission to access this resource") {
    super(message, 403, "AUTHORIZATION_ERROR");
    this.name = "AuthorizationError";
  }
}

/** The token is valid but the account is inactive/suspended — the client should sign out. */
export class AccountDisabledError extends AppError {
  constructor(message: string = "Your account has been deactivated. Contact your administrator.") {
    super(message, 403, "ACCOUNT_DISABLED");
    this.name = "AccountDisabledError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429, "RATE_LIMIT");
    this.name = "RateLimitError";
  }
}

// Error response format
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    errors?: Record<string, string[]>;
  };
}

// Success response format
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

// Unified response type
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/** Routes call `schema.parse()` directly; turn a ZodError into a 400 with per-field messages. */
function fromZodError(error: ZodError): ValidationError {
  const fieldErrors: Record<string, string[]> = {};
  error.errors.forEach((issue) => {
    const path = issue.path.join(".") || "_";
    (fieldErrors[path] ||= []).push(issue.message);
  });
  const first = error.errors[0];
  const message = first
    ? `${first.path.length ? `${first.path.join(".")}: ` : ""}${first.message}`
    : "Validation failed";
  return new ValidationError(message, fieldErrors);
}

// Error handler utility
export function handleError(error: unknown): ErrorResponse {
  if (error instanceof ZodError) {
    error = fromZodError(error);
  }

  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        ...(error instanceof ValidationError && { errors: error.errors }),
      },
    };
  }

  if (error instanceof Error) {
    // Unexpected errors (Firestore, Admin SDK, etc.) carry internal details —
    // log them server-side but don't leak them to the browser.
    console.error("[ERROR] Unhandled API error", error);
    return {
      success: false,
      error: {
        message: "Something went wrong. Please try again.",
        code: "INTERNAL_ERROR",
        statusCode: 500,
      },
    };
  }

  return {
    success: false,
    error: {
      message: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
      statusCode: 500,
    },
  };
}

// Logger utility
export const logger = {
  info: (message: string, data?: unknown) => {
    console.log(`[INFO] ${message}`, data || "");
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error || "");
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data || "");
  },
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEBUG] ${message}`, data || "");
    }
  },
};
