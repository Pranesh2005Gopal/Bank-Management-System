import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        fetchTransactions(res.data._id);
      } catch (err) {
        console.error("USER FETCH ERROR:", err.response?.data || err.message);
      }
    };

    const fetchTransactions = async (userId) => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/transactions/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTransactions(res.data);
      } catch (err) {
        console.error("TXN FETCH ERROR:", err.response?.data || err.message);
      }
    };

    fetchUser();
  }, [token]);

  // ✅ Deposit
  const handleDeposit = async () => {
    if (!depositAmount || isNaN(depositAmount))
      return alert("Enter a valid amount");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/transactions/deposit",
        { userId: user._id, amount: Number(depositAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.msg);
      setUser({ ...user, balance: res.data.balance });
      setTransactions([res.data.transaction, ...transactions]);
      setDepositAmount("");
    } catch (err) {
      console.error("DEPOSIT ERROR:", err.response?.data || err.message);
    }
  };

  // ✅ Withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(withdrawAmount))
      return alert("Enter a valid amount");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/transactions/withdraw",
        { userId: user._id, amount: Number(withdrawAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.msg);
      setUser({ ...user, balance: res.data.balance });
      setTransactions([res.data.transaction, ...transactions]);
      setWithdrawAmount("");
    } catch (err) {
      console.error("WITHDRAW ERROR:", err.response?.data || err.message);
    }
  };

  // ✅ Signout
  const handleSignout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {user.name || user.username}</h2>
        <button className="signout-btn" onClick={handleSignout}>
          Sign Out
        </button>
      </div>

      {/* ✅ Customer Info Section */}
      <div className="customer-info">
        <p><strong>Customer ID:</strong> {user.customerId}</p>
        <p><strong>Account No:</strong> {user.accountNumber}</p>
        <p><strong>Account Type:</strong> {user.accountType}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Age:</strong> {user.age}</p>
        {user.dob && <p><strong>DOB:</strong> {new Date(user.dob).toLocaleDateString()}</p>}
        <h3>Balance: ${user.balance}</h3>
      </div>

      {/* ✅ Deposit & Withdraw Section */}
      <div className="actions">
        <div>
          <input
            type="number"
            placeholder="Deposit Amount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <button onClick={handleDeposit}>Deposit</button>
        </div>

        <div>
          <input
            type="number"
            placeholder="Withdraw Amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <button onClick={handleWithdraw}>Withdraw</button>
        </div>
      </div>

      {/* ✅ Transaction History */}
      <h3>Transaction History</h3>
      <ul>
        {transactions.map((txn) => (
          <li key={txn._id}>
            {txn.type}: ${txn.amount} — {new Date(txn.date).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
