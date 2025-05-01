const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

// userregistration function
const registerUser = async(req, res) =>{
    const errors = validationResult(req); //checking validation
    if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    const {name, email, password, nid, role, username } = req.body;

    //store image in image variable
    const image = req.file ? req.file.filename : ""; 

    try{
        let user = await User.findOne({ email });    //checking is this email already exist or not
        if(user) return res.status(400).json({ msg: "Email alrady exist"})

        user = await User.findOne({nid});        //checking is this NID already exist or not
        if(user) return res.status(400).json({msg:"NID alrady exist"});

        // to check all fields are filled
        if(!name || !email || !password || !nid || !role) return res.status(400).json({msg: "All fields are required"});
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // creating new user
        user = new User ({name, email, password:hashedPassword, nid, image, role, username});
        await user.save();
        res.status(201).json({msg : "User Register successfully", user});
    } catch (error) {
        res.status(500).json({msg: `Server error while registering user ${error}`});
    }
}

// User login 
const loginUser =  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() }); 
  
    const { email, password, role } = req.body; //taking email and password from user
  
    try {
      const user = await User.findOne({ email }); // finding the email
      if (!user) return res.status(400).json({ msg: "Invalid credentials, no user" });
  
      const isMatch = await bcrypt.compare(password, user.password); //matching password
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
      
      const isRoleMatch = user.role === role; 
      if (!isRoleMatch) return res.status(400).json({ msg: "Invalid credentials" });
      
      //creating token
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
      
      //sending token to cookie and response body
      res.cookie("next-auth.session-token", token, { httpOnly: true, secure: true, sameSite: "strict"})
         .json({ 
            message: "Login successful", 
            user: { id: user._id, name: user.name, email: user.email, nid: user.nid, image: user.image, role: user.role },
            accessToken: token,
        });
    } catch (error) {
      res.status(500).json({ msg: "Server error" });
    }
  }

module.exports = {registerUser, loginUser};
