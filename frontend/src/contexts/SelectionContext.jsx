import { createContext, useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { validateApiCallback } from "../utils/validateApiCallback";

const SelectionContext = createContext();

export { SelectionContext };

/**
 * Enhanced SelectionProvider with better performance optimizations
 * Uses useCallback and useMemo to prevent unnecessary re-renders
 */
export const SelectionProvider = ({ children, onDownload = null, onSelect = null }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Optimized selection effect with proper dependencies
  useEffect(() => {
    if (selectedFiles.length && onSelect) {
      onSelect(selectedFiles);
    }
  }, [selectedFiles, onSelect]);

  // Memoized download handler
  const handleDownload = useCallback(() => {
    validateApiCallback(onDownload, "onDownload", selectedFiles);
  }, [onDownload, selectedFiles]);

  // Memoized clear selection handler
  const clearSelection = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  // Memoized toggle selection handler
  const toggleFileSelection = useCallback((file) => {
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.path === file.path);
      if (isSelected) {
        return prev.filter(f => f.path !== file.path);
      } else {
        return [...prev, file];
      }
    });
  }, []);

  // Memoized select all handler
  const selectAll = useCallback((files) => {
    setSelectedFiles(files || []);
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    selectedFiles,
    setSelectedFiles,
    handleDownload,
    clearSelection,
    toggleFileSelection,
    selectAll,
    selectedCount: selectedFiles.length,
    hasSelection: selectedFiles.length > 0,
  }), [selectedFiles, handleDownload, clearSelection, toggleFileSelection, selectAll]);

  return (
    <SelectionContext.Provider value={contextValue}>
      {children}
    </SelectionContext.Provider>
  );
};

// PropTypes validation
SelectionProvider.propTypes = {
  children: PropTypes.node.isRequired,
  onDownload: PropTypes.func,
  onSelect: PropTypes.func,
};
