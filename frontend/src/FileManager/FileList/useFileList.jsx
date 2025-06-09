import { BiRename, BiSelectMultiple } from "react-icons/bi";
import { BsCopy, BsFolderPlus, BsScissors } from "react-icons/bs";
import { FaRegFile, FaRegPaste } from "react-icons/fa6";
import { FiRefreshCw } from "react-icons/fi";
import { MdOutlineDelete, MdOutlineFileDownload, MdOutlineFileUpload } from "react-icons/md";
import { PiFolderOpen } from "react-icons/pi";
import { useClipBoard } from "../../hooks/useClipBoard";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelection } from "../../hooks/useSelection";
import { useFileNavigation } from "../../contexts/FileNavigationContext";
import { duplicateNameHandler } from "../../utils/duplicateNameHandler";
import { validateApiCallback } from "../../utils/validateApiCallback";
import { useTranslation } from "../../contexts/TranslationProvider";

/**
 * Improved useFileList hook with better performance optimizations
 * Uses useCallback and useMemo to prevent unnecessary re-renders
 */
const useFileList = (onRefresh, enableFilePreview, triggerAction, permissions, onDelete) => {
  const [selectedFileIndexes, setSelectedFileIndexes] = useState([]);
  const [visible, setVisible] = useState(false);
  const [isSelectionCtx, setIsSelectionCtx] = useState(false);
  const [clickPosition, setClickPosition] = useState({ clickX: 0, clickY: 0 });
  const [lastSelectedFile, setLastSelectedFile] = useState(null);

  const { clipBoard, setClipBoard, handleCutCopy, handlePasting } = useClipBoard();
  const { selectedFiles, setSelectedFiles, handleDownload } = useSelection();
  const { currentPath, setCurrentPath, currentPathFiles, setCurrentPathFiles } =
    useFileNavigation();
  const t = useTranslation();

  // Context Menu - Optimized with useCallback to prevent unnecessary re-renders
  const handleFileOpen = useCallback(() => {
    if (lastSelectedFile?.isDirectory) {
      setCurrentPath(lastSelectedFile.path);
      setSelectedFileIndexes([]);
      setSelectedFiles([]);
    } else {
      enableFilePreview && triggerAction.show("previewFile");
    }
    setVisible(false);
  }, [lastSelectedFile, setCurrentPath, setSelectedFiles, enableFilePreview, triggerAction]);

  const handleMoveOrCopyItems = useCallback((isMoving) => {
    handleCutCopy(isMoving);
    setVisible(false);
  }, [handleCutCopy]);

  const handleFilePasting = useCallback(() => {
    handlePasting(lastSelectedFile);
    setVisible(false);
  }, [handlePasting, lastSelectedFile]);

  const handleRenaming = useCallback(() => {
    setVisible(false);
    triggerAction.show("rename");
  }, [triggerAction]);

  const handleDownloadItems = useCallback(() => {
    handleDownload();
    setVisible(false);
  }, [handleDownload]);

  const handleDelete = useCallback(async () => {
    setVisible(false);
    if (selectedFiles.length > 0 && onDelete) {
      try {
        await onDelete(selectedFiles);
      } catch (error) {
        console.error('Error deleting files:', error);
      }
    }
  }, [selectedFiles, onDelete]);

  const handleRefresh = useCallback(() => {
    setVisible(false);
    validateApiCallback(onRefresh, "onRefresh");
    setClipBoard(null);
  }, [onRefresh, setClipBoard]);

  const handleCreateNewFolder = useCallback(() => {
    triggerAction.show("createFolder");
    setVisible(false);
  }, [triggerAction]);

  const handleUpload = useCallback(() => {
    setVisible(false);
    triggerAction.show("uploadFile");
  }, [triggerAction]);

  const handleselectAllFiles = useCallback(() => {
    setSelectedFiles(currentPathFiles);
    setVisible(false);
  }, [setSelectedFiles, currentPathFiles]);

  // Memoized context menu items to prevent unnecessary recalculations
  const emptySelecCtxItems = useMemo(() => [
    {
      title: t("refresh"),
      icon: <FiRefreshCw size={18} />,
      onClick: handleRefresh,
      divider: true,
    },
    {
      title: t("newFolder"),
      icon: <BsFolderPlus size={18} />,
      onClick: handleCreateNewFolder,
      hidden: !permissions.create,
      divider: !permissions.upload,
    },
    {
      title: t("upload"),
      icon: <MdOutlineFileUpload size={18} />,
      onClick: handleUpload,
      divider: true,
      hidden: !permissions.upload,
    },
    {
      title: t("selectAll"),
      icon: <BiSelectMultiple size={18} />,
      onClick: handleselectAllFiles,
    },
  ], [t, handleRefresh, handleCreateNewFolder, 
      handleUpload, handleselectAllFiles, permissions]);

  const selecCtxItems = useMemo(() => [
    {
      title: t("open"),
      icon: lastSelectedFile?.isDirectory ? <PiFolderOpen size={20} /> : <FaRegFile size={16} />,
      onClick: handleFileOpen,
      divider: true,
    },
    {
      title: t("cut"),
      icon: <BsScissors size={19} />,
      onClick: () => handleMoveOrCopyItems(true),
      divider: !lastSelectedFile?.isDirectory && !permissions.copy,
      hidden: !permissions.move,
    },
    {
      title: t("copy"),
      icon: <BsCopy strokeWidth={0.1} size={17} />,
      onClick: () => handleMoveOrCopyItems(false),
      divider: !lastSelectedFile?.isDirectory,
      hidden: !permissions.copy,
    },
    {
      title: t("paste"),
      icon: <FaRegPaste size={18} />,
      onClick: handleFilePasting,
      className: `${clipBoard ? "" : "disable-paste"}`,
      hidden: !lastSelectedFile?.isDirectory || (!permissions.move && !permissions.copy),
      divider: true,
    },
    {
      title: t("rename"),
      icon: <BiRename size={19} />,
      onClick: handleRenaming,
      hidden: selectedFiles.length > 1 || !permissions.rename,
    },
    {
      title: t("download"),
      icon: <MdOutlineFileDownload size={18} />,
      onClick: handleDownloadItems,
      hidden: !permissions.download,
    },
    {
      title: t("delete"),
      icon: <MdOutlineDelete size={19} />,
      onClick: handleDelete,
      hidden: !permissions.delete,
    },
  ], [t, lastSelectedFile, handleFileOpen, handleMoveOrCopyItems, handleFilePasting,
      handleRenaming, handleDownloadItems, handleDelete, clipBoard, selectedFiles.length, permissions]);
  //

  // Optimized file management functions
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

  const unselectFiles = useCallback(() => {
    setSelectedFileIndexes([]);
    setSelectedFiles((prev) => (prev.length > 0 ? [] : prev));
  }, [setSelectedFiles]);

  const handleContextMenu = useCallback((e, isSelection = false) => {
    e.preventDefault();
    setClickPosition({ clickX: e.clientX, clickY: e.clientY });
    setIsSelectionCtx(isSelection);
    !isSelection && unselectFiles();
    setVisible(true);
  }, [unselectFiles]);

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

  useEffect(() => {
    setSelectedFileIndexes([]);
    setSelectedFiles([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  useEffect(() => {
    const newIndexes = selectedFiles.length > 0 
      ? selectedFiles.map((selectedFile) => {
          return currentPathFiles.findIndex((f) => f.path === selectedFile.path && f._id === selectedFile._id);
        }).filter(index => index !== -1) // Filtrar índices inválidos (archivos eliminados)
      : [];
    
    // Limpiar archivos seleccionados que ya no existen
    if (selectedFiles.length > 0 && newIndexes.length < selectedFiles.length) {
      const validSelectedFiles = selectedFiles.filter((selectedFile) => 
        currentPathFiles.some(f => f.path === selectedFile.path && f._id === selectedFile._id)
      );
      setSelectedFiles(validSelectedFiles);
    }
    
    // Only update if the indexes have actually changed
    setSelectedFileIndexes((prevIndexes) => {
      if (prevIndexes.length !== newIndexes.length || 
          !prevIndexes.every((index, i) => index === newIndexes[i])) {
        return newIndexes;
      }
      return prevIndexes;
    });
  }, [selectedFiles, currentPathFiles, setSelectedFiles]);

  return {
    emptySelecCtxItems,
    selecCtxItems,
    handleContextMenu,
    unselectFiles,
    visible,
    setVisible,
    setLastSelectedFile,
    selectedFileIndexes,
    clickPosition,
    isSelectionCtx,
  };
};

export default useFileList;
