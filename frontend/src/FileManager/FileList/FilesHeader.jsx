import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import Checkbox from "../../components/Checkbox/Checkbox";
import { useSelection } from "../../hooks/useSelection";
import { useFileNavigation } from "../../contexts/FileNavigationContext";

const FilesHeader = ({ unselectFiles }) => {
  const [showSelectAll, setShowSelectAll] = useState(false);

  const { selectedFiles, setSelectedFiles } = useSelection();
  const { currentPathFiles } = useFileNavigation();

  const allFilesSelected = useMemo(() => {
    return currentPathFiles.length > 0 && selectedFiles.length === currentPathFiles.length;
  }, [selectedFiles, currentPathFiles]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedFiles(currentPathFiles);
      setShowSelectAll(true);
    } else {
      unselectFiles();
    }
  };

  return (
    <div
      className="files-header"
      onMouseOver={() => setShowSelectAll(true)}
      onMouseLeave={() => setShowSelectAll(false)}
    >
      <div className="file-select-all">
        {(showSelectAll || allFilesSelected) && (
          <Checkbox checked={allFilesSelected} onChange={handleSelectAll} title="Select all" disabled={currentPathFiles.length === 0} />
        )}
      </div>
      <div className="file-name">Name</div>
      <div className="file-date">Modified</div>
      <div className="file-size">Size</div>
    </div>
  );
};

FilesHeader.propTypes = {
  unselectFiles: PropTypes.func,
};

export default FilesHeader;
