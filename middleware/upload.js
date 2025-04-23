//this is for storing the images

const multer = require("multer");

const storage = multer.memoryStorage(); //  In-memory instead of filesystem

const upload = multer({ storage });

module.exports = upload;
