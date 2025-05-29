/**
 * Enhanced file sorting utilities with multiple sort options
 * Provides flexible sorting for files and directories
 */

// Sort options enumeration
export const SORT_OPTIONS = {
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  SIZE_ASC: 'size_asc',
  SIZE_DESC: 'size_desc',
  DATE_ASC: 'date_asc',
  DATE_DESC: 'date_desc',
  TYPE_ASC: 'type_asc',
  TYPE_DESC: 'type_desc'
};

/**
 * Sort files by name (ascending) with improved comparison
 * @param {Array} files - Array of file objects
 * @returns {Array} Sorted array
 */
const sortByNameAsc = (files) => files.sort((a, b) => a.name.localeCompare(b.name, undefined, { 
  numeric: true, 
  sensitivity: 'base' 
}));

/**
 * Sort files by name (descending)
 * @param {Array} files - Array of file objects
 * @returns {Array} Sorted array
 */
const sortByNameDesc = (files) => files.sort((a, b) => b.name.localeCompare(a.name, undefined, { 
  numeric: true, 
  sensitivity: 'base' 
}));

/**
 * Sort files by size (ascending)
 * @param {Array} files - Array of file objects
 * @returns {Array} Sorted array
 */
const sortBySizeAsc = (files) => files.sort((a, b) => (a.size || 0) - (b.size || 0));

/**
 * Sort files by size (descending)
 * @param {Array} files - Array of file objects
 * @returns {Array} Sorted array
 */
const sortBySizeDesc = (files) => files.sort((a, b) => (b.size || 0) - (a.size || 0));

/**
 * Sort files by modification date (ascending)
 * @param {Array} files - Array of file objects
 * @returns {Array} Sorted array
 */
const sortByDateAsc = (files) => files.sort((a, b) => {
  const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
  const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
  return dateA - dateB;
});

/**
 * Sort files by modification date (descending)
 * @param {Array} files - Array of file objects
 * @returns {Array} Sorted array
 */
const sortByDateDesc = (files) => files.sort((a, b) => {
  const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
  const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
  return dateB - dateA;
});

/**
 * Get file extension for sorting
 * @param {string} filename - File name
 * @returns {string} File extension
 */
const getFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

/**
 * Sort files by type/extension (ascending)
 * @param {Array} files - Array of file objects
 * @returns {Array} Sorted array
 */
const sortByTypeAsc = (files) => files.sort((a, b) => {
  const extA = a.isDirectory ? '' : getFileExtension(a.name);
  const extB = b.isDirectory ? '' : getFileExtension(b.name);
  return extA.localeCompare(extB);
});

/**
 * Sort files by type/extension (descending)
 * @param {Array} files - Array of file objects
 * @returns {Array} Sorted array
 */
const sortByTypeDesc = (files) => files.sort((a, b) => {
  const extA = a.isDirectory ? '' : getFileExtension(a.name);
  const extB = b.isDirectory ? '' : getFileExtension(b.name);
  return extB.localeCompare(extA);
});

/**
 * Mapping of sort options to their corresponding functions
 */
const sortFunctions = {
  [SORT_OPTIONS.NAME_ASC]: sortByNameAsc,
  [SORT_OPTIONS.NAME_DESC]: sortByNameDesc,
  [SORT_OPTIONS.SIZE_ASC]: sortBySizeAsc,
  [SORT_OPTIONS.SIZE_DESC]: sortBySizeDesc,
  [SORT_OPTIONS.DATE_ASC]: sortByDateAsc,
  [SORT_OPTIONS.DATE_DESC]: sortByDateDesc,
  [SORT_OPTIONS.TYPE_ASC]: sortByTypeAsc,
  [SORT_OPTIONS.TYPE_DESC]: sortByTypeDesc,
};

/**
 * Enhanced sort function with multiple options
 * @param {Array} items - Array of file/folder objects
 * @param {string} sortOption - Sort option from SORT_OPTIONS
 * @param {boolean} foldersFirst - Whether to show folders first (default: true)
 * @returns {Array} Sorted array
 */
export const sortFiles = (items, sortOption = SORT_OPTIONS.NAME_ASC, foldersFirst = true) => {
  if (!Array.isArray(items)) return [];
  
  // Create a copy to avoid mutating the original array
  const itemsCopy = [...items];
  
  if (foldersFirst) {
    // Separate folders and files
    const folders = itemsCopy.filter((item) => item.isDirectory);
    const files = itemsCopy.filter((item) => !item.isDirectory);
    
    // Sort each group separately
    const sortFunction = sortFunctions[sortOption] || sortByNameAsc;
    const sortedFolders = sortFunction([...folders]);
    const sortedFiles = sortFunction([...files]);
    
    return [...sortedFolders, ...sortedFiles];
  } else {
    // Sort all items together
    const sortFunction = sortFunctions[sortOption] || sortByNameAsc;
    return sortFunction(itemsCopy);
  }
};

/**
 * Legacy function for backward compatibility - Enhanced version
 * @param {Array} items - Array of file/folder objects
 * @returns {Array} Sorted array (folders first, then files, both by name ascending)
 */
const sortFilesLegacy = (items) => {
  return sortFiles(items, SORT_OPTIONS.NAME_ASC, true);
};

export default sortFilesLegacy;
