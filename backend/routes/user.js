// routes/user.js
import express from "express";
import User from "../models/User.js";  // your user schema
import Transaction from "../models/Transaction.js";  // your transaction schema
import authMiddleware from "../middleware/auth.js";  // JWT check

const router = express.Router();

// ✅ Get user details
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update user details
router.put("/user", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    ).select("-password");
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// ✅ Deposit money
router.post("/deposit", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    const user = await User.findById(req.user.id);
    user.balance += amount;
    await user.save();

    const transaction = new Transaction({
      userId: req.user.id,
      type: "deposit",
      amount,
      date: new Date(),
    });
    await transaction.save();

    res.json({ message: "Deposit successful", balance: user.balance });
  } catch (err) {
    res.status(500).json({ error: "Deposit failed" });
  }
});

// ✅ Get transactions
router.get("/transactions", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
