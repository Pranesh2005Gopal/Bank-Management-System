import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) return alert("Enter email and password");

    const payload = { email, password };
    console.log("Login Payload:", payload); // debug

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        payload,
        { headers: { "Content-Type": "application/json" } } // optional
      );

      localStorage.setItem("token", res.data.token);
      console.log("Login success:", res.data);
      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form className="auth-form" onSubmit={handleLogin}>
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
          Login
        </button>
      </form>
      <p className="auth-link">
        Don’t have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}

export default Login;

