// account.js (or inside routes)
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Account from "../models/Account.js";

const router = express.Router();


router.get("/balance", authMiddleware, async (req, res) => {
  try {
    console.log("req.user.id:", req.user.id);

    const account = await Account.findOne({ userId: req.user.id });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({ balance: account.balance });
  } catch (err) {
    res.status(500).json({ message: "Error fetching balance", error: err.message });
  }
});


export default router;
