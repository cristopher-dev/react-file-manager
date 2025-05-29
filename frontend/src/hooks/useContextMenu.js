import { useState, useCallback, useMemo } from "react";
import { BiRename, BiSelectMultiple } from "react-icons/bi";
import { BsCopy, BsFolderPlus, BsGrid, BsScissors } from "react-icons/bs";
import { FaListUl, FaRegFile, FaRegPaste } from "react-icons/fa6";
import { FiRefreshCw } from "react-icons/fi";
import { MdOutlineDelete, MdOutlineFileDownload, MdOutlineFileUpload } from "react-icons/md";
import { PiFolderOpen } from "react-icons/pi";
import { useClipBoard } from "./useClipBoard";
import { useSelection } from "./useSelection";
import { useLayout } from "../contexts/LayoutContext";
import { useFileNavigation } from "../contexts/FileNavigationContext";
import { validateApiCallback } from "../utils/validateApiCallback";
import { useTranslation } from "../contexts/TranslationProvider";

/**
 * Custom hook for managing context menu functionality
 * Separates context menu logic from the main file list hook
 */
export const useContextMenu = (onRefresh, enableFilePreview, triggerAction, permissions) => {
  const [visible, setVisible] = useState(false);
  const [isSelectionCtx, setIsSelectionCtx] = useState(false);
  const [clickPosition, setClickPosition] = useState({ clickX: 0, clickY: 0 });
  const [lastSelectedFile, setLastSelectedFile] = useState(null);

  const { clipBoard, setClipBoard, handleCutCopy, handlePasting } = useClipBoard();
  const { selectedFiles, setSelectedFiles, handleDownload } = useSelection();
  const { setCurrentPath, currentPathFiles } = useFileNavigation();
  const { activeLayout, setActiveLayout } = useLayout();
  const t = useTranslation();

  // Memoized handlers to prevent unnecessary re-renders
  const handleFileOpen = useCallback(() => {
    if (lastSelectedFile?.isDirectory) {
      setCurrentPath(lastSelectedFile.path);
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

  const handleDelete = useCallback(() => {
    setVisible(false);
    triggerAction.show("delete");
  }, [triggerAction]);

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

  const handleContextMenu = useCallback((e, isSelection = false) => {
    e.preventDefault();
    setClickPosition({ clickX: e.clientX, clickY: e.clientY });
    setIsSelectionCtx(isSelection);
    !isSelection && setSelectedFiles([]);
    setVisible(true);
  }, [setSelectedFiles]);

  // Memoized context menu items to prevent unnecessary recalculations
  const emptySelecCtxItems = useMemo(() => [
    {
      title: t("view"),
      icon: activeLayout === "grid" ? <BsGrid size={18} /> : <FaListUl size={18} />,
      onClick: () => {},
      children: [
        {
          title: t("grid"),
          icon: <BsGrid size={18} />,
          selected: activeLayout === "grid",
          onClick: () => {
            setActiveLayout("grid");
            setVisible(false);
          },
        },
        {
          title: t("list"),
          icon: <FaListUl size={18} />,
          selected: activeLayout === "list",
          onClick: () => {
            setActiveLayout("list");
            setVisible(false);
          },
        },
      ],
    },
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
  ], [t, activeLayout, setActiveLayout, handleRefresh, handleCreateNewFolder, 
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

  return {
    visible,
    setVisible,
    isSelectionCtx,
    clickPosition,
    lastSelectedFile,
    setLastSelectedFile,
    handleContextMenu,
    emptySelecCtxItems,
    selecCtxItems,
  };
};
