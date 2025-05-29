import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../components/Modal/Modal';
import DeleteAction from './Delete/Delete.action';
import UploadFileAction from './UploadFile/UploadFile.action';
import PreviewFileAction from './PreviewFile/PreviewFile.action';
import { useSelection } from '../../hooks/useSelection';
import { useShortcutHandler } from '../../hooks/useShortcutHandler';
import { useTranslation } from '../../contexts/TranslationProvider';

const Actions = ({
  fileUploadConfig,
  onFileUploading,
  onFileUploaded,
  onDelete,
  onRefresh,
  maxFileSize,
  filePreviewPath,
  filePreviewComponent,
  acceptedFileTypes,
  triggerAction,
  permissions,
}) => {
  const [activeAction, setActiveAction] = useState(null);
  const { selectedFiles } = useSelection();
  const t = useTranslation();

  // Triggers all the keyboard shortcuts based actions
  useShortcutHandler(triggerAction, onRefresh, permissions, onDelete);

  useEffect(() => {
    const actionTypes = {
      uploadFile: {
        title: t('upload'),
        component: (
          <UploadFileAction
            fileUploadConfig={fileUploadConfig}
            maxFileSize={maxFileSize}
            acceptedFileTypes={acceptedFileTypes}
            onFileUploading={onFileUploading}
            onFileUploaded={onFileUploaded}
          />
        ),
        width: '35%',
      },
      delete: {
        title: t('delete'),
        component: <DeleteAction triggerAction={triggerAction} onDelete={onDelete} />,
        width: '25%',
      },
      previewFile: {
        title: t('preview'),
        component: (
          <PreviewFileAction
            filePreviewPath={filePreviewPath}
            filePreviewComponent={filePreviewComponent}
          />
        ),
        width: '50%',
      },
    };

    if (triggerAction.isActive) {
      const actionType = triggerAction.actionType;
      if (actionType === 'previewFile') {
        actionTypes[actionType].title = selectedFiles?.name ?? t('preview');
      }
      setActiveAction(actionTypes[actionType]);
    } else {
      setActiveAction(null);
    }
  }, [triggerAction, selectedFiles?.name, t, fileUploadConfig, maxFileSize, acceptedFileTypes, onFileUploading, onFileUploaded, onDelete, filePreviewPath, filePreviewComponent]);

  if (activeAction) {
    return (
      <Modal
        heading={activeAction.title}
        show={triggerAction.isActive}
        setShow={triggerAction.close}
        dialogWidth={activeAction.width}
      >
        {activeAction?.component}
      </Modal>
    );
  }
};

Actions.propTypes = {
  fileUploadConfig: PropTypes.object,
  onFileUploading: PropTypes.func,
  onFileUploaded: PropTypes.func,
  onDelete: PropTypes.func,
  onRefresh: PropTypes.func,
  maxFileSize: PropTypes.number,
  filePreviewPath: PropTypes.string,
  filePreviewComponent: PropTypes.elementType,
  acceptedFileTypes: PropTypes.string,
  triggerAction: PropTypes.shape({
    isActive: PropTypes.bool,
    actionType: PropTypes.string,
    close: PropTypes.func,
  }),
  permissions: PropTypes.object,
};

export default Actions;
