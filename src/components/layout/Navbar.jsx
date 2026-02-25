import React from "react";
import { Link } from "react-router-dom";
import ConnectWallet from "../blockchain/ConnectWallet";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="logo">🌿 SpinachChain</h2>
      </div>

      <div className="navbar-center">
        <Link to="/" className="nav-link">Dashboard</Link>
        <Link to="/batches" className="nav-link">Batches</Link>
        <Link to="/supply" className="nav-link">Supply Chain</Link>
        <Link to="/verify" className="nav-link">Verify</Link>
      </div>

      <div className="navbar-right">
        <ConnectWallet />
      </div>
    </nav>
  );
};

export default Navbar;