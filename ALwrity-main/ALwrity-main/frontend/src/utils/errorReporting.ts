/**
 * Error Reporting Utilities
 * 
 * Centralized error logging and reporting for the application.
 * Integrates with external services like Sentry, LogRocket, etc.
 */

import { apiClient } from '../api/client';

export interface ErrorReport {
  error: Error | string;
  context?: string;
  userId?: string;
  metadata?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

/**
 * Report an error to monitoring services
 */
export const reportError = (report: ErrorReport): void => {
  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Report [${report.severity || 'medium'}]`);
      console.error('Error:', report.error);
      console.log('Context:', report.context);
      console.log('User:', report.userId);
      console.log('Metadata:', report.metadata);
      console.log('Timestamp:', report.timestamp);
      console.groupEnd();
    }

    // Send to Sentry (if configured)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;
      
      if (report.error instanceof Error) {
        Sentry.captureException(report.error, {
          level: report.severity || 'error',
          tags: {
            context: report.context,
          },
          user: report.userId ? { id: report.userId } : undefined,
          extra: report.metadata,
        });
      } else {
        Sentry.captureMessage(report.error, {
          level: report.severity || 'error',
          tags: {
            context: report.context,
          },
        });
      }
    }

    // Send to backend logging endpoint
    sendToBackend(report);
  } catch (e) {
    console.error('Failed to report error:', e);
  }
};

/**
 * Send error to backend logging endpoint
 */
const sendToBackend = async (report: ErrorReport): Promise<void> => {
  try {
    // Only send in production or if explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.REACT_APP_ENABLE_ERROR_REPORTING === 'true') {
      await apiClient.post('/api/log-error', {
        error_message: report.error instanceof Error ? report.error.message : report.error,
        error_stack: report.error instanceof Error ? report.error.stack : undefined,
        context: report.context,
        user_id: report.userId,
        metadata: report.metadata,
        severity: report.severity,
        timestamp: report.timestamp,
        user_agent: navigator.userAgent,
        url: window.location.href,
      });
    }
  } catch (e) {
    // Fail silently - don't want error reporting to cause more errors
    console.warn('Failed to send error to backend:', e);
  }
};

/**
 * Track error for analytics
 */
export const trackError = (
  errorType: string,
  message: string,
  metadata?: Record<string, any>
): void => {
  try {
    // Track in analytics (Google Analytics, Mixpanel, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `${errorType}: ${message}`,
        fatal: false,
        ...metadata,
      });
    }

    // Log to console
    console.warn(`📊 Error Tracked: ${errorType}`, message, metadata);
  } catch (e) {
    console.error('Failed to track error:', e);
  }
};

/**
 * Helper to determine if error is retryable
 */
export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors are typically retryable
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('fetch') ||
      message.includes('connection')
    ) {
      return true;
    }
    
    // 5xx errors are retryable
    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return true;
    }
  }
  
  return false;
};

/**
 * Helper to sanitize error messages for user display
 */
export const sanitizeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message;
    
    // Remove technical details from user-facing messages
    if (message.includes('ECONNREFUSED')) {
      return 'Unable to connect to server. Please check your connection.';
    }
    
    if (message.includes('401') || message.includes('unauthorized')) {
      return 'Authentication failed. Please sign in again.';
    }
    
    if (message.includes('403') || message.includes('forbidden')) {
      return 'You do not have permission to access this resource.';
    }
    
    if (message.includes('404')) {
      return 'The requested resource was not found.';
    }
    
    if (message.includes('429')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    
    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return 'Server error occurred. Please try again later.';
    }
    
    // Return original message if no sanitization needed
    return message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

export default reportError;

