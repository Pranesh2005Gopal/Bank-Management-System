import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "customer" },
    phone: { type: String },
    age: { type: Number },   // 👉 now derived from dob
    dob: { type: Date },
    customerId: { type: String, unique: true },
    accountNumber: { type: String, unique: true },
    accountType: { type: String, enum: ["Savings", "Current", "Fixed"] },
    balance: { type: Number, default: 0 },
    minimumBalance: { type: Number, default: 0 }, // Minimum balance threshold
  },
  { timestamps: true }
);

// ✅ Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Method for password check
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);


