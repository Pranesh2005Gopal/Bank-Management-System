import express from "express";
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
/*const handleLogin = async (email, password) => {
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email: email,
      password: password
    }, {
      headers: { "Content-Type": "application/json" } // optional, axios adds this automatically
    });

    localStorage.setItem("token", res.data.token);
    console.log("Login success:", res.data);
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Login failed");
  }
};*/

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

