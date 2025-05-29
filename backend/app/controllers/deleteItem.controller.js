const mongoose = require("mongoose");
const ApiResponse = require("../utils/ApiResponse");
const logger = require("../config/logger.config");
const FileSystemService = require("../services/FileSystemService");

const deleteItem = async (req, res) => {
  // #swagger.summary = 'Deletes file/folder(s).'
  /*  #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: "#/definitions/DeleteItems" },
        description: 'An array of item IDs to delete.'
      }
  */
  /*  #swagger.responses[200] = {
        schema: { $ref: "#/definitions/ApiSuccessResponse" }
      }  
  */
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return ApiResponse.badRequest(res, 'Invalid request body, expected an array of ids');
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length !== ids.length) {
      return ApiResponse.badRequest(res, 'One or more of the provided ids are invalid');
    }

    // Delete items using the service
    const deletionResults = [];
    for (const id of validIds) {
      try {
        const deletedItem = await FileSystemService.deleteItem(id);
        deletionResults.push({
          id,
          name: deletedItem.name,
          deleted: true
        });
      } catch (error) {
        if (error.message.includes('not found')) {
          return ApiResponse.notFound(res, `Item with id ${id} not found`);
        }
        throw error;
      }
    }

    logger.info('Items deleted successfully', { 
      deletedCount: deletionResults.length,
      items: deletionResults.map(r => ({ id: r.id, name: r.name }))
    });

    return ApiResponse.success(res, deletionResults, 'Items deleted successfully');
  } catch (error) {
    logger.error('Error deleting items:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    return ApiResponse.error(res, 'Failed to delete items', 500);
  }
};

module.exports = deleteItem;
