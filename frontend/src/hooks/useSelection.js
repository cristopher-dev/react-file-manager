import { useContext } from "react";
import { SelectionContext } from "../contexts/SelectionContext";

/**
 * Hook to access selection context
 * Must be used within a SelectionProvider
 * @returns {Object} Selection context with methods and state
 */
export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};
