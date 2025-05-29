const FileSystem = require("../models/FileSystem.model");
const ApiResponse = require("../utils/ApiResponse");
const logger = require("../config/logger.config");

const uploadFile = async (req, res) => {
  // #swagger.summary = 'Uploads a new file.'
  /*
      #swagger.auto = false
      #swagger.consumes = ['multipart/form-data']  
      #swagger.parameters['file'] = {
          in: 'formData',
          type: 'file',
          required: 'true',
      }
      #swagger.parameters['parentId'] = {
          in: 'formData',
          type: 'string',
      }
      #swagger.responses[201] = {
      schema: { $ref: '#/definitions/ApiSuccessResponse' }
      }
      #swagger.responses[400]
      #swagger.responses[500]
  */
  try {
    const { parentId } = req.body;
    const file = req.file;

    if (!file) {
      return ApiResponse.badRequest(res, 'No file provided');
    }

    // Check if file with same name already exists
    const existingFile = await FileSystem.findOne({
      name: file.originalname,
      parentId: parentId || null,
      isDeleted: false
    });

    if (existingFile) {
      return ApiResponse.conflict(res, 'File with this name already exists in this location');
    }

    let filePath = "";
    if (parentId) {
      const parentFolder = await FileSystem.findById(parentId);
      if (!parentFolder || !parentFolder.isDirectory || parentFolder.isDeleted) {
        return ApiResponse.badRequest(res, "Invalid parent directory");
      }
      filePath = `${parentFolder.path}/${file.originalname}`;
    } else {
      filePath = `/${file.originalname}`;
    }

    const newFile = new FileSystem({
      name: file.originalname,
      isDirectory: false,
      path: filePath,
      parentId: parentId || null,
      size: file.size,
      mimeType: file.mimetype,
    });

    await newFile.save();

    logger.info('File uploaded successfully:', {
      fileId: newFile._id,
      name: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      path: filePath,
      parentId
    });

    return ApiResponse.created(res, newFile, 'File uploaded successfully');
  } catch (error) {
    logger.error('Error uploading file:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      file: req.file ? {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      } : null
    });
    
    if (error.name === 'ValidationError') {
      return ApiResponse.badRequest(res, 'Validation error', error.errors);
    }
    
    return ApiResponse.error(res, 'Failed to upload file', 500);
  }
};

module.exports = uploadFile;
