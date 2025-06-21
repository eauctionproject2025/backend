// routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const { protect, isAdmin } = require('../middleware/authMiddleware'); // or wherever you defined it
const { getAllUsers } = require('../controllers/adminController');

router.get('/users', protect, isAdmin, getAllUsers);

module.exports = router;
