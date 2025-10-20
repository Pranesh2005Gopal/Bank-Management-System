import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

function AdminUserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // verify admin
        const me = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (me.data.role !== "admin") {
          navigate("/dashboard");
          return;
        }

        const res = await axios.get(`http://localhost:5000/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        navigate("/login");
      }
    };
    fetchUser();
  }, [id, token, navigate]);

  const handleSignout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User deleted successfully");
      navigate("/admin");
    } catch (err) {
      console.error("DELETE /api/admin/users/:id error", err.response?.status, err.response?.data, err.message);
      const msg = err.response?.data?.message || `Failed to delete user${err.response?.status ? ` (status ${err.response.status})` : ""}`;
      alert(msg);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Customer Details</h2>
        <button className="signout-btn signout-fixed" onClick={handleSignout}>Sign Out</button>
      </div>

      <div className="customer-info">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Customer ID:</strong> {user.customerId}</p>
        <p><strong>Account No:</strong> {user.accountNumber}</p>
        <p><strong>Account Type:</strong> {user.accountType}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        {user.dob && <p><strong>DOB:</strong> {new Date(user.dob).toLocaleDateString()}</p>}
        <p><strong>Age:</strong> {user.age}</p>
        <h3>Balance: ${user.balance}</h3>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <Link to="/admin" className="btn-secondary">Back</Link>
        <button className="btn-danger" onClick={handleDelete}>Delete Account</button>
      </div>
    </div>
  );
}

export default AdminUserDetails;



