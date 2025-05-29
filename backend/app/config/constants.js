const path = require('path');

module.exports = {
  // File upload configuration
  UPLOAD: {
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '50MB',
    ALLOWED_EXTENSIONS: [
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', // Images
      '.pdf', '.doc', '.docx', '.txt', '.rtf', // Documents
      '.xls', '.xlsx', '.csv', // Spreadsheets
      '.ppt', '.pptx', // Presentations
      '.zip', '.rar', '.7z', '.tar', '.gz', // Archives
      '.mp3', '.wav', '.ogg', '.mp4', '.avi', '.mov', // Media
      '.js', '.css', '.html', '.json', '.xml', // Web files
      '.py', '.java', '.cpp', '.c', '.cs', '.php' // Code files
    ],
    UPLOAD_PATH: path.join(__dirname, '../../public/uploads'),
    TEMP_PATH: path.join(__dirname, '../../temp')
  },

  // Database configuration
  DB: {
    MAX_POOL_SIZE: 10,
    BUFFER_MAX_ENTRIES: 0,
    USE_NEW_URL_PARSER: true,
    USE_UNIFIED_TOPOLOGY: true
  },

  // Security configuration
  SECURITY: {
    RATE_LIMIT: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100
    },
    UPLOAD_RATE_LIMIT: {
      WINDOW_MS: 5 * 60 * 1000, // 5 minutes
      MAX_REQUESTS: 10
    }
  },

  // File system limits
  LIMITS: {
    MAX_NAME_LENGTH: 255,
    MAX_PATH_DEPTH: 10,
    MAX_FILES_PER_DIRECTORY: 1000
  },

  // Response messages
  MESSAGES: {
    SUCCESS: {
      FOLDER_CREATED: 'Folder created successfully',
      FILE_UPLOADED: 'File uploaded successfully',
      ITEM_DELETED: 'Item deleted successfully',
      ITEM_RENAMED: 'Item renamed successfully',
      ITEM_MOVED: 'Item moved successfully',
      ITEM_COPIED: 'Item copied successfully'
    },
    ERROR: {
      FOLDER_EXISTS: 'Folder already exists',
      FILE_NOT_FOUND: 'File not found',
      INVALID_PARENT: 'Invalid parent directory',
      INVALID_NAME: 'Invalid name format',
      PERMISSION_DENIED: 'Permission denied',
      DISK_FULL: 'Insufficient disk space'
    }
  }
};
