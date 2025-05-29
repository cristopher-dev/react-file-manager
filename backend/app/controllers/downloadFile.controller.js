const FileSystem = require("../models/FileSystem.model");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const archiver = require("archiver");
const ApiResponse = require("../utils/ApiResponse");
const logger = require("../config/logger.config");

const downloadFile = async (req, res) => {
  // Todo: Update download request query swagger docs.
  // #swagger.summary = 'Downloads file/folder(s).'
  /*  #swagger.parameters['files'] = {
          in: 'query',
          type: 'string',
          required: 'true',
          description: 'File ID or array of file IDs to download'
      }
      #swagger.responses[200] = {description:'File Downloaded Successfully'}
      #swagger.responses[400]
      #swagger.responses[404]
      #swagger.responses[500]
  */
  try {
    let files = req.query.files;
    const isSingleFile = mongoose.Types.ObjectId.isValid(files);
    const isMultipleFiles = Array.isArray(files);

    if (!files || (!isSingleFile && !isMultipleFiles)) {
      return ApiResponse.badRequest(res, 'Invalid request, expected a file ID or an array of file IDs');
    }

    logger.info('Download request received', {
      files: files,
      isSingleFile,
      isMultipleFiles,
      userAgent: req.get('User-Agent')
    });

    if (isSingleFile) {
      const file = await FileSystem.findOne({ _id: files, isDeleted: false });
      
      if (!file) {
        return ApiResponse.notFound(res, 'File not found');
      }

      if (file.isDirectory) {
        files = [files];
      } else {
        const filePath = path.join(__dirname, "../../public/uploads", file.path);
        
        if (fs.existsSync(filePath)) {
          logger.info('Single file download', { 
            fileId: file._id, 
            name: file.name, 
            size: file.size 
          });
          
          res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
          res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
          
          return res.sendFile(path.resolve(filePath));
        } else {
          logger.warn('Physical file not found', { 
            fileId: file._id, 
            path: filePath 
          });
          return ApiResponse.notFound(res, 'Physical file not found');
        }
      }
    }

    // Handle multiple files or directories - create ZIP
    const multipleFiles = await FileSystem.find({ 
      _id: { $in: files }, 
      isDeleted: false 
    });
    
    if (!multipleFiles || multipleFiles.length !== files.length) {
      const foundIds = multipleFiles.map(f => f._id.toString());
      const missingIds = files.filter(id => !foundIds.includes(id));
      return ApiResponse.notFound(res, `Files not found: ${missingIds.join(', ')}`);
    }

    logger.info('Multiple files download', { 
      fileCount: multipleFiles.length,
      files: multipleFiles.map(f => ({ id: f._id, name: f.name }))
    });

    const archive = archiver("zip", { zlib: { level: 9 } });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipName = `download-${timestamp}.zip`;

    res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);
    res.setHeader("Content-Type", "application/zip");

    archive.on("error", (err) => {
      logger.error('Archive error', { error: err.message });
      throw err;
    });

    archive.on("warning", (err) => {
      logger.warn('Archive warning', { warning: err.message });
    });

    archive.pipe(res);

    multipleFiles.forEach((file) => {
      const filePath = path.join(__dirname, "../../public/uploads", file.path);
      
      if (fs.existsSync(filePath)) {
        if (file.isDirectory) {
          archive.directory(filePath, file.name);
        } else {
          archive.file(filePath, { name: file.name });
        }
      } else {
        logger.warn('Physical file not found for archive', { 
          fileId: file._id, 
          path: filePath 
        });
      }
    });

    await archive.finalize();
    
    logger.info('Download completed', { 
      zipName,
      fileCount: multipleFiles.length
    });

  } catch (error) {
    logger.error('Error during download:', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });
    
    if (!res.headersSent) {
      return ApiResponse.error(res, 'Failed to download files', 500);
    }
  }
};

module.exports = downloadFile;
