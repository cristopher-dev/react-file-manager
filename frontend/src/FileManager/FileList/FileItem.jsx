import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { FaRegFile, FaRegFolderOpen } from "react-icons/fa6";
import { useFileIcons } from "../../hooks/useFileIcons";
import { useResponsive } from "../../hooks/useResponsive";
import useTouchGestures from "../../hooks/useTouchGestures";
import CreateFolderAction from "../Actions/CreateFolder/CreateFolder.action";
import RenameAction from "../Actions/Rename/Rename.action";
import { getDataSize } from "../../utils/getDataSize";
import { formatDate } from "../../utils/formatDate";
import { useFileNavigation } from "../../contexts/FileNavigationContext";
import { useSelection } from "../../hooks/useSelection";
import { useClipBoard } from "../../hooks/useClipBoard";
import { useLayout } from "../../contexts/LayoutContext";
import Checkbox from "../../components/Checkbox/Checkbox";

const dragIconSize = 50;

const FileItem = ({
  index,
  file,
  onCreateFolder,
  onRename,
  enableFilePreview,
  onFileOpen,
  filesViewRef,
  selectedFileIndexes,
  triggerAction,
  handleContextMenu,
  setLastSelectedFile,
  draggable,
}) => {
  const [fileSelected, setFileSelected] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [checkboxClassName, setCheckboxClassName] = useState("hidden");
  const [dropZoneClass, setDropZoneClass] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState(null);

  const { activeLayout } = useLayout();
  const { isMobile, isTouch } = useResponsive();
  const iconSize = activeLayout === "grid" ? 48 : 20;
  const fileIcons = useFileIcons(iconSize);
  const { setCurrentPath, currentPathFiles } = useFileNavigation();
  const { setSelectedFiles } = useSelection();
  const { clipBoard, handleCutCopy, setClipBoard, handlePasting } = useClipBoard();
  const dragIconRef = useRef(null);
  const dragIcons = useFileIcons(dragIconSize);

  // Touch gesture handlers
  const { touchHandlers, isPressed } = useTouchGestures({
    onTap: (e) => {
      if (file.isEditing) return;
      handleFileSelection(e);
    },
    onDoubleTap: (e) => {
      if (file.isEditing) return;
      e.preventDefault();
      handleFileAccess();
    },
    onLongPress: (e) => {
      if (file.isEditing) return;
      e.preventDefault();
      // Trigger context menu on long press for mobile
      if (isMobile) {
        navigator.vibrate && navigator.vibrate(50); // Haptic feedback
        handleItemContextMenu(e);
      }
    },
  });

  const isFileMoving =
    clipBoard?.isMoving &&
    clipBoard.files.find((f) => f.name === file.name && f.path === file.path);

  const handleFileAccess = () => {
    onFileOpen(file);
    if (file.isDirectory) {
      setCurrentPath(file.path);
      setSelectedFiles([]);
    } else {
      enableFilePreview && triggerAction.show("previewFile");
    }
  };

  const handleFileRangeSelection = (shiftKey, ctrlKey) => {
    if (selectedFileIndexes.length > 0 && shiftKey) {
      let reverseSelection = false;
      let startRange = selectedFileIndexes[0];
      let endRange = index;

      // Reverse Selection
      if (startRange >= endRange) {
        const temp = startRange;
        startRange = endRange;
        endRange = temp;
        reverseSelection = true;
      }

      const filesRange = currentPathFiles.slice(startRange, endRange + 1);
      setSelectedFiles(reverseSelection ? filesRange.reverse() : filesRange);
    } else if (selectedFileIndexes.length > 0 && ctrlKey) {
      // Remove file from selected files if it already exists on CTRL + Click, otherwise push it in selectedFiles
      setSelectedFiles((prev) => {
        const filteredFiles = prev.filter((f) => f.path !== file.path);
        if (prev.length === filteredFiles.length) {
          return [...prev, file];
        }
        return filteredFiles;
      });
    } else {
      setSelectedFiles([file]);
    }
  };

  const handleFileSelection = (e) => {
    e.stopPropagation();
    if (file.isEditing) return;

    handleFileRangeSelection(e.shiftKey, e.ctrlKey);

    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < 300) {
      handleFileAccess();
      return;
    }
    setLastClickTime(currentTime);
  };

  const handleOnKeyDown = (e) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      setSelectedFiles([file]);
      handleFileAccess();
    }
  };

  const handleItemContextMenu = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (file.isEditing) return;

    if (!fileSelected) {
      setSelectedFiles([file]);
    }

    setLastSelectedFile(file);
    handleContextMenu(e, true);
  };

  // Selection Checkbox Functions
  const handleMouseOver = useCallback(() => {
    setCheckboxClassName("visible");
  }, []);

  const handleMouseLeave = useCallback(() => {
    !fileSelected && setCheckboxClassName("hidden");
  }, [fileSelected]);

  const handleCheckboxChange = useCallback((e) => {
    if (e.target.checked) {
      setSelectedFiles((prev) => [...prev, file]);
    } else {
      setSelectedFiles((prev) => prev.filter((f) => f.name !== file.name && f.path !== file.path));
    }

    setFileSelected(e.target.checked);
  }, [file, setSelectedFiles]);
  //

  const handleDragStart = (e) => {
    e.dataTransfer.setDragImage(dragIconRef.current, 30, 50);
    e.dataTransfer.effectAllowed = "copy";
    handleCutCopy(true);
  };

  const handleDragEnd = () => setClipBoard(null);

  const handleDragEnterOver = (e) => {
    e.preventDefault();
    if (fileSelected || !file.isDirectory) {
      e.dataTransfer.dropEffect = "none";
    } else {
      setTooltipPosition({ x: e.clientX, y: e.clientY + 12 });
      e.dataTransfer.dropEffect = "copy";
      setDropZoneClass("file-drop-zone");
    }
  };

  const handleDragLeave = (e) => {
    // To stay in dragging state for the child elements of the target drop-zone
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropZoneClass((prev) => (prev ? "" : prev));
      setTooltipPosition(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (fileSelected || !file.isDirectory) return;

    handlePasting(file);
    setDropZoneClass((prev) => (prev ? "" : prev));
    setTooltipPosition(null);
  };

  useEffect(() => {
    setFileSelected(selectedFileIndexes.includes(index));
    setCheckboxClassName(selectedFileIndexes.includes(index) ? "visible" : "hidden");
  }, [selectedFileIndexes, index]);

  return (
    <div
      className={`file-item-container ${dropZoneClass} ${
        fileSelected || !!file.isEditing ? "file-selected" : ""
      } ${isFileMoving ? "file-moving" : ""} ${isPressed ? "file-pressed" : ""}`}
      tabIndex={0}
      title={file.name}
      onClick={!isTouch ? handleFileSelection : undefined}
      onKeyDown={handleOnKeyDown}
      onContextMenu={!isMobile ? handleItemContextMenu : undefined}
      onMouseOver={!isTouch ? handleMouseOver : undefined}
      onMouseLeave={!isTouch ? handleMouseLeave : undefined}
      draggable={fileSelected && draggable && !isMobile}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragEnter={handleDragEnterOver}
      onDragOver={handleDragEnterOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...(isTouch ? touchHandlers : {})}
    >
      <div className="file-item">
        {!file.isEditing && (
          <Checkbox
            name={file.name}
            id={file.name}
            checked={fileSelected}
            className={`selection-checkbox ${checkboxClassName}`}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {file.isDirectory ? (
          <FaRegFolderOpen size={iconSize} />
        ) : (
          <>
            {fileIcons[file.name?.split(".").pop()?.toLowerCase()] ?? <FaRegFile size={iconSize} />}
          </>
        )}

        {file.isEditing ? (
          <div className={`rename-file-container ${activeLayout}`}>
            {triggerAction.actionType === "createFolder" ? (
              <CreateFolderAction
                filesViewRef={filesViewRef}
                file={file}
                onCreateFolder={onCreateFolder}
                triggerAction={triggerAction}
              />
            ) : (
              <RenameAction
                filesViewRef={filesViewRef}
                file={file}
                onRename={onRename}
                triggerAction={triggerAction}
              />
            )}
          </div>
        ) : (
          <span className="text-truncate file-name">{file.name}</span>
        )}
      </div>

      {activeLayout === "list" && (
        <>
          <div className="modified-date">{formatDate(file.updatedAt)}</div>
          <div className="size">{file?.size > 0 ? getDataSize(file?.size) : ""}</div>
        </>
      )}

      {/* Drag Icon & Tooltip Setup */}
      {tooltipPosition && (
        <div
          style={{
            top: `${tooltipPosition.y}px`,
            left: `${tooltipPosition.x}px`,
          }}
          className="drag-move-tooltip"
        >
          Move to <span className="drop-zone-file-name">{file.name}</span>
        </div>
      )}

      <div ref={dragIconRef} className="drag-icon">
        {file.isDirectory ? (
          <FaRegFolderOpen size={dragIconSize} />
        ) : (
          <>
            {dragIcons[file.name?.split(".").pop()?.toLowerCase()] ?? (
              <FaRegFile size={dragIconSize} />
            )}
          </>
        )}
      </div>
      {/* Drag Icon & Tooltip Setup */}
    </div>
  );
};

FileItem.propTypes = {
  index: PropTypes.number.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    isDirectory: PropTypes.bool.isRequired,
    isEditing: PropTypes.bool,
    size: PropTypes.number,
    updatedAt: PropTypes.string,
  }).isRequired,
  onCreateFolder: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  enableFilePreview: PropTypes.bool.isRequired,
  onFileOpen: PropTypes.func.isRequired,
  filesViewRef: PropTypes.object.isRequired,
  selectedFileIndexes: PropTypes.arrayOf(PropTypes.number).isRequired,
  triggerAction: PropTypes.shape({
    show: PropTypes.func.isRequired,
    actionType: PropTypes.string,
  }).isRequired,
  handleContextMenu: PropTypes.func.isRequired,
  setLastSelectedFile: PropTypes.func.isRequired,
  draggable: PropTypes.bool.isRequired,
};

export default FileItem;
