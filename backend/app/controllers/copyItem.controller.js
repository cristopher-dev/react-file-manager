const mongoose = require("mongoose");
const ApiResponse = require("../utils/ApiResponse");
const logger = require("../config/logger.config");
const FileSystemService = require("../services/FileSystemService");

const copyItem = async (req, res) => {
  // #swagger.summary = 'Copies file/folder(s) to the destination folder.'
  /*  #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: "#/definitions/CopyItems" },
        description: 'An array of item IDs to copy and the destination folder ID.'
      }
  */
  /*  #swagger.responses[200] = {
        schema: { $ref: "#/definitions/ApiSuccessResponse" }
      }  
  */
  try {
    const { sourceIds, destinationId } = req.body;

    if (!sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0) {
      return ApiResponse.badRequest(res, 'Invalid request body, expected an array of sourceIds');
    }

    const validIds = sourceIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length !== sourceIds.length) {
      return ApiResponse.badRequest(res, 'One or more of the provided sourceIds are invalid');
    }

    // Copy items using the service
    const copyResults = [];
    for (const sourceId of validIds) {
      try {
        const copiedItem = await FileSystemService.copyItem(sourceId, destinationId || null);
        copyResults.push({
          originalId: sourceId,
          copiedId: copiedItem._id,
          name: copiedItem.name,
          path: copiedItem.path,
          copied: true
        });
      } catch (error) {
        if (error.message.includes('not found')) {
          return ApiResponse.notFound(res, `Source item with id ${sourceId} not found`);
        }
        if (error.message.includes('Invalid destination')) {
          return ApiResponse.badRequest(res, 'Invalid destination directory');
        }
        if (error.message.includes('already exists')) {
          return ApiResponse.conflict(res, error.message);
        }
        throw error;
      }
    }

    logger.info('Items copied successfully', { 
      copiedCount: copyResults.length,
      destinationId,
      items: copyResults.map(r => ({ originalId: r.originalId, copiedId: r.copiedId, name: r.name }))
    });

    return ApiResponse.success(res, copyResults, 'Items copied successfully');
  } catch (error) {
    logger.error('Error copying items:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    return ApiResponse.error(res, 'Failed to copy items', 500);
  }
};

module.exports = copyItem;
