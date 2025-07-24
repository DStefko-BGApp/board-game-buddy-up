/**
 * Centralized error handling utilities
 */

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Create a standardized error object
 */
export const createAppError = (message: string, code?: string, details?: unknown): AppError => ({
  message,
  code,
  details
});

/**
 * Extract a user-friendly error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (!error) return 'An unknown error occurred';
  
  if (typeof error === 'string') return error;
  
  if (error instanceof Error) return error.message;
  
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
  }
  
  return 'An unexpected error occurred';
};

/**
 * Check if an error indicates a network issue
 */
export const isNetworkError = (error: unknown): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('network') || 
         message.includes('fetch') || 
         message.includes('connection') ||
         message.includes('timeout');
};

/**
 * Check if an error indicates an authentication issue
 */
export const isAuthError = (error: unknown): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('unauthorized') || 
         message.includes('authentication') || 
         message.includes('token') ||
         message.includes('session');
};