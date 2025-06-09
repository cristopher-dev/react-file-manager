import { useRef } from "react";
import PropTypes from "prop-types";
import FileItem from "./FileItem";
import EmptyState from "../../components/EmptyState";
import { useFileNavigation } from "../../contexts/FileNavigationContext";
import { useLayout } from "../../contexts/LayoutContext";
import ContextMenu from "../../components/ContextMenu/ContextMenu";
import { useDetectOutsideClick } from "../../hooks/useDetectOutsideClick";
import useFileList from "./useFileList";
import FilesHeader from "./FilesHeader";
import { useTranslation } from "../../contexts/TranslationProvider";
import "./FileList.scss";

const FileList = ({
  onCreateFolder,
  onRename,
  onFileOpen,
  onRefresh,
  onDelete,
  enableFilePreview,
  triggerAction,
  permissions,
}) => {
  const { currentPathFiles } = useFileNavigation();
  const filesViewRef = useRef(null);
  const { activeLayout } = useLayout();
  const t = useTranslation();

  const {
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
  } = useFileList(onRefresh, enableFilePreview, triggerAction, permissions, onDelete);

  const contextMenuRef = useDetectOutsideClick(() => setVisible(false));

  return (
    <div
      ref={filesViewRef}
      className={`files ${activeLayout}`}
      onContextMenu={handleContextMenu}
      onClick={unselectFiles}
    >
      {activeLayout === "list" && <FilesHeader unselectFiles={unselectFiles} />}

      {currentPathFiles?.length > 0 ? (
        <>
          {currentPathFiles.map((file, index) => (
            <FileItem
              key={index}
              index={index}
              file={file}
              onCreateFolder={onCreateFolder}
              onRename={onRename}
              onFileOpen={onFileOpen}
              enableFilePreview={enableFilePreview}
              triggerAction={triggerAction}
              filesViewRef={filesViewRef}
              selectedFileIndexes={selectedFileIndexes}
              handleContextMenu={handleContextMenu}
              setVisible={setVisible}
              setLastSelectedFile={setLastSelectedFile}
              draggable={permissions.move}
            />
          ))}
        </>
      ) : (
        <EmptyState 
          type="folder"
          actions={
            <div className="empty-state-actions-wrapper">
              {permissions.create && (
                <button 
                  className="btn btn-primary"
                  onClick={() => triggerAction.show('createFolder')}
                >
                  {t('newFolder')}
                </button>
              )}
              {permissions.upload && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => triggerAction.show('uploadFile')}
                >
                  {t('upload')}
                </button>
              )}
            </div>
          }
        />
      )}

      <ContextMenu
        filesViewRef={filesViewRef}
        contextMenuRef={contextMenuRef.ref}
        menuItems={isSelectionCtx ? selecCtxItems : emptySelecCtxItems}
        visible={visible}
        setVisible={setVisible}
        clickPosition={clickPosition}
      />
    </div>
  );
};

FileList.displayName = "FileList";

FileList.propTypes = {
  onCreateFolder: PropTypes.func,
  onRename: PropTypes.func,
  onFileOpen: PropTypes.func,
  onRefresh: PropTypes.func,
  onDelete: PropTypes.func,
  enableFilePreview: PropTypes.bool,
  triggerAction: PropTypes.object,
  permissions: PropTypes.object,
};

export default FileList;
