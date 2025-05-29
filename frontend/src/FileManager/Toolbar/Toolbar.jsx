import { useState } from 'react';
import PropTypes from 'prop-types';
import { BsCopy, BsFolderPlus, BsGridFill, BsScissors } from 'react-icons/bs';
import { FiRefreshCw } from 'react-icons/fi';
import {
  MdClear,
  MdOutlineDelete,
  MdOutlineFileDownload,
  MdOutlineFileUpload,
} from 'react-icons/md';
import { BiRename } from 'react-icons/bi';
import { FaListUl, FaRegPaste } from 'react-icons/fa6';
import LayoutToggler from './LayoutToggler';
import { useFileNavigation } from '../../contexts/FileNavigationContext';
import { useSelection } from '../../hooks/useSelection';
import { useClipBoard } from '../../hooks/useClipBoard';
import { useLayout } from '../../contexts/LayoutContext';
import { validateApiCallback } from '../../utils/validateApiCallback';
import { useTranslation } from '../../contexts/TranslationProvider';
import './Toolbar.scss';

const Toolbar = ({ onLayoutChange, onRefresh, onDelete, triggerAction, permissions }) => {
  const [showToggleViewMenu, setShowToggleViewMenu] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const { currentFolder } = useFileNavigation();
  const { selectedFiles, setSelectedFiles, handleDownload } = useSelection();
  const { clipBoard, setClipBoard, handleCutCopy, handlePasting } = useClipBoard();
  const { activeLayout } = useLayout();
  const t = useTranslation();

  // Toolbar Items
  const newButtonItems = [
    {
      icon: <BsFolderPlus size={17} strokeWidth={0.3} />,
      text: t('newFolder'),
      permission: permissions.create,
      onClick: () => triggerAction.show('createFolder'),
    },
    {
      icon: <MdOutlineFileUpload size={18} />,
      text: t('upload'),
      permission: permissions.upload,
      onClick: () => triggerAction.show('uploadFile'),
    },
  ];

  const toolbarLeftItems = [
    {
      icon: <FaRegPaste size={18} />,
      text: t('paste'),
      permission: !!clipBoard,
      onClick: handleFilePasting,
    },
  ];

  const toolbarRightItems = [
    {
      icon: activeLayout === 'grid' ? <BsGridFill size={16} /> : <FaListUl size={16} />,
      title: t('changeView'),
      onClick: () => setShowToggleViewMenu((prev) => !prev),
    },
    {
      icon: <FiRefreshCw size={16} />,
      title: t('refresh'),
      onClick: () => {
        validateApiCallback(onRefresh, 'onRefresh');
        setClipBoard(null);
      },
    },
  ];

  function handleFilePasting() {
    handlePasting(currentFolder);
  }

  const handleDownloadItems = () => {
    handleDownload();
    setSelectedFiles([]);
  };

  // Selected File/Folder Actions
  if (selectedFiles.length > 0) {
    return (
      <div className='toolbar file-selected'>
        <div className='file-action-container'>
          <div>
            {permissions.move && (
              <button className='item-action file-action' onClick={() => handleCutCopy(true)}>
                <BsScissors size={18} />
                <span>{t('cut')}</span>
              </button>
            )}
            {permissions.copy && (
              <button className='item-action file-action' onClick={() => handleCutCopy(false)}>
                <BsCopy strokeWidth={0.1} size={17} />
                <span>{t('copy')}</span>
              </button>
            )}
            {clipBoard?.files?.length > 0 && (
              <button
                className='item-action file-action'
                onClick={handleFilePasting}
                // disabled={!clipBoard}
              >
                <FaRegPaste size={18} />
                <span>{t('paste')}</span>
              </button>
            )}
            {selectedFiles.length === 1 && permissions.rename && (
              <button
                className='item-action file-action'
                onClick={() => triggerAction.show('rename')}
              >
                <BiRename size={19} />
                <span>{t('rename')}</span>
              </button>
            )}
            {permissions.download && (
              <button className='item-action file-action' onClick={handleDownloadItems}>
                <MdOutlineFileDownload size={19} />
                <span>{t('download')}</span>
              </button>
            )}
            {permissions.delete && (
              <button
                className='item-action file-action'
                onClick={async () => {
                  try {
                    await onDelete(selectedFiles);
                    // La selección se limpiará automáticamente cuando se actualice la lista de archivos
                  } catch (error) {
                    console.error('Error deleting files:', error);
                  }
                }}
              >
                <MdOutlineDelete size={19} />
                <span>{t('delete')}</span>
              </button>
            )}
          </div>
          <button
            className='item-action file-action'
            title={t('clearSelection')}
            onClick={() => setSelectedFiles([])}
          >
            <span>
              {selectedFiles.length}{' '}
              {t(selectedFiles.length > 1 ? 'itemsSelected' : 'itemSelected')}
            </span>
            <MdClear size={18} />
          </button>
        </div>
      </div>
    );
  }
  //

  return (
    <div className='toolbar'>
      <div className='fm-toolbar'>
        <div>
          {/* Google Drive style "New" button */}
          {(permissions.create || permissions.upload) && (
            <div className='new-button-container' style={{ position: 'relative' }}>
              <button
                className='file-action new-button'
                onClick={() => setShowNewMenu(!showNewMenu)}
              >
                <span>+</span>
                <span>{t('new')}</span>
              </button>

              {showNewMenu && (
                <div className='new-menu'>
                  <ul>
                    {newButtonItems
                      .filter((item) => item.permission)
                      .map((item, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            item.onClick();
                            setShowNewMenu(false);
                          }}
                        >
                          <span>{item.icon}</span>
                          <span>{item.text}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {toolbarLeftItems
            .filter((item) => item.permission)
            .map((item, index) => (
              <button className='file-action' key={index} onClick={item.onClick}>
                {item.icon}
                <span>{item.text}</span>
              </button>
            ))}
        </div>
        <div>
          {toolbarRightItems.map((item, index) => (
            <div key={index} className='toolbar-left-items'>
              <button className='item-action icon-only' title={item.title} onClick={item.onClick}>
                {item.icon}
              </button>
              {index !== toolbarRightItems.length - 1 && <div className='item-separator'></div>}
            </div>
          ))}

          {showToggleViewMenu && (
            <LayoutToggler
              setShowToggleViewMenu={setShowToggleViewMenu}
              onLayoutChange={onLayoutChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

Toolbar.displayName = 'Toolbar';

Toolbar.propTypes = {
  onLayoutChange: PropTypes.func,
  onRefresh: PropTypes.func,
  onDelete: PropTypes.func,
  triggerAction: PropTypes.shape({
    show: PropTypes.func,
    close: PropTypes.func,
    isActive: PropTypes.bool,
    actionType: PropTypes.string,
  }),
  permissions: PropTypes.shape({
    create: PropTypes.bool,
    upload: PropTypes.bool,
    move: PropTypes.bool,
    copy: PropTypes.bool,
    rename: PropTypes.bool,
    download: PropTypes.bool,
    delete: PropTypes.bool,
  }),
};

export default Toolbar;
