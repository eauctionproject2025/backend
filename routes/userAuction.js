const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const User = require('../models/User'); // Assuming you have a User model to fetch user roles

// Get auctions by userId (seller or bidder)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("user's id", userId)
    // Fetch the user's details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch auction history based on the user's role
    let history = [];
    if (user.role === 'seller') {
      history = await Auction.find({ seller: userId });
    } else if (user.role === 'buyer') {
      history = await Auction.find({ "bids.user": userId });
    }

    res.json({
      user: {
        name: user.name,
        role: user.role,
        image: user.image, // Assuming the User model has an `image` field
      },
      history,
    });
  } catch (err) {
    console.error('Auction fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;