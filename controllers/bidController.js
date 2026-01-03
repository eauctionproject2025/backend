const Bid = require('../models/Bid');
const Auction = require('../models/Auction');

// Get bids for a specific auction
const getBidsByAuctionId = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const bids = await Bid.find({ auction: auctionId })
            .populate('bidder', 'username image')
            .sort({ time: -1 });
        res.json(bids);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get bids by a specific user (My Bids)
const getBidsByUserId = async (req, res) => {
    try {
        const bids = await Bid.find({ bidder: req.params.userId })
            .populate({
                path: 'auction',
                select: 'title endTime startingBid currentBid paymentStatus shipmentStatus imageUrls_0 image', // populate necessary auction details
                // Note: imageUrls is array, checking how to select. 
                // We will populate full auction for now to be safe or select specific fields
            })
            .sort({ time: -1 });
        res.json(bids);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Post bid
const placeBid = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { amount } = req.body;
        const { user } = req;

        // Check if auction exists
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        // Check if auction is active
        if (new Date() > new Date(auction.endTime)) {
            return res.status(400).json({ message: 'Auction has ended' });
        }

        // Check if bid amount is valid
        if (amount <= auction.currentBid) {
            return res.status(400).json({ message: 'Bid amount must be greater than the -current bid' });
        }

        // Create new bid
        const bid = new Bid({
            auction: auctionId,
            bidder: user.id,
            amount,
            time: new Date(),
        });

        // Save bid
        await bid.save();

        // Update auction's current bid & winner
        auction.currentBid = amount;
        auction.winner = user.id;
        await auction.save();

        res.json(bid);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getBidsByAuctionId,
    getBidsByUserId,
    placeBid
};
