import { useState, useCallback } from 'react';

export interface ErrorState {
  message: string;
  details?: string;
  timestamp: Date;
  retryable: boolean;
}

/**
 * Custom hook for consistent error handling across the application
 * 
 * Usage:
 * const { error, setError, clearError, handleError } = useErrorHandler();
 * 
 * try {
 *   await someAsyncOperation();
 * } catch (err) {
 *   handleError(err, { retryable: true });
 * }
 */
export const useErrorHandler = () => {
  const [error, setErrorState] = useState<ErrorState | null>(null);

  const setError = useCallback((errorState: ErrorState) => {
    setErrorState(errorState);
    
    // Log to console
    console.error('Error occurred:', errorState);
    
    // Send to error tracking service
    logErrorToService(errorState);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const handleError = useCallback((
    err: unknown,
    options: { retryable?: boolean; context?: string } = {}
  ) => {
    const { retryable = false, context = '' } = options;

    let message = 'An unexpected error occurred';
    let details = '';

    if (err instanceof Error) {
      message = err.message;
      details = err.stack || '';
    } else if (typeof err === 'string') {
      message = err;
    } else if (err && typeof err === 'object' && 'message' in err) {
      message = String((err as any).message);
    }

    const errorState: ErrorState = {
      message: context ? `${context}: ${message}` : message,
      details,
      timestamp: new Date(),
      retryable,
    };

    setError(errorState);
  }, [setError]);

  return {
    error,
    setError,
    clearError,
    handleError,
    hasError: error !== null,
  };
};

/**
 * Log error to external service (Sentry, LogRocket, etc.)
 */
function logErrorToService(errorState: ErrorState) {
  try {
    // TODO: Integrate with error tracking service
    // Example: Sentry.captureException(new Error(errorState.message));
    
    // For now, just console log
    console.group('📊 Error Logged');
    console.log('Message:', errorState.message);
    console.log('Timestamp:', errorState.timestamp.toISOString());
    console.log('Retryable:', errorState.retryable);
    if (errorState.details) {
      console.log('Details:', errorState.details);
    }
    console.groupEnd();
  } catch (e) {
    console.error('Failed to log error to service:', e);
  }
}

/**
 * Hook for handling async operations with automatic error handling
 * 
 * Usage:
 * const { execute, loading, error } = useAsyncErrorHandler();
 * 
 * <Button onClick={() => execute(async () => {
 *   await someAsyncOperation();
 * })}>
 *   Do Something
 * </Button>
 */
export const useAsyncErrorHandler = <T = void>() => {
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  const execute = useCallback(
    async (
      asyncFn: () => Promise<T>,
      options: { context?: string; retryable?: boolean } = {}
    ): Promise<T | null> => {
      setLoading(true);
      clearError();

      try {
        const result = await asyncFn();
        setLoading(false);
        return result;
      } catch (err) {
        handleError(err, options);
        setLoading(false);
        return null;
      }
    },
    [handleError, clearError]
  );

  return {
    execute,
    loading,
    error,
    clearError,
  };
};

export default useErrorHandler;

