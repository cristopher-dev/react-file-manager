import { useState, useCallback } from "react";

/**
 * Enhanced error handling hook with better state management
 * Provides centralized error handling with automatic clearing
 */
export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clear error with callback optimization
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Handle error with automatic logging
  const handleError = useCallback((error, context = "") => {
    const errorMessage = error?.message || error?.toString() || "An unknown error occurred";
    const errorObject = {
      message: errorMessage,
      context,
      timestamp: new Date().toISOString(),
      stack: error?.stack || null,
    };

    setError(errorObject);
    
    // Log error for debugging (only in development)
    if (import.meta.env.DEV) {
      console.error(`Error in ${context}:`, error);
    }
  }, []);

  // Async operation wrapper with error handling
  const withErrorHandling = useCallback(async (asyncFn, context = "") => {
    setIsLoading(true);
    clearError();
    
    try {
      const result = await asyncFn();
      return result;
    } catch (error) {
      handleError(error, context);
      throw error; // Re-throw for component-specific handling if needed
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  // Safe async operation that doesn't throw
  const safeAsyncOperation = useCallback(async (asyncFn, context = "", defaultValue = null) => {
    try {
      return await withErrorHandling(asyncFn, context);
    } catch (error) {
      return defaultValue;
    }
  }, [withErrorHandling]);

  return {
    error,
    isLoading,
    clearError,
    handleError,
    withErrorHandling,
    safeAsyncOperation,
    hasError: !!error,
  };
};
