import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">🌿 SpinachChain</h2>

      <nav className="sidebar-menu">
        <NavLink to="/" className="sidebar-link">
          📊 Dashboard
        </NavLink>

        <NavLink to="/batches" className="sidebar-link">
          📦 Batch Management
        </NavLink>

        <NavLink to="/supply" className="sidebar-link">
          🚚 Supply Chain
        </NavLink>

        <NavLink to="/coldchain" className="sidebar-link">
          ❄ Cold Chain Monitor
        </NavLink>

        <NavLink to="/verify" className="sidebar-link">
          🔎 Verify Product
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;