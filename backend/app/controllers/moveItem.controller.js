const mongoose = require("mongoose");
const ApiResponse = require("../utils/ApiResponse");
const logger = require("../config/logger.config");
const FileSystemService = require("../services/FileSystemService");

const moveItem = async (req, res) => {
  // #swagger.summary = 'Moves file/folder(s) to the destination folder.'
  /*  #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: "#/definitions/CopyItems" },
        description: 'An array of item IDs to move and the destination folder ID.'
      } */
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

    // Move items using the service
    const moveResults = [];
    for (const sourceId of validIds) {
      try {
        const movedItem = await FileSystemService.moveItem(sourceId, destinationId || null);
        moveResults.push({
          id: sourceId,
          name: movedItem.name,
          oldPath: movedItem.path.replace(`/${movedItem.name}`, ''),
          newPath: movedItem.path,
          moved: true
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

    logger.info('Items moved successfully', { 
      movedCount: moveResults.length,
      destinationId,
      items: moveResults.map(r => ({ id: r.id, name: r.name, newPath: r.newPath }))
    });

    return ApiResponse.success(res, moveResults, 'Items moved successfully');
  } catch (error) {
    logger.error('Error moving items:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    return ApiResponse.error(res, 'Failed to move items', 500);
  }
};

module.exports = moveItem;
