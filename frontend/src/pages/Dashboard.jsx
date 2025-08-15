import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/transfer/balance", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBalance(res.data.balance);
      } catch (err) {
        setMessage("Failed to load balance");
      }
    };
    fetchBalance();
  }, [token]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/transfer",
        { email, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);

      const balanceRes = await axios.get("http://localhost:5000/api/transfer/balance", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(balanceRes.data.balance);

      setEmail("");
      setAmount("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Transfer failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
        <p className="text-lg mb-6">
          <strong>Your Balance:</strong>{" "}
          <span className="text-indigo-600 font-semibold">₹{balance}</span>
        </p>

        <form onSubmit={handleTransfer} className="space-y-4">
          <input
            type="email"
            placeholder="Recipient Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Transfer
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-indigo-600">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
