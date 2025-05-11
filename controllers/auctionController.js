const Auction = require('../models/Auction');
const cloudinary = require('../config/cloudinary');

//  GET /api/auctions — Public route
const getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find().sort({ createdAt: -1 });
    res.status(200).json(auctions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch auctions' });
  }
};

//  POST /api/auctions — Protected, only sellers
const createAuction = async (req, res) => {
  try {
    const { title, description, startingBid } = req.body;
    const seller = req.user.id;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    const newAuction = new Auction({
      title,
      description,
      startingBid,
      seller,
      imageUrl: result.secure_url,
    });

    await newAuction.save();
    res.status(201).json(newAuction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  GET /api/auctions/:id — Public
const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'username email') // show seller info
      .populate('bids.bidder', 'username'); // show bidder usernames

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch auction' });
  }
};


//  DELETE /api/auctions/:id — Protected, only owner
const deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if the logged-in user is the creator
    if (auction.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this auction' });
    }

    await auction.deleteOne();
    res.json({ message: 'Auction deleted' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error' });
  }    
};

//  POST /api/auctions/:id/bid — Protected
const placeBid = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    const { amount } = req.body;
    const bidderId = req.user.id;
 
    //  Must be higher than current highest bid or startingBid
    const highestBid = auction.bids.length > 0
      ? Math.max(...auction.bids.map(b => b.amount))
      : auction.startingBid;

    if (amount <= highestBid) {
      return res.status(400).json({ message: 'Bid must be higher than current bid' });
    }

    auction.bids.push({ amount, bidder: bidderId, time: new Date() });
    // Update the starting bid to the latest bid
    auction.startingBid = amount;

    await auction.save();

    res.status(201).json({ message: 'Bid placed successfully', auction });
  } catch (error) {
    res.status(500).json({ message: 'Failed to place bid' });
  }
};


module.exports = {
  getAllAuctions,
  createAuction,
  getAuctionById,
  deleteAuction,
  placeBid,
};
