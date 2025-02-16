import { useState, useCallback } from 'react';
import { useError } from '../context/ErrorContext';

interface UseLoadingState {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  wrapLoading: <T>(promise: Promise<T>) => Promise<T>;
}

export const useLoadingState = (errorTitle?: string): UseLoadingState => {
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useError();

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  const wrapLoading = useCallback(async <T>(promise: Promise<T>): Promise<T> => {
    try {
      startLoading();
      const result = await promise;
      return result;
    } catch (error: any) {
      if (errorTitle) {
        showError(
          errorTitle,
          error.response?.data?.error || error.message,
          error.response?.data?.details
        );
      }
      throw error;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, showError, errorTitle]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    wrapLoading
  };
};