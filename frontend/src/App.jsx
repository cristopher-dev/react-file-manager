import { useEffect, useRef, useState } from 'react';
import FileManager from './FileManager/FileManager';
import { createFolderAPI } from './api/createFolderAPI';
import { renameAPI } from './api/renameAPI';
import { deleteAPI } from './api/deleteAPI';
import { copyItemAPI, moveItemAPI } from './api/fileTransferAPI';
import { getAllFilesAPI } from './api/getAllFilesAPI';
import { downloadFile } from './api/downloadFileAPI';
import './App.scss';

function App() {
  const fileUploadConfig = {
    url: import.meta.env.VITE_API_BASE_URL
      ? `${import.meta.env.VITE_API_BASE_URL}/upload`
      : 'http://localhost:3000/api/file-system/upload',
  };
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const isMountRef = useRef(false);

  // Get Files
  const getFiles = async () => {
    setIsLoading(true);
    try {
      const response = await getAllFilesAPI();
      console.log('API Response:', response); // Debug log

      // Handle new standardized API response format
      if (response && response.data && response.data.success) {
        // New format: { success: true, data: [...], message: "..." }
        const filesData = response.data.data;
        if (Array.isArray(filesData)) {
          // Filter out any files with missing required properties
          const validFiles = filesData.filter(
            (file) =>
              file &&
              typeof file.name === 'string' &&
              file.name.trim() !== '' &&
              typeof file.isDirectory === 'boolean' &&
              typeof file.path === 'string'
          );
          setFiles(validFiles);
        } else {
          console.error('Files data is not an array:', filesData);
          setFiles([]);
        }
      } else if (response && response.data && Array.isArray(response.data)) {
        // Old format: direct array
        const validFiles = response.data.filter(
          (file) =>
            file &&
            typeof file.name === 'string' &&
            file.name.trim() !== '' &&
            typeof file.isDirectory === 'boolean' &&
            typeof file.path === 'string'
        );
        setFiles(validFiles);
      } else {
        console.error('Unexpected API response format:', response);
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isMountRef.current) return;
    isMountRef.current = true;
    getFiles();
  }, []);
  //

  // Create Folder
  const handleCreateFolder = async (name, parentFolder) => {
    setIsLoading(true);
    try {
      const response = await createFolderAPI(name, parentFolder?._id);

      if (response.status === 200 || response.status === 201) {
        // Handle new standardized response format
        const newFolder = response.data.data || response.data;
        if (newFolder && newFolder.name) {
          setFiles((prev) => [...prev, newFolder]);
        } else {
          console.error('Invalid folder data received:', newFolder);
        }
      } else {
        console.error('Failed to create folder:', response);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
    setIsLoading(false);
  };
  //

  // File Upload Handlers
  const handleFileUploading = (file, parentFolder) => {
    return { parentId: parentFolder?._id };
  };

  const handleFileUploaded = (response) => {
    try {
      const uploadedFile = JSON.parse(response);
      // Handle new standardized response format
      const fileData = uploadedFile.data || uploadedFile;
      if (fileData && fileData.name) {
        setFiles((prev) => [...prev, fileData]);
      } else {
        console.error('Invalid uploaded file data:', uploadedFile);
      }
    } catch (error) {
      console.error('Error parsing upload response:', error);
    }
  };
  //

  // Rename File/Folder
  const handleRename = async (file, newName) => {
    setIsLoading(true);
    try {
      const response = await renameAPI(file._id, newName);

      if (response.status === 200) {
        // Handle new standardized response format
        const renamedItem = response.data.data || response.data;
        if (renamedItem && renamedItem.name) {
          // Update the file in the local state
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f._id === file._id ? { ...f, name: renamedItem.name, path: renamedItem.path } : f
            )
          );
        }
        await getFiles(); // Refresh the full list
      } else {
        console.error('Rename failed:', response);
      }
    } catch (error) {
      console.error('Error renaming item:', error);
    }
    setIsLoading(false);
  };
  //

  // Delete File/Folder
  const handleDelete = async (filesToDelete) => {
    setIsLoading(true);
    try {
      const idsToDelete = filesToDelete.map((file) => file._id);
      const response = await deleteAPI(idsToDelete);

      if (response.status === 200) {
        // Handle new standardized response format
        const deletionResults = response.data.data || [];
        console.log('Delete results:', deletionResults);

        // Update the local state immediately
        setFiles((prevFiles) => prevFiles.filter((file) => !idsToDelete.includes(file._id)));

        // Refresh the full list from server
        await getFiles();
      } else {
        console.error('Delete failed:', response);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error deleting files:', error);
      setIsLoading(false);
    }
  };
  //

  // Paste File/Folder
  const handlePaste = async (copiedItems, destinationFolder, operationType) => {
    setIsLoading(true);
    try {
      const copiedItemIds = copiedItems.map((item) => item._id);

      let response;
      if (operationType === 'copy') {
        response = await copyItemAPI(copiedItemIds, destinationFolder?._id);
      } else {
        response = await moveItemAPI(copiedItemIds, destinationFolder?._id);
      }

      if (response.status === 200) {
        // Handle new standardized response format
        const results = response.data.data || [];
        console.log(`${operationType} results:`, results);

        // Refresh the file list to show the changes
        await getFiles();
      } else {
        console.error(`${operationType} failed:`, response);
      }
    } catch (error) {
      console.error(`Error during ${operationType}:`, error);
    }
    setIsLoading(false);
  };
  //

  const handleLayoutChange = (layout) => {
    console.log(layout);
  };

  // Refresh Files
  const handleRefresh = () => {
    getFiles();
  };
  //

  const handleFileOpen = (file) => {
    console.log(`Opening file: ${file.name}`);
  };

  const handleError = (error) => {
    console.error(error);
  };

  const handleDownload = async (files) => {
    await downloadFile(files);
  };

  const handleCut = (files) => {
    console.log('Moving Files', files);
  };

  const handleCopy = (files) => {
    console.log('Copied Files', files);
  };

  const handleSelect = (files) => {
    console.log('Selected Files', files);
  };

  return (
    <div className='app'>
      <div className='file-manager-container'>
        <FileManager
          files={files}
          fileUploadConfig={fileUploadConfig}
          isLoading={isLoading}
          onCreateFolder={handleCreateFolder}
          onFileUploading={handleFileUploading}
          onFileUploaded={handleFileUploaded}
          onCut={handleCut}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onRename={handleRename}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onLayoutChange={handleLayoutChange}
          onRefresh={handleRefresh}
          onFileOpen={handleFileOpen}
          onSelect={handleSelect}
          onError={handleError}
          layout='grid'
          enableFilePreview
          maxFileSize={10485760}
          filePreviewPath={import.meta.env.VITE_API_FILES_BASE_URL || 'http://localhost:3000'}
          acceptedFileTypes='.txt, .png, .jpg, .jpeg, .pdf, .doc, .docx, .exe'
          height='100%'
          width='100%'
          initialPath=''
          primaryColor='#1a73e8'
          fontFamily="'Google Sans', Roboto, Arial, sans-serif"
        />
      </div>
    </div>
  );
}

export default App;
