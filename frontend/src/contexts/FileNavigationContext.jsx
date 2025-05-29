import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useFiles } from "./FilesContext";
import sortFiles from "../utils/sortFiles";
import PropTypes from "prop-types";

const FileNavigationContext = createContext();

export const FileNavigationProvider = ({ children, initialPath }) => {
  const { files } = useFiles();
  const isMountRef = useRef(false);
  const [currentPath, setCurrentPath] = useState("");
  const [currentFolder, setCurrentFolder] = useState(null);
  const [currentPathFiles, setCurrentPathFiles] = useState([]);

  useEffect(() => {
    if (Array.isArray(files)) {
      const currPathFiles = files.filter((file) => file.path === `${currentPath}/${file.name}`);
      const sortedFiles = sortFiles(currPathFiles);
      
      setCurrentPathFiles(prev => {
        // Check if files have changed by comparing length and file IDs/paths
        if (prev.length !== sortedFiles.length) {
          return sortedFiles;
        }
        
        // Check if any file has been removed or changed
        const hasChanges = !prev.every((prevFile, index) => {
          const currentFile = sortedFiles[index];
          return currentFile && 
                 prevFile.path === currentFile.path && 
                 prevFile._id === currentFile._id;
        });
        
        if (hasChanges) {
          return sortedFiles;
        }
        
        return prev;
      });

      const newCurrentFolder = files.find((file) => file.path === currentPath) ?? null;
      setCurrentFolder(prev => {
        // Only update if the folder has actually changed
        if (prev?.path !== newCurrentFolder?.path) {
          return newCurrentFolder;
        }
        return prev;
      });
    }
  }, [files, currentPath]);

  useEffect(() => {
    if (!isMountRef.current && Array.isArray(files) && files.length > 0) {
      setCurrentPath(files.some((file) => file.path === initialPath) ? initialPath : "");
      isMountRef.current = true;
    }
  }, [initialPath, files]);

  return (
    <FileNavigationContext.Provider
      value={{
        currentPath,
        setCurrentPath,
        currentFolder,
        setCurrentFolder,
        currentPathFiles,
        setCurrentPathFiles,
      }}
    >
      {children}
    </FileNavigationContext.Provider>
  );
};

export const useFileNavigation = () => useContext(FileNavigationContext);

FileNavigationProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialPath: PropTypes.string,
};
