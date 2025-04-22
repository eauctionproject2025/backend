const mongoose = require("mongoose");
MONGO_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@auction1.xqgqzau.mongodb.net/?retryWrites=true&w=majority&appName=auction1`

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected!");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
