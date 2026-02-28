import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------
  // Handle Input Change
  // -----------------------------
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // -----------------------------
  // Connect MetaMask (Optional but recommended)
  // -----------------------------
  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed");
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    return accounts[0].toLowerCase();
  };

  // -----------------------------
  // Handle Login
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    localStorage.clear();

    try {
      // 🔐 Step 1: Backend Login
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      console.log("Login response:", data);

      if (!response.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      if (!data.access_token) {
        setError("Authentication failed.");
        setLoading(false);
        return;
      }

      // 🔗 Step 2: Connect MetaMask
      const wallet = await connectWallet();

      // ✅ Store session
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("wallet", wallet);
      localStorage.setItem("user_id", data.user_id);

      // 🚀 Redirect by role
      switch (data.role) {
        case "farmer":
          navigate("/farmer");
          break;
        case "transporter":
          navigate("/transporter");
          break;
        case "retailer":
          navigate("/retailer");
          break;
        case "cold_storage":
          navigate("/cold-storage");
          break;
        default:
          navigate("/login");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🌿 SpinachChain Login</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="register-link">
          Don't have an account?{" "}
          <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;