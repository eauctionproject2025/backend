const cloudinary = require("../config/cloudinary");
const User = require("../models/User"); 

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email nid image role address description blocked ");
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
}

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { description, address, image } = req.body;

    const updateFields = {
      description,
      address,
    };

    // If image is base64 or file URL, upload to Cloudinary
    if (image && image.startsWith("data:")) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "user-profiles",
      });
      updateFields.image = uploadResponse.secure_url;
    } else if (image && image.startsWith("http")) {
      updateFields.image = image; // Keep direct URL (if already hosted)
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  updateUser,
  getAllUsers
};