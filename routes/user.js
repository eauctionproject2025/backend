const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user info by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email image role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('User fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;