/**
 * Standardized Service Result & Error Envelope
 * Adheres to ADR 0028 and Typed Service Contract (Spec & Handler) architecture.
 */

export interface ServiceError<E extends string = string> {
  code: E;
  message: string;
  suggestion?: string;
  recoverable: boolean;
  details?: unknown;
}

export interface ServiceSuccess<T> {
  success: true;
  data: T;
}

export interface ServiceFailure<E extends string = string> {
  success: false;
  error: ServiceError<E>;
}

export type ServiceResult<T, E extends string = string> =
  ServiceSuccess<T> | ServiceFailure<E>;

/**
 * Creates a type-safe successful ServiceResult envelope.
 */
export function createSuccess<T>(data: T): ServiceSuccess<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Creates a type-safe failure ServiceResult envelope with structured error taxonomy.
 */
export function createFailure<E extends string = string>(
  code: E,
  message: string,
  options: {
    suggestion?: string;
    recoverable?: boolean;
    details?: unknown;
  } = {}
): ServiceFailure<E> {
  return {
    success: false,
    error: {
      code,
      message,
      suggestion: options.suggestion,
      recoverable: options.recoverable ?? true,
      details: options.details,
    },
  };
}
