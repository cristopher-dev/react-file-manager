import { useEffect, useRef, useState } from 'react';
import FileManager from './FileManager/FileManager';
import { createFolderAPI } from './api/createFolderAPI';
import { renameAPI } from './api/renameAPI';
import { deleteAPI } from './api/deleteAPI';
import { copyItemAPI, moveItemAPI } from './api/fileTransferAPI';
import { getAllFilesAPI } from './api/getAllFilesAPI';
import { downloadFile } from './api/downloadFileAPI';
import useToast from './hooks/useToast';
import ToastContainer from './components/ToastContainer';
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
  const { toasts, removeToast, success, error, warning, info } = useToast();

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
          success(`Carpeta "${name}" creada exitosamente`);
        } else {
          console.error('Invalid folder data received:', newFolder);
          error('Error al procesar la respuesta del servidor');
        }
      } else {
        console.error('Failed to create folder:', response);
        error('Error al crear la carpeta');
      }
    } catch (err) {
      console.error('Error creating folder:', err);
      
      // Handle specific error cases with user-friendly messages
      if (err.response) {
        const { status, data } = err.response;
        switch (status) {
          case 409: {
            const message = data.message || 'Una carpeta con este nombre ya existe en esta ubicación';
            error(`Error: ${message}`);
            break;
          }
          case 400: {
            error('Nombre de carpeta inválido o directorio padre no válido');
            break;
          }
          case 500: {
            error('Error del servidor al crear la carpeta');
            break;
          }
          default: {
            error(data.message || 'Error desconocido al crear la carpeta');
          }
        }
      } else {
        error('Error de conexión o error inesperado');
      }
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
        success(`"${fileData.name}" subido exitosamente`);
      } else {
        console.error('Invalid uploaded file data:', uploadedFile);
        error('Error al procesar el archivo subido');
      }
    } catch (err) {
      console.error('Error parsing upload response:', err);
      error('Error al procesar la respuesta de subida');
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
          success(`"${file.name}" renombrado a "${newName}" exitosamente`);
        }
        await getFiles(); // Refresh the full list
      } else {
        console.error('Rename failed:', response);
        error('Error al renombrar el elemento');
      }
    } catch (err) {
      console.error('Error renaming item:', err);
      if (err.response?.status === 409) {
        error('Ya existe un elemento con ese nombre en esta ubicación');
      } else {
        error('Error al renombrar el elemento');
      }
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

        // Show success message
        const count = filesToDelete.length;
        if (count === 1) {
          success(`"${filesToDelete[0].name}" eliminado exitosamente`);
        } else {
          success(`${count} elementos eliminados exitosamente`);
        }

        // Refresh the full list from server
        await getFiles();
      } else {
        console.error('Delete failed:', response);
        error('Error al eliminar los elementos');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error deleting files:', err);
      error('Error al eliminar los elementos');
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

        // Show success message
        const count = copiedItems.length;
        const operation = operationType === 'copy' ? 'copiado' : 'movido';
        const destination = destinationFolder?.name || 'la ubicación seleccionada';
        
        if (count === 1) {
          success(`"${copiedItems[0].name}" ${operation} a "${destination}" exitosamente`);
        } else {
          success(`${count} elementos ${operation}s a "${destination}" exitosamente`);
        }

        // Refresh the file list to show the changes
        await getFiles();
      } else {
        console.error(`${operationType} failed:`, response);
        const operation = operationType === 'copy' ? 'copiar' : 'mover';
        error(`Error al ${operation} los elementos`);
      }
    } catch (err) {
      console.error(`Error during ${operationType}:`, err);
      const operation = operationType === 'copy' ? 'copiar' : 'mover';
      error(`Error al ${operation} los elementos`);
    }
    setIsLoading(false);
  };

  const handleLayoutChange = (layout) => {
    console.log(layout);
  };

  // Refresh Files
  const handleRefresh = () => {
    getFiles();
  };

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
      <ToastContainer
        toasts={toasts}
        onRemoveToast={removeToast}
        position="top-right"
      />
    </div>
  );
}

export default App;
