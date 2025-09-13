import React from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

// Simple Home component
function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🏦 Welcome to the Bank Management System</h1>
      <p>Please login or register to access your dashboard.</p>
      <div style={{ marginTop: "20px" }}>
        <Link
          to="/login"
          style={{
            background: "#3498db",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            textDecoration: "none",
            marginRight: "10px",
          }}
        >
          Login
        </Link>
        <Link
          to="/register"
          style={{
            background: "#2ecc71",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            textDecoration: "none",
          }}
        >
          Register
        </Link>
      </div>
    </div>
  );
}

// Protect dashboard route
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  
  return (
    <div>
      {/* Navbar - Only show if not on dashboard */}
      {!isDashboard && (
        <nav
          style={{
            background: "#2c3e50",
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Left side */}
          <div>
            <Link
              to="/"
              style={{
                color: "#fff",
                fontSize: "18px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Home
            </Link>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", gap: "20px" }}>
            <Link
              to="/login"
              style={{
                color: "#f1c40f",
                fontSize: "16px",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Login
            </Link>
            <Link
              to="/register"
              style={{
                color: "#f1c40f",
                fontSize: "16px",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Register
            </Link>
          </div>
        </nav>
      )}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;