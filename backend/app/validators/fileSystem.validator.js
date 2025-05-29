const Joi = require('joi');

const createFolderSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .pattern(/^[^<>:"/\\|?*]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Folder name contains invalid characters',
      'string.min': 'Folder name cannot be empty',
      'string.max': 'Folder name is too long'
    }),
  parentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'Invalid parentId format'
    })
});

const renameItemSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid ID format'
    }),
  newName: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .pattern(/^[^<>:"/\\|?*]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Name contains invalid characters',
      'string.min': 'Name cannot be empty',
      'string.max': 'Name is too long'
    })
});

const moveItemSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid ID format'
    }),
  newParentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'Invalid parentId format'
    })
});

const deleteItemSchema = Joi.object({
  ids: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Invalid ID format'
        })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one ID is required'
    })
});

module.exports = {
  createFolderSchema,
  renameItemSchema,
  moveItemSchema,
  deleteItemSchema
};
