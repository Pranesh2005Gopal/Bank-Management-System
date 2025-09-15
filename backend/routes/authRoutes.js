/*import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Register
router.post("/register", async (req, res) => {
  const { name, email, password, role, phone, age, dob, customerId, accountNumber, accountType } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      password, // ❌ don't hash here, let pre-save do it
      role,
      phone,
      age,
      dob,
      customerId,
      accountNumber,
      accountType,
      balance: 0
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accountNumber: user.accountNumber,
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
      res.json({ token, role: user.role, name: user.name, email: user.email });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Profile
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;*/

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Register
router.post("/register", async (req, res) => {
  const { name, email, password, role, phone, dob, customerId, accountNumber, accountType } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // 👉 derive age from dob
    let age;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    const user = await User.create({
      name,
      email,
      password, // ❌ plain, hashing handled in pre-save
      role,
      phone,
      dob,
      age,
      customerId,
      accountNumber,
      accountType,
      balance: 0
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accountNumber: user.accountNumber,
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
      res.json({ token, role: user.role, name: user.name, email: user.email });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Profile
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;


