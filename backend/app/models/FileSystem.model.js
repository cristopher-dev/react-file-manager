const mongoose = require("mongoose");

const fileSystemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [255, 'Name cannot exceed 255 characters'],
      validate: {
        validator: function(v) {
          // Validate filename characters
          return /^[^<>:"/\\|?*]+$/.test(v);
        },
        message: 'Name contains invalid characters'
      }
    },
    isDirectory: {
      type: Boolean,
      required: [true, 'isDirectory field is required'],
    },
    path: {
      type: String,
      required: [true, 'Path is required'],
      unique: true
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FileSystem",
      default: null,
      validate: {
        validator: async function(v) {
          if (!v) return true; // null is valid
          const parent = await mongoose.model('FileSystem').findById(v);
          return parent && parent.isDirectory;
        },
        message: 'Parent must be a directory'
      }
    },
    size: {
      type: Number,
      default: null,
      min: [0, 'Size cannot be negative'],
      validate: {
        validator: function(v) {
          // Size should only be set for files, not directories
          if (this.isDirectory && v !== null) return false;
          return true;
        },
        message: 'Directories should not have a size'
      }
    },
    mimeType: {
      type: String,
      default: null,
      validate: {
        validator: function(v) {
          // MimeType should only be set for files, not directories
          if (this.isDirectory && v !== null) return false;
          return true;
        },
        message: 'Directories should not have a mime type'
      }
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
fileSystemSchema.index({ parentId: 1, name: 1 });
fileSystemSchema.index({ path: 1 });
fileSystemSchema.index({ isDirectory: 1 });
fileSystemSchema.index({ isDeleted: 1 });

// Compound index to prevent duplicate names in the same directory
fileSystemSchema.index(
  { parentId: 1, name: 1, isDeleted: 1 }, 
  { unique: true }
);

// Virtual for getting children
fileSystemSchema.virtual('children', {
  ref: 'FileSystem',
  localField: '_id',
  foreignField: 'parentId',
  match: { isDeleted: false }
});

// Pre-save middleware to ensure path consistency
fileSystemSchema.pre('save', async function(next) {
  if (this.isModified('parentId') || this.isModified('name')) {
    if (this.parentId) {
      const parent = await this.constructor.findById(this.parentId);
      if (!parent) {
        return next(new Error('Parent not found'));
      }
      this.path = `${parent.path}/${this.name}`;
    } else {
      this.path = `/${this.name}`;
    }
  }
  next();
});

// Static method to find by path
fileSystemSchema.statics.findByPath = function(path) {
  return this.findOne({ path, isDeleted: false });
};

// Instance method to get full path
fileSystemSchema.methods.getFullPath = function() {
  return this.path;
};

// Instance method to soft delete
fileSystemSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  await this.save();
  
  // Also soft delete all children if this is a directory
  if (this.isDirectory) {
    await this.constructor.updateMany(
      { path: new RegExp(`^${this.path}/`) },
      { isDeleted: true }
    );
  }
};

const FileSystem = mongoose.model("FileSystem", fileSystemSchema);

module.exports = FileSystem;
