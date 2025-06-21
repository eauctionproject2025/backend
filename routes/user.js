const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser } = require("../controllers/userController");
const { protect, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.get('/', getAllUsers);

// Get user info by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email image role address description');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('User fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Update user profile
router.put('/:id', protect, updateUser);

// Block or unblock a user
router.patch('/block/:id', protect, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { block } = req.body; // true or false

    const user = await User.findByIdAndUpdate(
      userId,
      { blocked: block },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: `User ${block ? 'blocked' : 'unblocked'}`, user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;