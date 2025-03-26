const express = require("express");
const {body, validationResult } = require("express-validator");
const upload = require("../middleware/upload")
const authMiddleware = require("../middleware/authMiddleware")
const {registerUser, loginUser, } = require("../controllers/authController") 

const router = express.Router();

//user Registration handling
router.post("/register", upload.single("image"),[
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("nid").isLength({ min:10, max:10 }).withMessage("NID number must 10 digit"),
    body("password").isLength({min:6}).withMessage("Password must be 6+ digit"),
], registerUser); //registerUser is a controller function

//user login handling
router.post("/login", [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
    body("role").notEmpty().withMessage("role must be selected"),
  ], loginUser); //loginUser is a controller function
  
//user profile 
// router.get("/profile", authMiddleware, getUserProfile)

module.exports = router;