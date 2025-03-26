//this is for storing the images

const multer = require("multer");

const  storage = multer.diskStorage({
    destination: (req, file, cd) => {
        cd(null, "uploads/");  // store images in "uplaods/" folder.
    },
    filename: (req, file, cd) =>{
        cd(null, Date.now() + "-" + file.originalname); // unique file name
    }
});

const upload = multer({storage});

module.exports = upload;