const express = require('express');
const router = express.Router();
const { getBidsByAuctionId, getBidsByUserId } = require('../controllers/bidController');
const { placeBid } = require('../controllers/bidController');
const { protect } = require('../middleware/authMiddleware');

router.get('/auction/:auctionId', getBidsByAuctionId);
router.get('/user/:userId', getBidsByUserId);
router.post('/auction/:auctionId', protect, placeBid);

module.exports = router;
