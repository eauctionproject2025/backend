const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  imageUrl: {
    type: String,
    required: true,
  },
  startingBid: {
    type: Number,
    required: true,
  },
//   currentBid: {
//     type: Number,
//     default: 0,
//   },
  // endTime: {
  //   type: Date,
  //   required: true,
  // },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Auction', auctionSchema);
