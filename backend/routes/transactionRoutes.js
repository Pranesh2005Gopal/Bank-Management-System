
// routes/transactionRoutes.js
import express from "express";
import mongoose from "mongoose";
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

    // Check if withdrawal would go below minimum balance
    const newBalance = user.balance - amount;
    if (newBalance < user.minimumBalance) {
      return res.status(400).json({ 
        msg: `Withdrawal would make your balance ($${newBalance}) go below the minimum balance threshold ($${user.minimumBalance}). Please reduce the withdrawal amount or adjust your minimum balance setting.`,
        currentBalance: user.balance,
        minimumBalance: user.minimumBalance,
        attemptedWithdrawal: amount,
        wouldResultInBalance: newBalance,
        requiresConfirmation: true,
        action: "withdraw"
      });
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

// ✅ Confirmed Withdrawal (bypasses minimum balance check)
router.post("/withdraw-confirmed", async (req, res) => {
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

    // Deduct balance and save (no minimum balance check)
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
      balance: user.balance,
      transaction,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ✅ Transfer between accounts
router.post("/transfer", async (req, res) => {
  try {
    const { senderUserId, recipientAccountId, amount, description } = req.body;

    if (!senderUserId || !recipientAccountId || !amount) {
      return res.status(400).json({ msg: "Sender ID, recipient account ID, and amount required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ msg: "Amount must be greater than 0" });
    }

    // Find sender user
    const sender = await User.findById(senderUserId);
    if (!sender) return res.status(404).json({ msg: "Sender account not found" });

    // Find recipient user by account number
    const recipient = await User.findOne({ accountNumber: recipientAccountId });
    if (!recipient) return res.status(404).json({ msg: "Recipient account not found" });

    // Check if sender has sufficient balance
    if (sender.balance < amount) {
      return res.status(400).json({ msg: "Insufficient balance" });
    }

    // Check if sender and recipient are different
    if (sender._id.toString() === recipient._id.toString()) {
      return res.status(400).json({ msg: "Cannot transfer to your own account" });
    }

    // Check if transfer would go below minimum balance
    const newSenderBalance = sender.balance - amount;
    if (newSenderBalance < sender.minimumBalance) {
      return res.status(400).json({ 
        msg: `Transfer would make your balance ($${newSenderBalance}) go below the minimum balance threshold ($${sender.minimumBalance}). Please reduce the transfer amount or adjust your minimum balance setting.`,
        currentBalance: sender.balance,
        minimumBalance: sender.minimumBalance,
        attemptedTransfer: amount,
        wouldResultInBalance: newSenderBalance,
        requiresConfirmation: true,
        action: "transfer",
        recipientAccountId,
        description
      });
    }

    // Store original balances for potential rollback
    const originalSenderBalance = sender.balance;
    const originalRecipientBalance = recipient.balance;

    try {
      // Deduct from sender
      sender.balance -= amount;
      await sender.save();

      // Add to recipient
      recipient.balance += amount;
      await recipient.save();

      // Create transaction records for both users
      const senderTransaction = new Transaction({
        user: senderUserId,
        type: "Transfer",
        amount: -amount, // Negative for sender
        recipientAccountId,
        recipientUserId: recipient._id,
        description: description || `Transfer to ${recipientAccountId}`,
      });

      const recipientTransaction = new Transaction({
        user: recipient._id,
        type: "Transfer",
        amount: amount, // Positive for recipient
        recipientAccountId: sender.accountNumber,
        recipientUserId: senderUserId,
        description: description || `Transfer from ${sender.accountNumber}`,
      });

      await senderTransaction.save();
      await recipientTransaction.save();

      res.json({
        msg: "Transfer successful",
        senderBalance: sender.balance,
        recipientBalance: recipient.balance,
        transaction: senderTransaction,
        recipientName: recipient.name,
        recipientAccountNumber: recipient.accountNumber,
      });
    } catch (error) {
      // Rollback balances if transaction creation fails
      try {
        sender.balance = originalSenderBalance;
        recipient.balance = originalRecipientBalance;
        await sender.save();
        await recipient.save();
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
      throw error;
    }
  } catch (err) {
    console.error("Transfer error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Confirmed Transfer (bypasses minimum balance check)
router.post("/transfer-confirmed", async (req, res) => {
  try {
    const { senderUserId, recipientAccountId, amount, description } = req.body;

    if (!senderUserId || !recipientAccountId || !amount) {
      return res.status(400).json({ msg: "Sender ID, recipient account ID, and amount required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ msg: "Amount must be greater than 0" });
    }

    // Find sender user
    const sender = await User.findById(senderUserId);
    if (!sender) return res.status(404).json({ msg: "Sender account not found" });

    // Find recipient user by account number
    const recipient = await User.findOne({ accountNumber: recipientAccountId });
    if (!recipient) return res.status(404).json({ msg: "Recipient account not found" });

    // Check if sender has sufficient balance
    if (sender.balance < amount) {
      return res.status(400).json({ msg: "Insufficient balance" });
    }

    // Check if sender and recipient are different
    if (sender._id.toString() === recipient._id.toString()) {
      return res.status(400).json({ msg: "Cannot transfer to your own account" });
    }

    // Store original balances for potential rollback
    const originalSenderBalance = sender.balance;
    const originalRecipientBalance = recipient.balance;

    try {
      // Deduct from sender (no minimum balance check)
      sender.balance -= amount;
      await sender.save();

      // Add to recipient
      recipient.balance += amount;
      await recipient.save();

      // Create transaction records for both users
      const senderTransaction = new Transaction({
        user: senderUserId,
        type: "Transfer",
        amount: -amount, // Negative for sender
        recipientAccountId,
        recipientUserId: recipient._id,
        description: description || `Transfer to ${recipientAccountId}`,
      });

      const recipientTransaction = new Transaction({
        user: recipient._id,
        type: "Transfer",
        amount: amount, // Positive for recipient
        recipientAccountId: sender.accountNumber,
        recipientUserId: senderUserId,
        description: description || `Transfer from ${sender.accountNumber}`,
      });

      await senderTransaction.save();
      await recipientTransaction.save();

      res.json({
        msg: "Transfer successful",
        senderBalance: sender.balance,
        recipientBalance: recipient.balance,
        transaction: senderTransaction,
        recipientName: recipient.name,
        recipientAccountNumber: recipient.accountNumber,
      });
    } catch (error) {
      // Rollback balances if transaction creation fails
      try {
        sender.balance = originalSenderBalance;
        recipient.balance = originalRecipientBalance;
        await sender.save();
        await recipient.save();
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
      throw error;
    }
  } catch (err) {
    console.error("Transfer error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

export default router;


