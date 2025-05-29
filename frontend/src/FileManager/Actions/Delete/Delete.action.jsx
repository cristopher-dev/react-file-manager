import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Button from "../../../components/Button/Button";
import { useSelection } from "../../../hooks/useSelection";
import { useTranslation } from "../../../contexts/TranslationProvider";
import "./Delete.action.scss";

const DeleteAction = ({ triggerAction, onDelete }) => {
  const [deleteMsg, setDeleteMsg] = useState("");
  const { selectedFiles, setSelectedFiles } = useSelection();
  const t = useTranslation();

  useEffect(() => {
    setDeleteMsg(() => {
      if (selectedFiles.length === 1) {
        return t("deleteItemConfirm", { fileName: selectedFiles[0].name });
      } else if (selectedFiles.length > 1) {
        return t("deleteItemsConfirm", { count: selectedFiles.length });
      }
    });
  }, [t, selectedFiles]);

  const handleDeleting = () => {
    onDelete(selectedFiles);
    setSelectedFiles([]);
    triggerAction.close();
  };

  return (
    <div className="file-delete-confirm">
      <p className="file-delete-confirm-text">{deleteMsg}</p>
      <div className="file-delete-confirm-actions">
        <Button type="secondary" onClick={() => triggerAction.close()}>
          {t("cancel")}
        </Button>
        <Button type="danger" onClick={handleDeleting}>
          {t("delete")}
        </Button>
      </div>
    </div>
  );
};

DeleteAction.propTypes = {
  triggerAction: PropTypes.shape({
    close: PropTypes.func,
  }),
  onDelete: PropTypes.func,
};

export default DeleteAction;
