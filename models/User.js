const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nid: { type: Number, required: true, unique:true, length:10}, // gpt says String
  image: { type: String, default:""},
  role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
  description: { type: String },
  address: { type: String },
  blocked: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
