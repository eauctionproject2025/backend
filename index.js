require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes")
const auctionRoutes = require("./routes/auctionRoutes");
const userRoutes = require("./routes/user");
const userAuction = require('./routes/userAuction');
const uploadProfile = require('./routes/uploadProfile');
const adminRoutes = require('./routes/adminRoutes');
const cookieParser = require('cookie-parser');


const app = express();

const connectDB = require("./config/db");
connectDB();            //to connect database

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
  credentials: true             
}));
app.use(cookieParser());

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});
// Authentication routes
app.use("/api/auth", authRoutes)  
// Auction routes
app.use('/api/auctions', auctionRoutes);
// User routes
app.use('/api/users', userRoutes);
// User auction routes
app.use('/api/auctions', userAuction);
// Upload profile image route
app.use('/api/uploads', uploadProfile);
// Admin routes
app.use('/api/admin', adminRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
