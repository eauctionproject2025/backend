const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');

// Get bids by userId
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const auction = await Auction.find({ user: userId }).populate('auction', 'title endTime');
    const bids = auction.map(auc => auc.bids).flat();
    // Optional: format data
    const formatted = bids.map(bid => ({
      _id: bid._id,
      amount: bid.amount,
      status: bid.status,
      auctionId: bid.auction._id,
      auctionTitle: bid.auction.title,
      endTime: bid.auction.endTime
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Bid fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
