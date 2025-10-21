import express from "express";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ✅ Get logged-in user's profile
 * GET /api/user/me
 */
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ✅ Update logged-in user's details
 * PUT /api/user/update
 */
router.put("/update", protect, async (req, res) => {
  try {
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * ✅ Get logged-in user's transactions
 * GET /api/user/transactions
 */
router.get("/transactions", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ date: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ✅ Set minimum balance for logged-in user
 * PUT /api/user/set-minimum-balance
 */
router.put("/set-minimum-balance", protect, async (req, res) => {
  try {
    const { minimumBalance } = req.body;

    if (minimumBalance === undefined || minimumBalance === null) {
      return res.status(400).json({ message: "Minimum balance is required" });
    }

    if (minimumBalance < 0) {
      return res.status(400).json({ message: "Minimum balance cannot be negative" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current balance is already below the new minimum
    if (user.balance < minimumBalance) {
      return res.status(400).json({ 
        message: `Cannot set minimum balance to $${minimumBalance} as your current balance ($${user.balance}) is below this threshold. Please deposit money first or set a lower minimum balance.`,
        currentBalance: user.balance,
        attemptedMinimumBalance: minimumBalance
      });
    }

    user.minimumBalance = minimumBalance;
    await user.save();

    res.json({
      message: "Minimum balance updated successfully",
      minimumBalance: user.minimumBalance,
      currentBalance: user.balance
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;


