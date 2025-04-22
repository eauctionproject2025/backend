const express = require('express');
const multer = require('multer');
const { createAuction, getAllAuctions} = require('../controllers/auctionController');
const { protect, restrictTo, authMiddleware } = require('../middleware/authMiddleware');
const auctionController = require('../controllers/auctionController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/auctions', /** protect, upload.single('image'), **/ (req, res) => {
    res.send("Auction POST hit");
  });
  
module.exports = router;