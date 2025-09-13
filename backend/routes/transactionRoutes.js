/*const express = require("express");
const Transaction = require("../models/Transaction");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get transactions (customer sees their own, admin/employee sees all)
router.get("/", protect, async (req, res) => {
  try {
    let transactions;
    if (req.user.role === "customer") {
      transactions = await Transaction.find({ userId: req.user._id });
    } else {
      transactions = await Transaction.find().populate("userId", "name email");
    }
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;*/

// routes/transactionRoutes.js
import express from "express";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Get all transactions for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ✅ Deposit
router.post("/deposit", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ msg: "User ID and amount required" });
    }

    // Create transaction
    const transaction = new Transaction({
      user: userId,
      type: "Deposit",
      amount,
    });
    await transaction.save();

    // Update user balance
    await User.findByIdAndUpdate(userId, { $inc: { balance: amount } });

    res.json({ msg: "Deposit successful", transaction });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ✅ Withdraw
router.post("/withdraw", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ msg: "User ID and amount required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (user.balance < amount) {
      return res.status(400).json({ msg: "Insufficient balance" });
    }

    // Create transaction
    const transaction = new Transaction({
      user: userId,
      type: "Withdraw",
      amount,
    });
    await transaction.save();

    // Deduct balance
    await User.findByIdAndUpdate(userId, { $inc: { balance: -amount } });

    res.json({ msg: "Withdrawal successful", transaction });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;

