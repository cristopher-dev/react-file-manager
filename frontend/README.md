# 📂 React File Manager

![React File Manager](https://github.com/user-attachments/assets/cad4d71d-a2fd-4064-9fce-c0c3a7cb4613)

![NPM Downloads](https://img.shields.io/npm/d18m/%40cubone%2Freact-file-manager?style=for-the-badge)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/%40cubone%2Freact-file-manager?style=for-the-badge)
![NPM Version](https://img.shields.io/npm/v/%40cubone%2Freact-file-manager?style=for-the-badge&color=%23c87d32)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18%2B-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)

> **A modern and powerful file manager for React.js with complete frontend and backend support**

An open-source React.js package for easy file manager integration in applications. Provides a modern and user-friendly interface for managing files and folders, including viewing, uploading, downloading, and deletion, with complete UI and backend integration.

## 🎯 Table of Contents

- [✨ Features](#-features)
- [🚀 Installation](#-installation)
- [💻 Basic Usage](#-basic-usage)
- [📂 File Structure](#-file-structure)
- [⚙️ Props and Configuration](#️-props-and-configuration)
- [🌍 Internationalization](#-internationalization)
- [⌨️ Keyboard Shortcuts](#️-keyboard-shortcuts)
- [🛡️ Permissions](#️-permissions)
- [🎨 Customization](#-customization)
- [📋 Advanced Examples](#-advanced-examples)
- [🔧 Backend Integration](#-backend-integration)
- [❓ Frequently Asked Questions](#-frequently-asked-questions)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Features

- **🗂️ Complete File and Folder Management**: View, upload, download, delete, copy, move, create and rename files or folders seamlessly.
- **📊 Grid and List Views**: Switch between grid and list views to navigate files in your preferred layout.
- **🧭 Intuitive Navigation**: Use breadcrumb navigation and side navigation panel for quick directory traversal.
- **🛠️ Toolbar and Context Menu**: Access all common actions (upload, download, delete, copy, move, rename, etc.) through the toolbar or right-click for the same options in the context menu.
- **✅ Multiple Selection**: Select multiple files and folders at once to perform bulk actions like delete, copy, move or download.
- **⌨️ Keyboard Shortcuts**: Quickly perform file operations like copy, paste, delete and more using intuitive keyboard shortcuts.
- **🎯 Drag and Drop**: Move selected files and folders by dragging them to the desired directory, making file organization effortless.
- **🌍 Multi-language Support**: Supports 17 languages including Spanish, English, French, German, Chinese, Japanese and more.
- **🎨 Fully Customizable**: Customize colors, fonts, sizes and behaviors to match your brand.
- **📱 Responsive Design**: Works perfectly on desktop, tablet and mobile devices.
- **🔒 Permission Control**: Granular permission system to control what actions are available for different users.
- **🖼️ File Preview**: Built-in preview for images, documents and other file types with support for custom previewers.
- **📈 Progress Indicators**: Visual feedback during upload operations and other long-running tasks.
- **⚡ High Performance**: Optimized to handle large amounts of files with virtual rendering and lazy loading.

![React File Manager](https://github.com/user-attachments/assets/e68f750b-86bf-450d-b27e-fd3dedebf1bd)

## 🚀 Installation

### Prerequisites

- **React**: 18.0.0 or higher
- **Node.js**: 16.0.0 or higher
- **npm/yarn/pnpm**: Any modern package manager

### Installation with npm

```bash
npm install @cubone/react-file-manager
```

### Installation with yarn

```bash
yarn add @cubone/react-file-manager
```

### Installation with pnpm

```bash
pnpm add @cubone/react-file-manager
```

### CDN (optional)

```html
<script src="https://unpkg.com/@cubone/react-file-manager@latest/dist/react-file-manager.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@cubone/react-file-manager@latest/dist/style.css" />
```

## 💻 Basic Usage

### Basic Example

Here's a basic example of how to use the File Manager component in your React application:

```jsx
import { useState } from 'react';
import { FileManager } from '@cubone/react-file-manager';
import '@cubone/react-file-manager/dist/style.css';

function App() {
  const [files, setFiles] = useState([
    {
      name: 'Documents',
      isDirectory: true, // Folder
      path: '/Documents', // Located in root directory
      updatedAt: '2024-09-09T10:30:00Z', // Last update time
    },
    {
      name: 'Images',
      isDirectory: true,
      path: '/Images', // Also located in root directory
      updatedAt: '2024-09-09T11:00:00Z',
    },
    {
      name: 'photo.png',
      isDirectory: false, // File
      path: '/Images/photo.png', // Located inside "Images" folder
      updatedAt: '2024-09-08T16:45:00Z',
      size: 2048, // File size in bytes (example: 2 KB)
    },
  ]);

  return (
    <div style={{ height: '100vh', padding: '20px' }}>
      <h1>My File Manager</h1>
      <FileManager
        files={files}
        height='80vh'
        language='en'
        onCreateFolder={(name, parentFolder) => {
          // Logic to create folder
          console.log(`Creating folder: ${name} in ${parentFolder.path}`);
        }}
        onFileUploaded={(response) => {
          // Logic to handle uploaded file
          console.log('File uploaded:', response);
        }}
      />
    </div>
  );
}

export default App;
```

### TypeScript Configuration

```typescript
import { useState } from 'react';
import { FileManager, File } from '@cubone/react-file-manager';
import '@cubone/react-file-manager/dist/style.css';

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [files, setFiles] = useState<File[]>([
    {
      name: 'Documents',
      isDirectory: true,
      path: '/Documents',
      updatedAt: '2024-09-09T10:30:00Z',
    },
    // ... more files
  ]);

  const handleCreateFolder = (name: string, parentFolder: File): void => {
    // Your logic here
  };

  return <FileManager files={files} onCreateFolder={handleCreateFolder} language='en' />;
};

export default App;
```

## 📂 File Structure

The `files` prop accepts an array of objects, where each object represents a file or folder. You can customize the structure to meet your application's needs. Each file or folder object follows the structure detailed below:

```typescript
type File = {
  name: string; // File or folder name
  isDirectory: boolean; // true for folders, false for files
  path: string; // Full path from root
  updatedAt?: string; // Optional: Last update timestamp in ISO 8601 format
  size?: number; // Optional: File size in bytes (only applicable for files)
};
```

### Complex File Structure Example

```javascript
const filesExample = [
  // Folders at root
  {
    name: 'Documents',
    isDirectory: true,
    path: '/Documents',
    updatedAt: '2024-12-01T10:30:00Z',
  },
  {
    name: 'Projects',
    isDirectory: true,
    path: '/Projects',
    updatedAt: '2024-12-01T09:15:00Z',
  },

  // Files at root
  {
    name: 'README.md',
    isDirectory: false,
    path: '/README.md',
    updatedAt: '2024-11-30T14:20:00Z',
    size: 1024,
  },

  // Subfolders
  {
    name: 'React',
    isDirectory: true,
    path: '/Projects/React',
    updatedAt: '2024-11-28T16:45:00Z',
  },

  // Files in subfolders
  {
    name: 'App.jsx',
    isDirectory: false,
    path: '/Projects/React/App.jsx',
    updatedAt: '2024-11-28T16:45:00Z',
    size: 2048,
  },
];
```

## ⚙️ Props and Configuration

| Name                   | Type                                                                                                                              | Description                                                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `acceptedFileTypes`    | `string`                                                                                                                          | _(Optional)_ Comma-separated list of allowed file extensions for uploading specific types (e.g: `.txt, .png, .pdf`). If omitted, all types are accepted. |
| `enableFilePreview`    | `boolean`                                                                                                                         | Indicates whether to use the default file previewer. **Default:** `true`                                                                                 |
| `filePreviewPath`      | `string`                                                                                                                          | Base URL for file previews. The file path will be automatically appended.                                                                                |
| `filePreviewComponent` | `(file: File) => React.ReactNode`                                                                                                 | _(Optional)_ Callback function that provides a custom preview. Receives the selected file and must return a valid React node.                            |
| `fileUploadConfig`     | `{ url: string; method?: "POST" \| "PUT"; headers?: Record<string, string> }`                                                     | Configuration for file uploads. Includes upload URL (`url`), optional HTTP method (`method`, default `"POST"`), and optional headers.                    |
| `files`                | `Array<File>`                                                                                                                     | **Required.** Array of file and folder objects representing the current directory structure.                                                             |
| `fontFamily`           | `string`                                                                                                                          | Font family to use throughout the component. **Default:** `'Nunito Sans, sans-serif'`                                                                    |
| `height`               | `string \| number`                                                                                                                | Component height. **Default:** `600px`                                                                                                                   |
| `initialPath`          | `string`                                                                                                                          | Directory path to load initially. **Default:** `""` (root)                                                                                               |
| `isLoading`            | `boolean`                                                                                                                         | State indicating if the application is performing an operation. Shows loading state if `true`.                                                           |
| `language`             | `string`                                                                                                                          | Language code for translations. **Default:** `"en"`. Available languages: `"es"`, `"en"`, `"fr"`, `"de"`, `"zh"`, `"ja"`, `"ar"`, etc.                   |
| `layout`               | `"list" \| "grid"`                                                                                                                | Default layout style. **Default:** `"grid"`                                                                                                              |
| `maxFileSize`          | `number`                                                                                                                          | Maximum file size for upload in bytes.                                                                                                                   |
| `onCopy`               | `(files: Array<File>) => void`                                                                                                    | _(Optional)_ Callback fired when files or folders are copied.                                                                                            |
| `onCut`                | `(files: Array<File>) => void`                                                                                                    | _(Optional)_ Callback fired when files or folders are cut.                                                                                               |
| `onCreateFolder`       | `(name: string, parentFolder: File) => void`                                                                                      | **Required for functionality.** Callback fired when a new folder is created.                                                                             |
| `onDelete`             | `(files: Array<File>) => void`                                                                                                    | **Required for functionality.** Callback fired when files or folders are deleted.                                                                        |
| `onDownload`           | `(files: Array<File>) => void`                                                                                                    | **Required for functionality.** Callback fired when files or folders are downloaded.                                                                     |
| `onError`              | `(error: { type: string, message: string }, file: File) => void`                                                                  | Callback fired when there's an error in the file manager.                                                                                                |
| `onFileOpen`           | `(file: File) => void`                                                                                                            | Callback fired when a file or folder is opened.                                                                                                          |
| `onFileUploaded`       | `(response: any) => void`                                                                                                         | **Required for functionality.** Callback fired after a file is successfully uploaded.                                                                    |
| `onFileUploading`      | `(file: File, parentFolder: File) => Record<string, any>`                                                                         | Callback fired during the upload process. Can return additional data for FormData.                                                                       |
| `onLayoutChange`       | `(layout: "list" \| "grid") => void`                                                                                              | _(Optional)_ Callback fired when the file manager layout changes.                                                                                        |
| `onPaste`              | `(files: Array<File>, destinationFolder: File, operationType: "copy" \| "move") => void`                                          | **Required for functionality.** Callback fired when files are pasted to a new location.                                                                  |
| `onRefresh`            | `() => void`                                                                                                                      | **Required for functionality.** Callback fired when the file manager is refreshed.                                                                       |
| `onRename`             | `(file: File, newName: string) => void`                                                                                           | **Required for functionality.** Callback fired when a file or folder is renamed.                                                                         |
| `onSelect`             | `(files: Array<File>) => void`                                                                                                    | _(Optional)_ Callback fired when a file or folder is selected.                                                                                           |
| `permissions`          | `{ create?: boolean; upload?: boolean; move?: boolean; copy?: boolean; rename?: boolean; download?: boolean; delete?: boolean; }` | Object that controls the availability of specific actions. **Default:** all set to `true`                                                                |
| `primaryColor`         | `string`                                                                                                                          | Primary color for the component theme. **Default:** `"#6155b4"`                                                                                          |
| `width`                | `string \| number`                                                                                                                | Component width. **Default:** `"100%"`                                                                                                                   |

## 🌍 Internationalization

React File Manager includes complete support for multiple languages. Supported languages include:

| Code    | Language   | Region        |
| ------- | ---------- | ------------- |
| `ar-SA` | العربية    | Saudi Arabia  |
| `de-DE` | Deutsch    | Germany       |
| `en-US` | English    | United States |
| `es-ES` | Español    | Spain         |
| `fr-FR` | Français   | France        |
| `he-IL` | עברית      | Israel        |
| `hi-IN` | हिन्दी     | India         |
| `it-IT` | Italiano   | Italy         |
| `ja-JP` | 日本語     | Japan         |
| `ko-KR` | 한국어     | South Korea   |
| `pt-BR` | Português  | Brazil        |
| `ru-RU` | Русский    | Russia        |
| `tr-TR` | Türkçe     | Turkey        |
| `uk-UA` | Українська | Ukraine       |
| `ur-UR` | اردو       | Pakistan      |
| `vi-VN` | Tiếng Việt | Vietnam       |
| `zh-CN` | 中文       | China         |

### Language Configuration

```jsx
// Spanish
<FileManager language="es-ES" />

// English (default)
<FileManager language="en-US" />

// French
<FileManager language="fr-FR" />

// Simplified Chinese
<FileManager language="zh-CN" />
```

## ⌨️ Keyboard Shortcuts

| **Action**      | **Shortcut**       | **Description**                              |
| --------------- | ------------------ | -------------------------------------------- |
| New Folder      | `Alt + Shift + N`  | Create a new folder in the current directory |
| Upload Files    | `Ctrl + U`         | Open the file upload dialog                  |
| Cut             | `Ctrl + X`         | Cut selected files/folders                   |
| Copy            | `Ctrl + C`         | Copy selected files/folders                  |
| Paste           | `Ctrl + V`         | Paste files/folders in the current directory |
| Rename          | `F2`               | Rename the selected file/folder              |
| Download        | `Ctrl + D`         | Download selected files/folders              |
| Delete          | `Del`              | Delete selected files/folders                |
| Select All      | `Ctrl + A`         | Select all files in the current directory    |
| Multi-select    | `Ctrl + Click`     | Add/remove files from selection              |
| Range Selection | `Shift + Click`    | Select a range of files                      |
| List View       | `Ctrl + Shift + 1` | Switch to list view                          |
| Grid View       | `Ctrl + Shift + 2` | Switch to grid view                          |
| First File      | `Home`             | Jump to the first file in the list           |
| Last File       | `End`              | Jump to the last file in the list            |
| Refresh         | `F5`               | Refresh the file list                        |
| Clear Selection | `Esc`              | Clear all selection                          |

## 🛡️ Permissions

Control file management actions using the `permissions` prop (optional). Actions are set to `true` by default if not specified.

### Basic Permission Configuration

```jsx
<FileManager
  files={files}
  permissions={{
    create: false, // Disable "Create Folder"
    delete: false, // Disable "Delete"
    download: true, // Enable "Download"
    copy: true, // Enable "Copy"
    move: true, // Enable "Move"
    rename: true, // Enable "Rename"
    upload: true, // Enable "Upload"
  }}
/>
```

### Use Case Examples

#### Read Only

```jsx
permissions={{
  create: false,
  delete: false,
  upload: false,
  move: false,
  copy: false,
  rename: false,
  download: true,
}}
```

#### Basic Editor

```jsx
permissions={{
  create: true,
  delete: false,
  upload: true,
  move: false,
  copy: true,
  rename: false,
  download: true,
}}
```

#### Full Administrator

```jsx
permissions={{
  create: true,
  delete: true,
  upload: true,
  move: true,
  copy: true,
  rename: true,
  download: true,
}}
```

## 🎨 Customization

### Themes and Colors

```jsx
<FileManager
  primaryColor='#e74c3c' // Custom primary color
  fontFamily="'Roboto', sans-serif" // Custom font
  height='70vh' // Custom height
  width='100%' // Custom width
/>
```

### Custom Preview

```jsx
const CustomPreview = ({ file }) => {
  if (file.name.endsWith('.md')) {
    return (
      <div style={{ padding: '20px' }}>
        <h3>📄 Markdown File</h3>
        <p>Name: {file.name}</p>
        <p>Size: {file.size} bytes</p>
        <p>Modified: {new Date(file.updatedAt).toLocaleDateString()}</p>
      </div>
    );
  }

  if (file.name.endsWith('.json')) {
    return (
      <div style={{ padding: '20px' }}>
        <h3>🔧 JSON File</h3>
        <pre style={{ background: '#f4f4f4', padding: '10px' }}>
          {/* Here you could load and display JSON content */}
          {'{ ... }'}
        </pre>
      </div>
    );
  }

  return <div>Preview not available for this file type</div>;
};

<FileManager files={files} filePreviewComponent={CustomPreview} />;
```

## 📋 Advanced Examples

### File Manager with Complete State

```jsx
import { useState, useCallback } from 'react';
import { FileManager } from '@cubone/react-file-manager';
import '@cubone/react-file-manager/dist/style.css';

function AdvancedFileManager() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Load files from server
  const loadFiles = useCallback(async (path = '') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      setFiles(data.files);
      setCurrentPath(path);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create folder
  const handleCreateFolder = useCallback(
    async (name, parentFolder) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            parentPath: parentFolder.path,
          }),
        });

        if (response.ok) {
          await loadFiles(currentPath); // Reload files
        }
      } catch (error) {
        console.error('Error creating folder:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPath, loadFiles]
  );

  // Delete files
  const handleDelete = useCallback(
    async (filesToDelete) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/files', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            files: filesToDelete.map((f) => f.path),
          }),
        });

        if (response.ok) {
          await loadFiles(currentPath);
        }
      } catch (error) {
        console.error('Error deleting files:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPath, loadFiles]
  );

  // Rename file
  const handleRename = useCallback(
    async (file, newName) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/files/rename', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldPath: file.path,
            newName,
          }),
        });

        if (response.ok) {
          await loadFiles(currentPath);
        }
      } catch (error) {
        console.error('Error renaming file:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPath, loadFiles]
  );

  // Handle errors
  const handleError = useCallback((error, file) => {
    console.error(`Error ${error.type}:`, error.message, file);
    // Here you could show a notification to the user
  }, []);

  return (
    <div style={{ height: '100vh', padding: '20px' }}>
      <h1>Advanced File Manager</h1>
      <FileManager
        files={files}
        isLoading={isLoading}
        language='en-US'
        height='80vh'
        primaryColor='#3498db'
        fontFamily="'Inter', sans-serif"
        fileUploadConfig={{
          url: '/api/upload',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }}
        maxFileSize={10 * 1024 * 1024} // 10MB
        acceptedFileTypes='.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt'
        permissions={{
          create: true,
          upload: true,
          download: true,
          delete: true,
          copy: true,
          move: true,
          rename: true,
        }}
        onCreateFolder={handleCreateFolder}
        onDelete={handleDelete}
        onRename={handleRename}
        onError={handleError}
        onRefresh={() => loadFiles(currentPath)}
        onFileUploaded={(response) => {
          console.log('File uploaded:', response);
          loadFiles(currentPath);
        }}
      />
    </div>
  );
}

export default AdvancedFileManager;
```

### Integration with External Drag & Drop

```jsx
import { useState } from 'react';
import { FileManager } from '@cubone/react-file-manager';

function DroppableFileManager() {
  const [files, setFiles] = useState([]);

  const handleExternalDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);

    // Process external dropped files
    droppedFiles.forEach((file) => {
      const fileObj = {
        name: file.name,
        isDirectory: false,
        path: `/${file.name}`,
        size: file.size,
        updatedAt: new Date().toISOString(),
      };

      setFiles((prev) => [...prev, fileObj]);
    });
  };

  return (
    <div
      onDrop={handleExternalDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{ height: '100vh', padding: '20px' }}
    >
      <FileManager files={files} language='en-US' />
    </div>
  );
}
```

## 🔧 Backend Integration

### Node.js/Express Server Configuration

```javascript
// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
app.use(express.json());

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// API to get files
app.get('/api/files', async (req, res) => {
  try {
    const requestedPath = req.query.path || '';
    const fullPath = path.join('uploads', requestedPath);

    const entries = await fs.readdir(fullPath, { withFileTypes: true });

    const files = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(fullPath, entry.name);
        const stats = await fs.stat(entryPath);

        return {
          name: entry.name,
          isDirectory: entry.isDirectory(),
          path: path.join('/', requestedPath, entry.name).replace(/\\/g, '/'),
          updatedAt: stats.mtime.toISOString(),
          size: entry.isFile() ? stats.size : undefined,
        };
      })
    );

    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to create folders
app.post('/api/folders', async (req, res) => {
  try {
    const { name, parentPath } = req.body;
    const fullPath = path.join('uploads', parentPath, name);

    await fs.mkdir(fullPath, { recursive: true });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to upload files
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    const file = req.file;
    const parentPath = req.body.parentPath || '';

    res.json({
      name: file.originalname,
      isDirectory: false,
      path: path.join('/', parentPath, file.originalname).replace(/\\/g, '/'),
      size: file.size,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to delete files
app.delete('/api/files', async (req, res) => {
  try {
    const { files } = req.body;

    for (const filePath of files) {
      const fullPath = path.join('uploads', filePath);
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        await fs.rmdir(fullPath, { recursive: true });
      } else {
        await fs.unlink(fullPath);
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

### React Client with API Integration

```jsx
// api/fileService.js
const API_BASE = 'http://localhost:3001/api';

export const fileService = {
  async getFiles(path = '') {
    const response = await fetch(`${API_BASE}/files?path=${encodeURIComponent(path)}`);
    return response.json();
  },

  async createFolder(name, parentPath) {
    const response = await fetch(`${API_BASE}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parentPath }),
    });
    return response.json();
  },

  async deleteFiles(filePaths) {
    const response = await fetch(`${API_BASE}/files`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: filePaths }),
    });
    return response.json();
  },

  async renameFile(oldPath, newName) {
    const response = await fetch(`${API_BASE}/files/rename`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPath, newName }),
    });
    return response.json();
  },
};

// Main component with integration
import { useState, useEffect } from 'react';
import { FileManager } from '@cubone/react-file-manager';
import { fileService } from './api/fileService';

function IntegratedFileManager() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async (path = '') => {
    setIsLoading(true);
    try {
      const data = await fileService.getFiles(path);
      setFiles(data.files);
      setCurrentPath(path);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FileManager
      files={files}
      isLoading={isLoading}
      language='en-US'
      fileUploadConfig={{
        url: 'http://localhost:3001/api/upload',
        method: 'POST',
      }}
      onCreateFolder={async (name, parentFolder) => {
        await fileService.createFolder(name, parentFolder.path);
        await loadFiles(currentPath);
      }}
      onDelete={async (filesToDelete) => {
        const paths = filesToDelete.map((f) => f.path);
        await fileService.deleteFiles(paths);
        await loadFiles(currentPath);
      }}
      onRename={async (file, newName) => {
        await fileService.renameFile(file.path, newName);
        await loadFiles(currentPath);
      }}
      onRefresh={() => loadFiles(currentPath)}
      onFileUploaded={() => loadFiles(currentPath)}
    />
  );
}
```

## ❓ Frequently Asked Questions

### How do I integrate the file manager with my existing API?

You need to implement the appropriate callbacks (`onCreateFolder`, `onDelete`, `onRename`, etc.) to communicate with your API. Check the [Backend Integration](#-backend-integration) section for complete examples.

### Can I use the component without a backend?

Yes, you can use the component for display only with a static array of files. However, for full functionality (upload, delete, create folders), you'll need to implement the corresponding callbacks.

### How do I customize file icons?

The component uses default icons based on file extensions. For full customization, you can use CSS to override styles or implement your own icon logic.

### Is it compatible with mobile devices?

Yes, the component is designed to be fully responsive and works well on mobile devices, tablets, and desktop.

### How do I handle large files?

You can use the `maxFileSize` prop to limit file sizes. For very large files, consider implementing chunked uploads in your backend.

### Does it support multiple file uploads?

Yes, the component supports multiple file uploads natively. Users can select multiple files in the upload dialog.

### How do I implement authentication?

You can add authentication headers in `fileUploadConfig`:

```jsx
fileUploadConfig={{
  url: '/api/upload',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
}}
```

### Can I disable certain functionalities?

Yes, use the `permissions` prop to control which actions are available:

```jsx
permissions={{
  delete: false,    // Disable deletion
  upload: false,    // Disable upload
  create: false,    // Disable folder creation
}}
```

## 🤝 Contributing

We love receiving contributions! Here's how you can help:

### Local Development

1. **Fork the repository**

   ```bash
   git clone https://github.com/your-user/react-file-manager.git
   cd react-file-manager
   ```

2. **Install dependencies**

   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend (for testing)
   cd ../backend
   npm install
   ```

3. **Run in development mode**

   ```bash
   # Frontend
   cd frontend
   npm run dev

   # Backend (separate terminal)
   cd backend
   npm start
   ```

### Types of Contributions

- 🐛 **Bug Reports**: Create an issue with problem details
- ✨ **New Features**: Discuss first in an issue before implementing
- 📖 **Documentation**: Improvements to README, code comments, etc.
- 🌍 **Translations**: Add or improve language translations
- 🎨 **UI/UX**: User interface and user experience improvements
- ⚡ **Performance**: Code optimizations and performance improvements

### Contribution Guidelines

1. **Follow existing code conventions**
2. **Add tests** for new functionality
3. **Update documentation** if necessary
4. **Create descriptive commits** following [Conventional Commits](https://conventionalcommits.org/)
5. **Test your code** before submitting the PR

### Project Structure

```text
react-file-manager/
├── frontend/           # Main component package
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom hooks
│   │   ├── locales/    # Translation files
│   │   └── utils/      # Utilities
│   └── dist/           # Distribution build
└── backend/            # Example API for testing
    ├── app/            # Server logic
    └── public/         # Static files
```

### Reporting Issues

When reporting a bug, include:

- **Component version**
- **React version**
- **Browser and version**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots if applicable**

## 📄 License

React File Manager is licensed under the [MIT License](LICENSE).

```text
MIT License

Copyright (c) 2024 React File Manager Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

[Full MIT License text...]
```

---

**Like React File Manager?** ⭐ Give us a star on GitHub!

[GitHub](https://github.com/your-repo/react-file-manager) • [NPM](https://www.npmjs.com/package/@cubone/react-file-manager) • [Documentation](https://your-docs-site.com) • [Demo](https://your-demo-site.com)

Made with ❤️ by the community
