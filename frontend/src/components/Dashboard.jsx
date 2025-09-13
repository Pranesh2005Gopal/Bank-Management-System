import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css"; // ✅ Import styles

function Dashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({ name: "", email: "" });

  const token = localStorage.getItem("token");

  // ✅ Fetch user
  const fetchUser = async () => {
    try {
      if (!token) {
        console.error("❌ No token found in localStorage");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data); // ✅ Store logged-in user data
    } catch (error) {
      console.error("❌ USER FETCH ERROR:", error.response?.data || error.message);
    }
  };

  // ✅ Fetch transactions
  const fetchTransactions = async (userId) => {
    try {
      if (!userId) return;
      const res = await axios.get(
        `http://localhost:5000/api/transactions/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransactions(res.data);
    } catch (err) {
      console.error("TRANSACTIONS FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  useEffect(() => {
    if (user?._id) {
      fetchTransactions(user._id);
    }
  }, [user]);

  // ✅ Deposit
  const handleDeposit = async () => {
    if (!depositAmount || isNaN(depositAmount)) return alert("Enter a valid amount");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/transactions/deposit",
        { userId: user._id, amount: Number(depositAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.msg);
      fetchUser();
      fetchTransactions(user._id);
      setDepositAmount("");
    } catch (err) {
      console.error("DEPOSIT ERROR:", err.response?.data || err.message);
    }
  };

  // ✅ Withdraw
  const handleTransaction = async () => {
    if (!transactionAmount || isNaN(transactionAmount)) return alert("Enter valid amount");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/transactions/withdraw",
        { userId: user._id, amount: Number(transactionAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.msg);
      fetchUser();
      fetchTransactions(user._id);
      setTransactionAmount("");
    } catch (err) {
      console.error("TRANSACTION ERROR:", err.response?.data || err.message);
    }
  };

  // ✅ Update user
  const handleSaveUser = async () => {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/user",
        editedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
      setEditMode(false);
    } catch (err) {
      console.error("UPDATE USER ERROR:", err);
    }
  };

  // ✅ Sign out
  const handleSignOut = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <button className="signout-btn" onClick={handleSignOut}>
        Sign Out
      </button>

      {user ? (
        <>
          <div className="card">
            {!editMode ? (
              <>
                <h3>Welcome, {user.name}</h3>
                <p>Email: {user.email}</p>
                <p>Balance: ${user.balance}</p>
                <button onClick={() => {
                  setEditedUser({ name: user.name, email: user.email });
                  setEditMode(true);
                }}>
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={editedUser.name}
                  onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                />
                <input
                  type="email"
                  value={editedUser.email}
                  onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                />
                <button onClick={handleSaveUser}>Save</button>
                <button onClick={() => setEditMode(false)}>Cancel</button>
              </>
            )}
          </div>

          <div className="card">
            <h3>Deposit Money</h3>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <button onClick={handleDeposit}>Deposit</button>
          </div>

          <div className="card">
            <h3>Make Transaction</h3>
            <input
              type="number"
              value={transactionAmount}
              onChange={(e) => setTransactionAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <button onClick={handleTransaction}>Withdraw</button>
          </div>
        </>
      ) : (
        <p>Loading user...</p>
      )}

      <div className="transactions">
        <h3>Transactions</h3>
        {transactions.length > 0 ? (
          <ul>
            {transactions.map((t) => (
              <li key={t._id}>
                <span>{t.type.toUpperCase()} - ${t.amount}</span>
                <span>{new Date(t.date).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No transactions found</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
