const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    imageUrls: {
      type: [String], 
      required: true,
    },
    cloudUrls: {
      type: [String], 
    },
    startingBid: {
      type: Number,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // bids array removed for scalability
    currentBid: {
       type: Number,
       default: 0
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "payment_held", "completed", "refunded"],
      default: "pending",
    },
    shipmentStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered"],
      default: "pending",
    },
    paymentSessionId: {
      type: String,
      default: null,
    },
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    }]

  },
  { timestamps: true }
);

module.exports = mongoose.model("Auction", auctionSchema);
