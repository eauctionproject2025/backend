const mongoose = require("mongoose");
MONGO_URI = `mongodb+srv://dev-asem:${process.env.DB_PASS}@auction01.x2jka.mongodb.net/?retryWrites=true&w=majority&appName=auction01`

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
