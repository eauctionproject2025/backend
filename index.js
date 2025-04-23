require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes")
const auctionRoutes = require("./routes/auctionRoutes");
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

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/api/auth", authRoutes)  

app.use(cookieParser());

app.use('/api', auctionRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
