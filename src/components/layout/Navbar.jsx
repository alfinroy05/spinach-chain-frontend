import React from "react";
import { Link, useNavigate } from "react-router-dom";
import ConnectWallet from "../blockchain/ConnectWallet";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="logo">🌿 AgriChain</h2>
      </div>

      <div className="navbar-center">
        {role === "farmer" && (
          <>
            <Link to="/farmer" className="nav-link">Dashboard</Link>
            <Link to="/farmer" className="nav-link">My Batches</Link>
          </>
        )}

        {role === "transporter" && (
          <>
            <Link to="/transporter" className="nav-link">Dashboard</Link>
          </>
        )}

        {role === "retailer" && (
          <>
            <Link to="/retailer" className="nav-link">Dashboard</Link>
          </>
        )}

        {role === "cold_storage" && (
          <>
            <Link to="/cold-storage" className="nav-link">Dashboard</Link>
          </>
        )}

        {/* Public verify page */}
        <Link to="/verify" className="nav-link">Verify</Link>
      </div>

      <div className="navbar-right">
        <ConnectWallet />

        {role && (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;