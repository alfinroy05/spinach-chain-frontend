import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">🌿 SpinachChain</h2>

      <nav className="sidebar-menu">

        {/* FARMER MENU */}
        {role === "farmer" && (
          <>
            <NavLink to="/farmer" className="sidebar-link">
              📊 Dashboard
            </NavLink>

            <NavLink to="/farmer" className="sidebar-link">
              📦 My Batches
            </NavLink>
          </>
        )}

        {/* TRANSPORTER MENU */}
        {role === "transporter" && (
          <>
            <NavLink to="/transporter" className="sidebar-link">
              🚚 Transport Dashboard
            </NavLink>
          </>
        )}

        {/* RETAILER MENU */}
        {role === "retailer" && (
          <>
            <NavLink to="/retailer" className="sidebar-link">
              🛒 Retail Dashboard
            </NavLink>
          </>
        )}

        {/* COLD STORAGE MENU */}
        {role === "cold_storage" && (
          <>
            <NavLink to="/cold-storage" className="sidebar-link">
              ❄ Cold Storage Dashboard
            </NavLink>
            <NavLink to="/cold-storage" className="sidebar-link">
              📈 Temperature Monitor
            </NavLink>
          </>
        )}

        {/* PUBLIC VERIFY (ALL ROLES) */}
        <NavLink to="/verify" className="sidebar-link">
          🔎 Verify Product
        </NavLink>

        {/* LOGOUT */}
        {role && (
          <button onClick={handleLogout} className="sidebar-link logout-btn">
            🚪 Logout
          </button>
        )}

      </nav>
    </div>
  );
};

export default Sidebar;