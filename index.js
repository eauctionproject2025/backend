require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes")

const app = express();

const connectDB = require("./config/db");
connectDB();            //to connect database

// Middleware
app.use(express.json());
app.use(cors()); 

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/api/auth", authRoutes)  

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
