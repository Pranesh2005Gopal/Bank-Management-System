import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMe(res.data);
        if (res.data.role !== "admin") {
          navigate("/dashboard");
        }
      } catch (err) {
        navigate("/login");
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("ADMIN USERS FETCH ERROR:", err.response?.data || err.message);
      }
    };

    fetchMe();
    fetchUsers();
  }, [token, navigate]);

  const handleSignout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this account? This action cannot be undone.")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("DELETE /api/admin/users error", err.response?.status, err.response?.data, err.message);
      const msg = err.response?.data?.message || `Failed to delete user${err.response?.status ? ` (status ${err.response.status})` : ""}`;
      alert(msg);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Admin Panel {me ? `- ${me.name}` : ""}</h2>
        <button className="signout-btn" onClick={handleSignout}>Sign Out</button>
      </div>

      <h3>All Customers</h3>
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Customer ID</th>
            <th>Account No</th>
            <th>Type</th>
            <th>Balance</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.customerId}</td>
              <td>{u.accountNumber}</td>
              <td>{u.accountType}</td>
              <td>${u.balance}</td>
              <td>
                <Link to={`/admin/users/${u._id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;



