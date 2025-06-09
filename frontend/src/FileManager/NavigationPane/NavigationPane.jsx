import { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import FolderTree from "./FolderTree";
import { getParentPath } from "../../utils/getParentPath";
import { useFiles } from "../../contexts/FilesContext";
import { useTranslation } from "../../contexts/TranslationProvider";
import { useMobileNavigation } from "../../contexts/MobileNavigationContext";
import { useResponsive } from "../../hooks/useResponsive";
import "./NavigationPane.scss";

const NavigationPane = ({ onFileOpen }) => {
  const [foldersTree, setFoldersTree] = useState([]);
  const { files } = useFiles();
  const t = useTranslation();
  const { isOpen, setIsOpen } = useMobileNavigation();
  const { isMobile } = useResponsive();

  const createChildRecursive = useCallback((path, foldersStruct) => {
    if (!foldersStruct[path]) return []; // No children for this path (folder)

    return foldersStruct[path]?.map((folder) => {
      return {
        ...folder,
        subDirectories: createChildRecursive(folder.path, foldersStruct),
      };
    });
  }, []);

  const handleFolderClick = (folder) => {
    onFileOpen(folder);
    // Close mobile navigation when a folder is selected on mobile
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
  };

  const handleOverlayClick = () => {
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (Array.isArray(files)) {
      const folders = files.filter((file) => file.isDirectory);
      // Grouping folders by parent path
      const foldersStruct = Object.groupBy(folders, ({ path }) => getParentPath(path));
      setFoldersTree(() => {
        const rootPath = "";
        return createChildRecursive(rootPath, foldersStruct);
      });
    }
  }, [files, createChildRecursive]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div className="mobile-nav-overlay" onClick={handleOverlayClick} />
      )}
      
      <div className={`sb-folders-list ${isMobile ? 'mobile-nav' : ''} ${isMobile && isOpen ? 'mobile-nav-open' : ''}`}>
        {foldersTree?.length > 0 ? (
          <>
            {foldersTree?.map((folder, index) => {
              return <FolderTree key={index} folder={folder} onFileOpen={handleFolderClick} />;
            })}
          </>
        ) : (
          <div className="empty-nav-pane">{t("nothingHereYet")}</div>
        )}
      </div>
    </>
  );
};

NavigationPane.displayName = "NavigationPane";

NavigationPane.propTypes = {
  onFileOpen: PropTypes.func.isRequired,
};

export default NavigationPane;
