const fs = require('fs').promises;
const path = require('path');
const FileSystem = require('../models/FileSystem.model');
const logger = require('../config/logger.config');
const { UPLOAD } = require('../config/constants');

class FileSystemService {
  
  /**
   * Create a folder both in database and filesystem
   */
  static async createFolder(name, parentId = null) {
    try {
      // Check if folder already exists
      const existingFolder = await FileSystem.findOne({
        name,
        parentId: parentId || null,
        isDirectory: true,
        isDeleted: false
      });

      if (existingFolder) {
        throw new Error('Folder already exists in this location');
      }

      // Calculate path
      let folderPath = `/${name}`;
      if (parentId) {
        const parent = await FileSystem.findById(parentId);
        if (!parent || !parent.isDirectory || parent.isDeleted) {
          throw new Error('Invalid parent directory');
        }
        folderPath = `${parent.path}/${name}`;
      }

      // Create physical folder
      const physicalPath = path.join(UPLOAD.UPLOAD_PATH, folderPath);
      await fs.mkdir(physicalPath, { recursive: true });

      // Create database record
      const folder = new FileSystem({
        name,
        isDirectory: true,
        path: folderPath,
        parentId: parentId || null
      });

      await folder.save();
      
      logger.info('Folder created', { 
        id: folder._id, 
        name, 
        path: folderPath 
      });

      return folder;
    } catch (error) {
      logger.error('Error creating folder', { 
        error: error.message, 
        name, 
        parentId 
      });
      throw error;
    }
  }

  /**
   * Get items in a directory
   */
  static async getDirectoryContents(parentId = null) {
    try {
      const items = await FileSystem.find({
        parentId: parentId || null,
        isDeleted: false
      }).sort({ isDirectory: -1, name: 1 });

      return items;
    } catch (error) {
      logger.error('Error getting directory contents', { 
        error: error.message, 
        parentId 
      });
      throw error;
    }
  }

  /**
   * Delete an item (soft delete)
   */
  static async deleteItem(itemId) {
    try {
      const item = await FileSystem.findById(itemId);
      
      if (!item || item.isDeleted) {
        throw new Error('Item not found');
      }

      // Soft delete the item
      await item.softDelete();

      // Remove physical file/folder
      const physicalPath = path.join(UPLOAD.UPLOAD_PATH, item.path);
      
      try {
        const stats = await fs.stat(physicalPath);
        if (stats.isDirectory()) {
          await fs.rmdir(physicalPath, { recursive: true });
        } else {
          await fs.unlink(physicalPath);
        }
      } catch (fsError) {
        logger.warn('Physical file/folder not found during deletion', {
          path: physicalPath,
          error: fsError.message
        });
      }

      logger.info('Item deleted', { 
        id: itemId, 
        name: item.name, 
        path: item.path 
      });

      return item;
    } catch (error) {
      logger.error('Error deleting item', { 
        error: error.message, 
        itemId 
      });
      throw error;
    }
  }

  /**
   * Rename an item
   */
  static async renameItem(itemId, newName) {
    try {
      const item = await FileSystem.findById(itemId);
      
      if (!item || item.isDeleted) {
        throw new Error('Item not found');
      }

      // Check if new name already exists in same directory
      const existingItem = await FileSystem.findOne({
        name: newName,
        parentId: item.parentId,
        isDeleted: false,
        _id: { $ne: itemId }
      });

      if (existingItem) {
        throw new Error('An item with this name already exists');
      }

      const oldPath = item.path;
      const newPath = oldPath.replace(/\/[^\/]+$/, `/${newName}`);

      // Rename physical file/folder
      const oldPhysicalPath = path.join(UPLOAD.UPLOAD_PATH, oldPath);
      const newPhysicalPath = path.join(UPLOAD.UPLOAD_PATH, newPath);

      await fs.rename(oldPhysicalPath, newPhysicalPath);

      // Update database
      item.name = newName;
      item.path = newPath;
      await item.save();

      // Update children paths if it's a directory
      if (item.isDirectory) {
        const childItems = await FileSystem.find({ 
          path: new RegExp(`^${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`)
        });
        
        for (const child of childItems) {
          const updatedChildPath = child.path.replace(oldPath, newPath);
          await FileSystem.updateOne(
            { _id: child._id },
            { $set: { path: updatedChildPath } }
          );
        }
      }

      logger.info('Item renamed', { 
        id: itemId, 
        oldName: oldPath, 
        newName: newPath 
      });

      return item;
    } catch (error) {
      logger.error('Error renaming item', { 
        error: error.message, 
        itemId, 
        newName 
      });
      throw error;
    }
  }

  /**
   * Move an item to a new parent directory
   */
  static async moveItem(itemId, newParentId) {
    try {
      const item = await FileSystem.findById(itemId);
      
      if (!item || item.isDeleted) {
        throw new Error('Item not found');
      }

      // Validate new parent
      let newParent = null;
      if (newParentId) {
        newParent = await FileSystem.findById(newParentId);
        if (!newParent || !newParent.isDirectory || newParent.isDeleted) {
          throw new Error('Invalid destination directory');
        }
      }

      // Check if item with same name exists in destination
      const existingItem = await FileSystem.findOne({
        name: item.name,
        parentId: newParentId || null,
        isDeleted: false,
        _id: { $ne: itemId }
      });

      if (existingItem) {
        throw new Error('An item with this name already exists in the destination');
      }

      const oldPath = item.path;
      const newPath = newParent ? `${newParent.path}/${item.name}` : `/${item.name}`;

      // Move physical file/folder
      const oldPhysicalPath = path.join(UPLOAD.UPLOAD_PATH, oldPath);
      const newPhysicalPath = path.join(UPLOAD.UPLOAD_PATH, newPath);

      await fs.rename(oldPhysicalPath, newPhysicalPath);

      // Update database
      item.parentId = newParentId || null;
      item.path = newPath;
      await item.save();

      // Update children paths if it's a directory
      if (item.isDirectory) {
        await FileSystem.updateMany(
          { path: new RegExp(`^${oldPath}/`) },
          {
            $set: {
              path: {
                $concat: [
                  newPath,
                  { $substr: ['$path', oldPath.length, -1] }
                ]
              }
            }
          }
        );
      }

      logger.info('Item moved', { 
        id: itemId, 
        oldPath, 
        newPath 
      });

      return item;
    } catch (error) {
      logger.error('Error moving item', { 
        error: error.message, 
        itemId, 
        newParentId 
      });
      throw error;
    }
  }

  /**
   * Copy an item to a new parent directory
   */
  static async copyItem(itemId, newParentId) {
    try {
      const item = await FileSystem.findById(itemId);
      
      if (!item || item.isDeleted) {
        throw new Error('Item not found');
      }

      // Validate new parent
      let newParent = null;
      if (newParentId) {
        newParent = await FileSystem.findById(newParentId);
        if (!newParent || !newParent.isDirectory || newParent.isDeleted) {
          throw new Error('Invalid destination directory');
        }
      }

      // Check if item with same name exists in destination
      const existingItem = await FileSystem.findOne({
        name: item.name,
        parentId: newParentId || null,
        isDeleted: false
      });

      if (existingItem) {
        throw new Error('An item with this name already exists in the destination');
      }

      const newPath = newParent ? `${newParent.path}/${item.name}` : `/${item.name}`;

      // Copy physical file/folder
      const oldPhysicalPath = path.join(UPLOAD.UPLOAD_PATH, item.path);
      const newPhysicalPath = path.join(UPLOAD.UPLOAD_PATH, newPath);

      await fs.cp(oldPhysicalPath, newPhysicalPath, { recursive: true });

      // Create new database record
      const copiedItem = new FileSystem({
        name: item.name,
        isDirectory: item.isDirectory,
        path: newPath,
        parentId: newParentId || null,
        size: item.size,
        mimeType: item.mimeType
      });

      await copiedItem.save();

      // Copy children recursively if it's a directory
      if (item.isDirectory) {
        const children = await FileSystem.find({ 
          parentId: itemId, 
          isDeleted: false 
        });

        for (const child of children) {
          await this.recursiveCopy(child, copiedItem);
        }
      }

      logger.info('Item copied', { 
        originalId: itemId, 
        copiedId: copiedItem._id,
        originalPath: item.path,
        newPath 
      });

      return copiedItem;
    } catch (error) {
      logger.error('Error copying item', { 
        error: error.message, 
        itemId, 
        newParentId 
      });
      throw error;
    }
  }

  /**
   * Recursively copy a file/folder with all its children
   */
  static async recursiveCopy(sourceItem, destinationParent) {
    const newPath = `${destinationParent.path}/${sourceItem.name}`;
    
    const copiedItem = new FileSystem({
      name: sourceItem.name,
      isDirectory: sourceItem.isDirectory,
      path: newPath,
      parentId: destinationParent._id,
      size: sourceItem.size,
      mimeType: sourceItem.mimeType
    });

    await copiedItem.save();

    if (sourceItem.isDirectory) {
      const children = await FileSystem.find({ 
        parentId: sourceItem._id, 
        isDeleted: false 
      });

      for (const child of children) {
        await this.recursiveCopy(child, copiedItem);
      }
    }

    return copiedItem;
  }
}

module.exports = FileSystemService;
