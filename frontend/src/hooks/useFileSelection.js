import { useState, useEffect, useCallback } from "react";
import { useSelection } from "./useSelection";
import { useFileNavigation } from "../contexts/FileNavigationContext";
import { duplicateNameHandler } from "../utils/duplicateNameHandler";

/**
 * Custom hook for managing file selection and editing functionality
 * Handles file selection indexes and editing operations
 */
export const useFileSelection = (triggerAction) => {
  const [selectedFileIndexes, setSelectedFileIndexes] = useState([]);
  const { selectedFiles, setSelectedFiles } = useSelection();
  const { currentPath, currentPathFiles, setCurrentPathFiles } = useFileNavigation();

  // Clear selection when path changes
  useEffect(() => {
    setSelectedFileIndexes([]);
    setSelectedFiles([]);
  }, [currentPath, setSelectedFiles]);

  // Update selection indexes when selected files change
  useEffect(() => {
    if (selectedFiles.length > 0) {
      setSelectedFileIndexes(() => {
        return selectedFiles.map((selectedFile) => {
          return currentPathFiles.findIndex((f) => f.path === selectedFile.path);
        });
      });
    } else {
      setSelectedFileIndexes([]);
    }
  }, [selectedFiles, currentPathFiles]);

  // Handle folder creation
  const handleFolderCreating = useCallback(() => {
    setCurrentPathFiles((prev) => {
      return [
        ...prev,
        {
          name: duplicateNameHandler("New Folder", true, prev),
          isDirectory: true,
          path: currentPath,
          isEditing: true,
          key: new Date().valueOf(),
        },
      ];
    });
  }, [setCurrentPathFiles, currentPath]);

  // Handle item renaming
  const handleItemRenaming = useCallback(() => {
    setCurrentPathFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[selectedFileIndexes.at(-1)]) {
        newFiles[selectedFileIndexes.at(-1)].isEditing = true;
      } else {
        triggerAction.close();
      }
      return newFiles;
    });

    setSelectedFileIndexes([]);
    setSelectedFiles([]);
  }, [setCurrentPathFiles, selectedFileIndexes, setSelectedFiles, triggerAction]);

  // Handle file unselection
  const unselectFiles = useCallback(() => {
    setSelectedFileIndexes([]);
    setSelectedFiles((prev) => (prev.length > 0 ? [] : prev));
  }, [setSelectedFiles]);

  // Handle trigger actions
  useEffect(() => {
    if (triggerAction.isActive) {
      switch (triggerAction.actionType) {
        case "createFolder":
          handleFolderCreating();
          break;
        case "rename":
          handleItemRenaming();
          break;
      }
    }
  }, [triggerAction.isActive, triggerAction.actionType, handleFolderCreating, handleItemRenaming]);

  return {
    selectedFileIndexes,
    unselectFiles,
    handleFolderCreating,
    handleItemRenaming,
  };
};
