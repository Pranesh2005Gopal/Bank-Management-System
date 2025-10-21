import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientAccountId, setRecipientAccountId] = useState("");
  const [transferDescription, setTransferDescription] = useState("");
  const [minimumBalance, setMinimumBalance] = useState("");
  const [confirmationData, setConfirmationData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
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
      const errorData = err.response?.data;
      if (errorData?.requiresConfirmation) {
        // Show confirmation dialog
        setConfirmationData({
          action: "withdraw",
          amount: Number(withdrawAmount),
          currentBalance: errorData.currentBalance,
          minimumBalance: errorData.minimumBalance,
          wouldResultInBalance: errorData.wouldResultInBalance,
          message: errorData.msg
        });
        setShowConfirmation(true);
      } else {
        const errorMsg = errorData?.msg || err.message;
        alert(`Withdrawal failed: ${errorMsg}`);
        console.error("WITHDRAW ERROR:", err.response?.data || err.message);
      }
    }
  };

  // ✅ Transfer
  const handleTransfer = async () => {
    if (!transferAmount || isNaN(transferAmount) || !recipientAccountId)
      return alert("Enter valid amount and recipient account ID");
    
    if (Number(transferAmount) <= 0)
      return alert("Amount must be greater than 0");
    
    try {
      const res = await axios.post(
        "http://localhost:5000/api/transactions/transfer",
        { 
          senderUserId: user._id, 
          recipientAccountId: recipientAccountId.trim(),
          amount: Number(transferAmount),
          description: transferDescription.trim() || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`${res.data.msg}\nRecipient: ${res.data.recipientName} (${res.data.recipientAccountNumber})`);
      setUser({ ...user, balance: res.data.senderBalance });
      setTransactions([res.data.transaction, ...transactions]);
      setTransferAmount("");
      setRecipientAccountId("");
      setTransferDescription("");
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.requiresConfirmation) {
        // Show confirmation dialog
        setConfirmationData({
          action: "transfer",
          amount: Number(transferAmount),
          recipientAccountId: recipientAccountId.trim(),
          description: transferDescription.trim(),
          currentBalance: errorData.currentBalance,
          minimumBalance: errorData.minimumBalance,
          wouldResultInBalance: errorData.wouldResultInBalance,
          message: errorData.msg
        });
        setShowConfirmation(true);
      } else {
        const errorMsg = errorData?.msg || err.message;
        alert(`Transfer failed: ${errorMsg}`);
        console.error("TRANSFER ERROR:", err.response?.data || err.message);
      }
    }
  };

  // ✅ Set Minimum Balance
  const handleSetMinimumBalance = async () => {
    if (!minimumBalance || isNaN(minimumBalance))
      return alert("Enter a valid minimum balance amount");
    
    if (Number(minimumBalance) < 0)
      return alert("Minimum balance cannot be negative");
    
    try {
      const res = await axios.put(
        "http://localhost:5000/api/user/set-minimum-balance",
        { minimumBalance: Number(minimumBalance) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message);
      setUser({ ...user, minimumBalance: res.data.minimumBalance });
      setMinimumBalance("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      alert(`Failed to set minimum balance: ${errorMsg}`);
      console.error("MINIMUM BALANCE ERROR:", err.response?.data || err.message);
    }
  };

  // ✅ Confirm Transaction (bypass minimum balance)
  const handleConfirmTransaction = async () => {
    if (!confirmationData) return;

    try {
      let res;
      if (confirmationData.action === "withdraw") {
        res = await axios.post(
          "http://localhost:5000/api/transactions/withdraw-confirmed",
          { userId: user._id, amount: confirmationData.amount },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (confirmationData.action === "transfer") {
        res = await axios.post(
          "http://localhost:5000/api/transactions/transfer-confirmed",
          { 
            senderUserId: user._id, 
            recipientAccountId: confirmationData.recipientAccountId,
            amount: confirmationData.amount,
            description: confirmationData.description || undefined
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert(res.data.msg);
      setUser({ ...user, balance: res.data.balance || res.data.senderBalance });
      setTransactions([res.data.transaction, ...transactions]);
      
      // Clear form fields
      setWithdrawAmount("");
      setTransferAmount("");
      setRecipientAccountId("");
      setTransferDescription("");
      
      // Close confirmation dialog
      setShowConfirmation(false);
      setConfirmationData(null);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message;
      alert(`Transaction failed: ${errorMsg}`);
      console.error("CONFIRMED TRANSACTION ERROR:", err.response?.data || err.message);
    }
  };

  // ✅ Cancel Transaction
  const handleCancelTransaction = () => {
    setShowConfirmation(false);
    setConfirmationData(null);
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
        <p><strong>Minimum Balance:</strong> ${user.minimumBalance || 0}</p>
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

      {/* ✅ Transfer Section */}
      <div className="transfer-section">
        <h3>Transfer Money</h3>
        <div className="transfer-form">
          <div className="transfer-input-group">
            <input
              type="text"
              placeholder="Recipient Account Number"
              value={recipientAccountId}
              onChange={(e) => setRecipientAccountId(e.target.value)}
            />
          </div>
          <div className="transfer-input-group">
            <input
              type="number"
              placeholder="Transfer Amount"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
          </div>
          <div className="transfer-input-group">
            <input
              type="text"
              placeholder="Description (Optional)"
              value={transferDescription}
              onChange={(e) => setTransferDescription(e.target.value)}
            />
          </div>
          <button className="transfer-btn" onClick={handleTransfer}>
            Transfer Money
          </button>
        </div>
      </div>

      {/* ✅ Minimum Balance Section */}
      <div className="minimum-balance-section">
        <h3>Set Minimum Balance</h3>
        <div className="minimum-balance-form">
          <div className="minimum-balance-input-group">
            <input
              type="number"
              placeholder="Enter minimum balance amount"
              value={minimumBalance}
              onChange={(e) => setMinimumBalance(e.target.value)}
            />
          </div>
          <button className="minimum-balance-btn" onClick={handleSetMinimumBalance}>
            Set Minimum Balance
          </button>
        </div>
        <div className="minimum-balance-info">
          <p><strong>Current Minimum Balance:</strong> ${user.minimumBalance || 0}</p>
          <p className="info-text">
            💡 This prevents withdrawals and transfers that would make your balance go below this threshold.
          </p>
        </div>
      </div>

      {/* ✅ Transaction History */}
      <div className="transactions">
        <h3>Transaction History</h3>
        {transactions.length > 0 ? (
          <ul>
            {transactions.map((txn) => (
              <li key={txn._id} className={txn.type.toLowerCase()}>
                <div className="transaction-content">
                  <span className={`transaction-type ${txn.type.toLowerCase()}`}>
                    {txn.type}
                    {txn.type === "Transfer" && txn.recipientAccountId && (
                      <span className="transfer-details">
                        {txn.amount < 0 ? " to " : " from "} {txn.recipientAccountId}
                      </span>
                    )}
                  </span>
                  <span className="transaction-amount">
                    {txn.amount < 0 ? "-" : "+"}${Math.abs(txn.amount)}
                  </span>
                  {txn.description && (
                    <span className="transaction-description">
                      {txn.description}
                    </span>
                  )}
                </div>
                <span className="transaction-date">
                  {new Date(txn.date).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            No transactions yet
          </div>
        )}
      </div>

      {/* ✅ Confirmation Dialog */}
      {showConfirmation && confirmationData && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <div className="confirmation-header">
              <h3>⚠️ Minimum Balance Warning</h3>
            </div>
            <div className="confirmation-content">
              <p className="warning-message">{confirmationData.message}</p>
              
              <div className="balance-details">
                <div className="balance-item">
                  <span className="label">Current Balance:</span>
                  <span className="value">${confirmationData.currentBalance}</span>
                </div>
                <div className="balance-item">
                  <span className="label">Minimum Balance:</span>
                  <span className="value">${confirmationData.minimumBalance}</span>
                </div>
                <div className="balance-item">
                  <span className="label">Transaction Amount:</span>
                  <span className="value">${confirmationData.amount}</span>
                </div>
                <div className="balance-item highlight">
                  <span className="label">New Balance:</span>
                  <span className="value">${confirmationData.wouldResultInBalance}</span>
                </div>
              </div>

              {confirmationData.action === "transfer" && (
                <div className="transfer-details">
                  <p><strong>Recipient Account:</strong> {confirmationData.recipientAccountId}</p>
                  {confirmationData.description && (
                    <p><strong>Description:</strong> {confirmationData.description}</p>
                  )}
                </div>
              )}

              <p className="confirmation-question">
                Are you sure you want to proceed with this {confirmationData.action}?
              </p>
            </div>
            <div className="confirmation-actions">
              <button className="cancel-btn" onClick={handleCancelTransaction}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleConfirmTransaction}>
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
