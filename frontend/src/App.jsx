import React from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import AdminUserDetails from "./components/AdminUserDetails";

// Simple Home component
function Home() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "80px 20px 40px",
        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 40%, #43e97b 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 32,
          alignItems: "stretch",
          background: "rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 16px 36px rgba(0,0,0,0.14)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div>
          <h1 style={{ color: "#fff", fontSize: 42, margin: 0 }}>
            Simple, secure banking for everyone
          </h1>
          <p style={{ color: "#f0f7ff", fontSize: 16, marginTop: 12, lineHeight: 1.6 }}>
            Manage accounts, track transactions, and perform deposits and withdrawals with an intuitive dashboard.
          </p>
          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            <Link
              to="/login"
              style={{
                background: "#2c3e50",
                color: "#fff",
                padding: "12px 18px",
                borderRadius: 10,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Login
            </Link>
            <Link
              to="/register"
              style={{
                background: "#f1c40f",
                color: "#1b1b1b",
                padding: "12px 18px",
                borderRadius: 10,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Create Account
            </Link>
          </div>

          {/* Feature chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
            {[
              { emoji: "🔒", text: "Bank‑grade security" },
              { emoji: "⚡", text: "Fast transactions" },
            ].map((f) => (
              <span
                key={f.text}
                style={{
                  background: "rgba(255,255,255,0.75)",
                  color: "#1b1b1b",
                  padding: "8px 12px",
                  borderRadius: 999,
                  fontWeight: 600,
                  boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
                }}
              >
                <span style={{ marginRight: 8 }}>{f.emoji}</span>
                {f.text}
              </span>
            ))}
          </div>

          {/* Stats under hero copy */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 12,
              marginTop: 18,
              maxWidth: 560,
            }}
          >
            {[
              { label: "Customers", value: "10k+" },
              { label: "Transactions", value: "1M+" },
              { label: "Uptime", value: "99.9%" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  color: "#fff",
                  boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800 }}>{s.value}</div>
                <div style={{ opacity: 0.9, fontSize: 13 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            textAlign: "left",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#2c3e50" }}>Why choose us?</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#333" }}>
            <li>Role-based access for Admin and Customers</li>
            <li>Real-time transaction history</li>
            <li>Secure JWT authentication</li>
            <li>Modern, responsive UI</li>
          </ul>

          {/* Simple illustration */}
          <div
            style={{
              marginTop: 18,
              border: "1px solid #eef2f7",
              borderRadius: 12,
              padding: 16,
              background: "linear-gradient(135deg,#e8f3ff,#ffffff)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "#2c3e50",
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  fontWeight: 800,
                }}
              >
                ₿
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#2c3e50" }}>Your money, your control</div>
                <div style={{ fontSize: 13, color: "#5b6b7a" }}>Instant visibility of balance and movements</div>
              </div>
            </div>
          </div>
        </div>
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
  const isDashboard = location.pathname === "/dashboard" || location.pathname.startsWith("/admin");
  
  return (
    <div>
      {/* Navbar - Only show if not on dashboard */}
      {!isDashboard && (
        <nav style={{ background: "#2c3e50", boxShadow: "0 2px 10px rgba(0,0,0,0.25)" }}>
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
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

            {/* Right side intentionally empty (hide login/register on home) */}
            <div />
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
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <PrivateRoute>
              <AdminUserDetails />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;