import { useContext } from "react";
import { ClipBoardContext } from "../contexts/ClipboardContext";

/**
 * Custom hook to access clipboard context
 * @returns {Object} Clipboard context value
 */
export const useClipBoard = () => {
  const context = useContext(ClipBoardContext);
  
  if (!context) {
    throw new Error('useClipBoard must be used within a ClipBoardProvider');
  }
  
  return context;
};
