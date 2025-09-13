/*const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  customerName: String,
  amount: Number,
  type: { type: String, enum: ["deposit", "withdrawal", "transfer"] },
  status: { type: String, enum: ["success", "failed", "pending"], default: "success" },
  date: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Transaction", transactionSchema);
*/

// models/Transaction.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["Deposit", "Withdraw"], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Transaction", transactionSchema);
