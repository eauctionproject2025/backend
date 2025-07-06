const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary'); 

const createCategory = async (req, res) => {
  try {
    const { name, link } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadedResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'categories' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const newCategory = new Category({
      name,
      link,
      icon: uploadedResponse.secure_url,
      public_id: uploadedResponse.public_id,
    });

    await newCategory.save();
    res.status(201).json(newCategory);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Optionally, you can also delete the image from Cloudinary
    await cloudinary.uploader.destroy(category.public_id);

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createCategory,
  deleteCategory,
};
