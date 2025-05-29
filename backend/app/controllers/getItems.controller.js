const FileSystem = require("../models/FileSystem.model");
const ApiResponse = require("../utils/ApiResponse");
const logger = require("../config/logger.config");

const getItems = async (req, res) => {
  // #swagger.summary = 'Get all items (files & folders)'
  try {
    const { parentId = null } = req.query;
    
    // Build query to filter non-deleted items
    const query = { 
      isDeleted: false,
      parentId: parentId || null
    };

    // Get items sorted by type (directories first) then by name
    const items = await FileSystem.find(query)
      .sort({ isDirectory: -1, name: 1 })
      .lean(); // Use lean() for better performance

    // Ensure all items have required properties
    const sanitizedItems = items.map(item => ({
      _id: item._id,
      name: item.name || 'Unnamed',
      isDirectory: Boolean(item.isDirectory),
      path: item.path || '/',
      parentId: item.parentId || null,
      size: item.size || null,
      mimeType: item.mimeType || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    logger.info('Items retrieved successfully', {
      count: sanitizedItems.length,
      parentId: parentId || 'root'
    });

    /* 
    #swagger.responses[200] = {
      description: 'Successful response',
      schema: { $ref: "#/definitions/ApiSuccessResponse" }
    } 
    */
    return ApiResponse.success(res, sanitizedItems, 'Items retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving items:', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });
    
    return ApiResponse.error(res, 'Failed to retrieve items', 500);
  }
};

module.exports = getItems;
