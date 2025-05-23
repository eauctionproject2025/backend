require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes")
const auctionRoutes = require("./routes/auctionRoutes");
const userRoutes = require("./routes/user");
const userAuction = require('./routes/userAuction');
const bidRoutes = require('./routes/bid');
const user = require('./routes/user');
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
app.use("/api/auth", authRoutes)  

app.use('/api', auctionRoutes);

app.use('/api/users/', userRoutes);
app.use('/api/auctions', userAuction);
// app.use('/api/bids', bidRoutes);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
