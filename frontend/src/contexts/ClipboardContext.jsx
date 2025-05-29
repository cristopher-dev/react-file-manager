import { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { useSelection } from "../hooks/useSelection";
import { validateApiCallback } from "../utils/validateApiCallback";
import { ClipBoardContext } from "./ClipboardContext";

/**
 * Enhanced ClipBoard Provider with performance optimizations
 * Uses useCallback and useMemo to prevent unnecessary re-renders
 */
export const ClipBoardProvider = ({ children, onPaste = null, onCut = null, onCopy = null }) => {
  const [clipBoard, setClipBoard] = useState(null);
  const { selectedFiles, setSelectedFiles } = useSelection();

  // Memoized cut/copy handler
  const handleCutCopy = useCallback((isMoving) => {
    const newClipBoard = {
      files: selectedFiles,
      isMoving: isMoving,
    };
    setClipBoard(newClipBoard);

    if (isMoving) {
      onCut && onCut(selectedFiles);
    } else {
      onCopy && onCopy(selectedFiles);
    }
  }, [selectedFiles, onCut, onCopy]);

  // Memoized paste handler
  const handlePasting = useCallback((destinationFolder) => {
    if (!clipBoard) return;
    if (destinationFolder && !destinationFolder.isDirectory) return;

    const copiedFiles = clipBoard.files;
    const operationType = clipBoard.isMoving ? "move" : "copy";

    validateApiCallback(onPaste, "onPaste", copiedFiles, destinationFolder, operationType);

    // Clear clipboard if moving and clear selection
    if (clipBoard.isMoving) {
      setClipBoard(null);
    }
    setSelectedFiles([]);
  }, [clipBoard, onPaste, setSelectedFiles]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    clipBoard,
    setClipBoard,
    handleCutCopy,
    handlePasting,
    hasClipboard: !!clipBoard,
    isMoving: clipBoard?.isMoving || false,
  }), [clipBoard, handleCutCopy, handlePasting]);

  return (
    <ClipBoardContext.Provider value={contextValue}>
      {children}
    </ClipBoardContext.Provider>
  );
};

// PropTypes validation
ClipBoardProvider.propTypes = {
  children: PropTypes.node.isRequired,
  onPaste: PropTypes.func,
  onCut: PropTypes.func,
  onCopy: PropTypes.func,
};
