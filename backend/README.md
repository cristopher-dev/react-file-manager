# 🖥️ React File Manager - Backend API

<!-- markdownlint-disable MD033 -->
<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.19%2B-blue.svg?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Optional-green.svg?style=for-the-badge&logo=mongodb)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>
<!-- markdownlint-enable MD033 -->

> **Robust and secure REST API for the React File Manager**

A complete backend specifically designed for the React File Manager component, providing a secure and efficient REST API for file and folder management with enterprise features like logging, validation, security, and support for bulk operations.

## 🎯 Table of Contents

- [✨ Features](#-features)
- [🚀 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🔧 Environment Variables](#-environment-variables)
- [📡 API Endpoints](#-api-endpoints)
- [📂 Project Structure](#-project-structure)
- [🛡️ Security](#️-security)
- [📝 Logging System](#-logging-system)
- [🐳 Docker](#-docker)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Features

- **📤 File Upload**: Support for single and multiple uploads with type and size validation
- **📥 File Download**: Individual and bulk download (ZIP) with memory optimization
- **🗂️ Folder Management**: Create, delete, and navigate directories recursively
- **🔒 Robust Security**: Protection against path traversal, file validation, security headers
- **📊 Advanced Logging**: Structured logging system with Winston and automatic rotation
- **⚡ High Performance**: File streaming, gzip compression, and memory optimizations
- **🌐 CORS Configured**: Cross-origin support with flexible configuration
- **✅ Complete Validation**: Input validation with Joi and centralized error handling
- **📈 Monitoring**: Performance metrics and system health
- **🔄 Bulk Operations**: Support for batch operations with concurrency control
- **🗃️ Optional Database**: Optional MongoDB integration for metadata
- **📱 REST API**: Well-documented RESTful endpoints with HTTP standards

## 🚀 Installation

### Prerequisites

- **Node.js**: version 18.0 or higher
- **npm**: version 8.0 or higher (included with Node.js)
- **MongoDB**: Optional, for storing file metadata

### Quick Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/react-file-manager.git
cd react-file-manager/backend

# Install dependencies
npm install

# Copy configuration file
cp .env.example .env

# Create uploads directory
mkdir -p uploads

# Run in development mode
npm run dev
```

### Installation with Yarn or pnpm

```bash
# With Yarn
yarn install
yarn dev

# With pnpm
pnpm install
pnpm dev
```

## ⚙️ Configuration

### Basic Configuration

1. **Copy environment variables**:

   ```bash
   cp .env.example .env
   ```

2. **Edit configuration** in `.env`:

   ```bash
   # Server configuration
   PORT=3001
   NODE_ENV=development

   # File paths
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=10485760

   # Database (optional)
   DB_CONNECTION_STRING=mongodb://localhost:27017/filemanager
   ```

3. **Start the server**:

   ```bash
   npm start
   ```

The server will be available at `http://localhost:3001`.

### Advanced Configuration

```bash
# Production configuration
NODE_ENV=production
PORT=8080
UPLOAD_PATH=/var/uploads
MAX_FILE_SIZE=52428800
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf,doc,docx,txt,zip
ENABLE_LOGGING=true
LOG_LEVEL=info
```

## 🔧 Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable                  | Description                          | Default Value                           | Required |
| ------------------------- | ------------------------------------ | --------------------------------------- | -------- |
| `PORT`                    | Server port                          | `3001`                                  | No       |
| `NODE_ENV`                | Runtime environment                  | `development`                           | No       |
| `UPLOAD_PATH`             | File upload directory                | `./uploads`                             | No       |
| `MAX_FILE_SIZE`           | Maximum file size in bytes           | `10485760` (10MB)                       | No       |
| `ALLOWED_EXTENSIONS`      | Allowed extensions (comma-separated) | `jpg,jpeg,png,gif,pdf,doc,docx,txt,zip` | No       |
| `DB_CONNECTION_STRING`    | MongoDB connection string            | -                                       | No       |
| `ENABLE_LOGGING`          | Enable logging                       | `true`                                  | No       |
| `LOG_LEVEL`               | Logging level                        | `info`                                  | No       |
| `CORS_ORIGIN`             | Allowed origin for CORS              | `http://localhost:3000`                 | No       |
| `JWT_SECRET`              | JWT secret (if using authentication) | -                                       | No       |
| `RATE_LIMIT_WINDOW`       | Rate limiting window in minutes      | `15`                                    | No       |
| `RATE_LIMIT_MAX_REQUESTS` | Maximum requests per window          | `100`                                   | No       |
| `ENABLE_COMPRESSION`      | Enable gzip compression              | `true`                                  | No       |
| `SESSION_SECRET`          | Session secret                       | -                                       | No       |
| `UPLOAD_TEMP_DIR`         | Temporary directory for uploads      | `./temp`                                | No       |

### Example `.env`

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# File Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf,doc,docx,txt,zip,mp4,mp3

# Database (Optional)
DB_CONNECTION_STRING=mongodb://localhost:27017/filemanager

# Logging
ENABLE_LOGGING=true
LOG_LEVEL=info

# Security
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key_here
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Performance
ENABLE_COMPRESSION=true
UPLOAD_TEMP_DIR=./temp
```

## 📡 API Endpoints

### 📤 **File Upload**

```http
POST /api/upload
Content-Type: multipart/form-data
```

**Parameters:**

- `files`: File(s) to upload (multipart)
- `path`: Destination directory path (optional)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": {
    "uploadedFiles": [
      {
        "filename": "document.pdf",
        "originalName": "my-document.pdf",
        "size": 1024000,
        "path": "/uploads/document.pdf",
        "mimetype": "application/pdf"
      }
    ]
  }
}
```

### 📥 **File Download**

```http
GET /api/download/:filename
```

**Parameters:**

- `filename`: Name of the file to download

**Response:** File stream or 404 error

### 🗂️ **List Files and Folders**

```http
GET /api/files?path={folder-path}
```

**Query Parameters:**

- `path`: Directory path (optional, default: root)
- `sort`: Sort field (`name`, `size`, `date`)
- `order`: Sort order (`asc`, `desc`)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "currentPath": "/documents",
    "files": [
      {
        "name": "file.pdf",
        "type": "file",
        "size": 1024000,
        "lastModified": "2024-01-15T10:30:00.000Z",
        "extension": "pdf",
        "mimetype": "application/pdf"
      }
    ],
    "folders": [
      {
        "name": "my-folder",
        "type": "folder",
        "lastModified": "2024-01-15T09:00:00.000Z"
      }
    ],
    "totalFiles": 1,
    "totalFolders": 1
  }
}
```

### 📁 **Create Folder**

```http
POST /api/create-folder
Content-Type: application/json
```

**Request Body:**

```json
{
  "folderName": "new-folder",
  "path": "/documents"
}
```

### 🗑️ **Delete File**

```http
DELETE /api/delete
Content-Type: application/json
```

**Request Body:**

```json
{
  "filename": "file-to-delete.pdf",
  "path": "/documents"
}
```

### 🗂️ **Delete Folder**

```http
DELETE /api/delete-folder
Content-Type: application/json
```

**Request Body:**

```json
{
  "folderName": "folder-to-delete",
  "path": "/documents"
}
```

### 📦 **Bulk Download (ZIP)**

```http
POST /api/bulk-download
Content-Type: application/json
```

**Request Body:**

```json
{
  "files": ["file1.pdf", "file2.jpg"],
  "folders": ["folder1", "folder2"],
  "path": "/documents"
}
```

**Response:** ZIP file stream

### 🗑️ **Bulk Delete**

```http
DELETE /api/bulk-delete
Content-Type: application/json
```

**Request Body:**

```json
{
  "files": ["file1.pdf", "file2.jpg"],
  "folders": ["folder1", "folder2"],
  "path": "/documents"
}
```

## 📂 Project Structure

```text
backend/
├── 📄 server.js                 # Main server file
├── 📁 middleware/              # Custom middlewares
│   ├── auth.js                 # Authentication middleware
│   ├── validation.js           # Input validation
│   └── errorHandler.js         # Centralized error handling
├── 📁 routes/                  # Route definitions
│   ├── files.js               # File management routes
│   ├── folders.js             # Folder management routes
│   └── upload.js              # Upload routes
├── 📁 controllers/             # Business logic
│   ├── fileController.js      # File controller
│   └── folderController.js    # Folder controller
├── 📁 models/                  # Data models (MongoDB)
│   ├── File.js               # File model
│   └── Folder.js             # Folder model
├── 📁 utils/                   # Utilities
│   ├── fileUtils.js          # File utilities
│   ├── validation.js         # Validation schemas
│   └── constants.js          # Project constants
├── 📁 config/                  # Configuration
│   ├── database.js           # Database configuration
│   └── logger.js             # Logging configuration
├── 📁 uploads/                 # Uploaded files directory
├── 📁 logs/                    # Log files
├── 📁 temp/                    # Temporary files
├── 📄 package.json            # Project dependencies
├── 📄 .env.example            # Environment variables template
├── 📄 .gitignore             # Git ignored files
└── 📄 README.md              # This file
```

### Directory Description

- **`middleware/`**: Contains custom middlewares for authentication, validation, and error handling
- **`routes/`**: Defines all API routes organized by functionality
- **`controllers/`**: Implements business logic separated from routes
- **`models/`**: Data models for MongoDB (optional)
- **`utils/`**: Reusable utility functions
- **`config/`**: Configuration files for database, logging, etc.
- **`uploads/`**: Directory where uploaded files are stored
- **`logs/`**: Log files generated by Winston
- **`temp/`**: Temporary directory for file processing

## 🛡️ Security

### Implemented Security Measures

#### 🔒 **Path Traversal Protection**

```javascript
// Path validation to prevent unauthorized access
const sanitizePath = (userPath) => {
  const safePath = path.normalize(userPath).replace(/^(\.\.[\/\\])+/, '');
  return path.join(UPLOAD_PATH, safePath);
};
```

#### 🛡️ **Security Headers with Helmet**

```javascript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
```

#### 📝 **File Validation**

- **File type**: Validation by extension and MIME type
- **Maximum size**: Configurable limit per file
- **Maximum quantity**: File limit per upload
- **Content**: Optional file content validation

#### 🚫 **Rate Limiting**

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // maximum 100 requests per window
  message: 'Too many requests, please try again later',
});
```

#### 🌐 **Configured CORS**

```javascript
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
```

### Security Best Practices

1. **Environment Variables**: Never hardcode secrets in code
2. **Input Validation**: Validate all input data
3. **Security Logging**: Log suspicious access attempts
4. **Updates**: Keep dependencies updated
5. **Principle of Least Privilege**: Run with minimum necessary permissions

## 📝 Logging System

### Winston Configuration

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});
```

### Log Levels

- **`error`**: Critical system errors
- **`warn`**: Warnings and suspicious situations
- **`info`**: General operation information
- **`debug`**: Detailed information for debugging

### Log Rotation

```javascript
const DailyRotateFile = require('winston-daily-rotate-file');

const transport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
});
```

## 🐳 Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads logs temp

EXPOSE 3001

USER node

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - '3001:3001'
    environment:
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      - mongodb

  mongodb:
    image: mongo:7
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

### Docker Commands

```bash
# Build image
docker build -t react-file-manager-backend .

# Run container
docker run -p 3001:3001 -v $(pwd)/uploads:/app/uploads react-file-manager-backend

# With Docker Compose
docker-compose up -d
```

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# Tests with coverage
npm run test:coverage

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e
```

### Test Structure

```text
backend/
├── 📁 tests/
│   ├── 📁 unit/           # Unit tests
│   ├── 📁 integration/    # Integration tests
│   ├── 📁 e2e/           # End-to-end tests
│   └── 📁 fixtures/      # Test data
```

### Test Example

```javascript
describe('File Upload API', () => {
  test('should upload file successfully', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('files', 'tests/fixtures/test-file.pdf')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.uploadedFiles).toHaveLength(1);
  });
});
```

## 🤝 Contributing

### Development Environment Setup

1. **Fork the repository**:

   ```bash
   git clone https://github.com/your-username/react-file-manager.git
   cd react-file-manager/backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Setup environment**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run in development mode**:

   ```bash
   npm run dev
   ```

### Code Standards

- **ESLint**: Follow rules defined in `.eslintrc.js`
- **Prettier**: Automatic code formatting
- **Husky**: Git hooks for pre-commit validation
- **Conventional Commits**: Semantic commit format

### Contribution Process

1. **Create feature branch**:

   ```bash
   git checkout -b feature/new-functionality
   ```

2. **Make changes and commits**:

   ```bash
   git add .
   git commit -m "feat: add new functionality"
   ```

3. **Run tests**:

   ```bash
   npm test
   npm run lint
   ```

4. **Push and Pull Request**:

   ```bash
   git push origin feature/new-functionality
   ```

### Types of Contributions

- 🐛 **Bug fixes**: Error corrections
- ✨ **Features**: New functionalities
- 📚 **Documentation**: Documentation improvements
- 🎨 **Style**: Style and format changes
- ♻️ **Refactoring**: Code improvements without functional changes
- ⚡ **Performance**: Performance optimizations
- 🧪 **Tests**: Add or improve tests

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

### Terms of Use

- ✅ Commercial use permitted
- ✅ Modification permitted
- ✅ Distribution permitted
- ✅ Private use permitted
- ❌ No warranty
- ❌ No author liability

---

<!-- markdownlint-disable MD033 -->
<div align="center">

**Have questions or suggestions?**

[Create Issue](https://github.com/yourusername/react-file-manager/issues) • [Discussions](https://github.com/yourusername/react-file-manager/discussions) • [Wiki](https://github.com/yourusername/react-file-manager/wiki)

</div>
<!-- markdownlint-enable MD033 -->
