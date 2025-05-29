const router = require("express").Router();
const upload = require("../middlewares/multer.middleware");
const validate = require("../middlewares/validation.middleware");
const { uploadLimiter, createLimiter } = require("../middlewares/rateLimiter.middleware");
const { 
  createFolderSchema, 
  renameItemSchema, 
  moveItemSchema, 
  deleteItemSchema 
} = require("../validators/fileSystem.validator");

const createFolderController = require("../controllers/createFolder.controller");
const uploadFileController = require("../controllers/uploadFile.controller");
const getItemsController = require("../controllers/getItems.controller");
const copyItemController = require("../controllers/copyItem.controller");
const moveItemController = require("../controllers/moveItem.controller");
const renameItemController = require("../controllers/renameItem.controller");
const deleteItemController = require("../controllers/deleteItem.controller");
const downloadFileController = require("../controllers/downloadFile.controller");

// Apply validation middleware to routes
router.post("/folder", createLimiter, validate(createFolderSchema), createFolderController);
router.post("/upload", uploadLimiter, upload.single("file"), uploadFileController);
router.post("/copy", copyItemController);
router.get("/", getItemsController);
router.get("/download", downloadFileController);
router.put("/move", validate(moveItemSchema), moveItemController);
router.patch("/rename", validate(renameItemSchema), renameItemController);
router.delete("/", validate(deleteItemSchema), deleteItemController);

module.exports = router;
