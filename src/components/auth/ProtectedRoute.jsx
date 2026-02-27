import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 🔒 If no token → go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 If role mismatch → redirect to correct dashboard
  if (allowedRole && role !== allowedRole) {

    if (role === "farmer") return <Navigate to="/farmer" replace />;
    if (role === "transporter") return <Navigate to="/transporter" replace />;
    if (role === "retailer") return <Navigate to="/retailer" replace />;
    if (role === "cold_storage") return <Navigate to="/cold-storage" replace />;

    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;