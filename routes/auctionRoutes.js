const express = require('express');
const router = express.Router();
const { v2: cloudinary } = require('cloudinary');
const upload = require('../middleware/upload'); //  Your memoryStorage config
const { protect } = require('../middleware/authMiddleware');
const {createAuction, getAllAuctions, deleteAuction, getAuctionById, placeBid, getAuctionsByUserId } = require('../controllers/auctionController');

//  Cloudinary config 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.get('/', getAllAuctions);
//  Your route to handle uploads
router.post('/', protect, upload.array('images', 5), createAuction);

router.get('/:id', getAuctionById);

router.post('/:id/bid', protect, placeBid);

// Add a new route to fetch auctions by userId
router.get('/user/:userId', getAuctionsByUserId);
// DELETE /api/auctions/:id

router.delete('/:id', protect, deleteAuction);


module.exports = router;
