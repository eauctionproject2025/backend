const express = require('express');
const router = express.Router();
const multer = require('multer');
const Category = require('../models/Category');
const { createCategory, deleteCategory }= require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage(); 
const upload = multer({ storage });

router.post('/', protect, upload.single('icon'), createCategory);
router.get('/', async (req, res) => {
  const cats = await Category.find();
  res.json(cats);
});
router.delete('/:id', protect, deleteCategory);

module.exports = router;

