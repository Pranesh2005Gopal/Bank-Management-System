import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["Deposit", "Withdraw", "Transfer"], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  // For transfer transactions
  recipientAccountId: { type: String }, // Account number of recipient
  recipientUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to recipient user
  description: { type: String }, // Optional description for transfer
});

export default mongoose.model("Transaction", transactionSchema);
