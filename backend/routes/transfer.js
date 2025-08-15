import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get logged-in user balance
router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch balance" });
  }
});

// ✅ Transfer money
router.post("/", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email, amount } = req.body;
    const transferAmount = Number(amount);

    if (transferAmount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid transfer amount" });
    }

    // sender = logged-in user
    const sender = await User.findById(req.user.id).session(session);
    if (!sender) throw new Error("Sender not found");

    // receiver = user by email
    const receiver = await User.findOne({ email }).session(session);
    if (!receiver) throw new Error("Recipient not found");

    if (sender.balance < transferAmount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Update balances
    sender.balance -= transferAmount;
    receiver.balance += transferAmount;

    await sender.save({ session });
    await receiver.save({ session });

    await session.commitTransaction();
    res.json({ message: "Transfer successful" });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: "Transfer failed", error: err.message });
  } finally {
    session.endSession();
  }
});

export default router;
