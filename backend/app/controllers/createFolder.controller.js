const FileSystem = require("../models/FileSystem.model");
const ApiResponse = require("../utils/ApiResponse");
const logger = require("../config/logger.config");
const fs = require("fs");
const path = require("path");

const createFolder = async (req, res) => {
  // #swagger.summary = 'Creates a new folder.'
  /*  #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {$ref: '#/definitions/CreateFolder'}
      }
  */
  try {
    const { name, parentId } = req.body;

    // Check if folder with same name exists in the same parent
    const existingFolder = await FileSystem.findOne({
      name,
      parentId: parentId || null,
      isDirectory: true
    });

    if (existingFolder) {
      return ApiResponse.conflict(res, 'Folder with this name already exists in this location');
    }

    // Path calculation
    let folderPath = "";
    if (parentId) {
      const parentFolder = await FileSystem.findById(parentId);
      if (!parentFolder || !parentFolder.isDirectory) {
        return ApiResponse.badRequest(res, "Invalid parentId - parent must be a directory");
      }
      folderPath = `${parentFolder.path}/${name}`;
    } else {
      folderPath = `/${name}`; // Root Folder
    }

    // Physical folder creation using fs
    const fullFolderPath = path.join(__dirname, "../../public/uploads", folderPath);
    
    try {
      await fs.promises.mkdir(fullFolderPath, { recursive: true });
    } catch (fsError) {
      logger.error('Failed to create physical folder:', {
        error: fsError.message,
        path: fullFolderPath
      });
      return ApiResponse.error(res, 'Failed to create folder on filesystem', 500);
    }

    const newFolder = new FileSystem({
      name,
      isDirectory: true,
      path: folderPath,
      parentId: parentId || null,
    });

    await newFolder.save();

    logger.info('Folder created successfully:', {
      folderId: newFolder._id,
      name,
      path: folderPath,
      parentId
    });

    /* #swagger.responses[201] = {
      schema: { $ref: '#/definitions/Folder' },
      } */
    return ApiResponse.created(res, newFolder, 'Folder created successfully');
  } catch (error) {
    logger.error('Error creating folder:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    if (error.name === 'ValidationError') {
      return ApiResponse.badRequest(res, 'Validation error', error.errors);
    }
    
    return ApiResponse.error(res, 'Failed to create folder', 500);
  }
};

module.exports = createFolder;
