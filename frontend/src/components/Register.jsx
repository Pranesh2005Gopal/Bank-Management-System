/*import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css"; 

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        email,
        password,
      });
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert("Registration failed!");
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form className="auth-form" onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="auth-btn" type="submit">
          Register
        </button>
      </form>

      <p className="auth-link">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}

export default Register;*/

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dob: "",
    customerId: "",
    accountNumber: "",
    accountType: "Savings",
  });

  const navigate = useNavigate();

  // Function to derive age from DOB
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const age = calculateAge(formData.dob);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        ...formData,
        age, // derived from dob
      });
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Registration failed!");
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="customerId"
          placeholder="Customer ID"
          value={formData.customerId}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="accountNumber"
          placeholder="Account Number"
          value={formData.accountNumber}
          onChange={handleChange}
          required
        />
        <select
          name="accountType"
          value={formData.accountType}
          onChange={handleChange}
        >
          <option value="Savings">Savings</option>
          <option value="Current">Current</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;



