import { useState, useCallback, useMemo } from "react";

/**
 * Enhanced trigger action hook with better state management
 * Provides methods to show/hide actions with improved performance
 */
export const useTriggerAction = () => {
  const [isActive, setIsActive] = useState(false);
  const [actionType, setActionType] = useState(null);

  // Memoized show function to prevent unnecessary re-renders
  const show = useCallback((type) => {
    if (type && typeof type === 'string') {
      setIsActive(true);
      setActionType(type);
    }
  }, []);

  // Memoized close function
  const close = useCallback(() => {
    setIsActive(false);
    setActionType(null);
  }, []);

  // Memoized toggle function for convenience
  const toggle = useCallback((type) => {
    if (isActive && actionType === type) {
      close();
    } else {
      show(type);
    }
  }, [isActive, actionType, close, show]);

  // Return memoized object to prevent unnecessary re-renders
  return useMemo(() => ({
    isActive,
    actionType,
    show,
    close,
    toggle,
  }), [isActive, actionType, show, close, toggle]);
};
