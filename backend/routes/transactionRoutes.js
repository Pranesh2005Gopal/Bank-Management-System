
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

    // Update user balance and get the updated user back
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: amount } },
      { new: true } // ✅ return updated user
    );

    if (!user) return res.status(404).json({ msg: "User not found" });

    // Create transaction
    const transaction = new Transaction({
      user: userId,
      type: "Deposit",
      amount,
    });
    await transaction.save();

    res.json({
      msg: "Deposit successful",
      balance: user.balance, // ✅ send updated balance
      transaction,
    });
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

    // Deduct balance and save
    user.balance -= amount;
    await user.save();

    // Create transaction
    const transaction = new Transaction({
      user: userId,
      type: "Withdraw",
      amount,
    });
    await transaction.save();

    res.json({
      msg: "Withdrawal successful",
      balance: user.balance, // ✅ send updated balance
      transaction,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;


