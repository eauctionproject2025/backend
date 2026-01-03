// services/auctionWinner.service.js
const Auction = require("../models/Auction.js");

const assignAuctionWinner = async (auctionId) => {
  const auction = await Auction.findById(auctionId);

  if (!auction) return null;

  const now = new Date();

  // Guard clauses (VERY important)
  if (auction.winner) return auction;
  if (now <= new Date(auction.endTime)) return auction;
  if (!auction.bids || auction.bids.length === 0) return auction;

  // Find highest bid
  const highestBid = auction.bids.reduce((max, bid) =>
    bid.amount > max.amount ? bid : max
  );

  auction.winner = highestBid.bidder;

  await auction.save();

  return auction;
};

module.exports = {
  assignAuctionWinner,
};

