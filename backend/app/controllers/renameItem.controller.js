const FileSystem = require('../models/FileSystem.model');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../config/logger.config');
const FileSystemService = require('../services/FileSystemService');

const renameItem = async (req, res) => {
  // #swagger.summary = 'Renames a file/folder.'
  /*  #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: "#/definitions/RenameItem" }
      } */
  /*  #swagger.responses[200] = {
        schema: { $ref: "#/definitions/ApiSuccessResponse" }
      }  
  */
  try {
    const { id, newName } = req.body;

    // Use the service for better error handling and consistency
    const renamedItem = await FileSystemService.renameItem(id, newName);

    return ApiResponse.success(res, renamedItem, 'Item renamed successfully');
  } catch (error) {
    logger.error('Error renaming item:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });

    if (error.message.includes('not found')) {
      return ApiResponse.notFound(res, 'Item not found');
    }

    if (error.message.includes('already exists')) {
      return ApiResponse.conflict(res, error.message);
    }

    return ApiResponse.error(res, 'Failed to rename item', 500);
  }
};

module.exports = renameItem;
