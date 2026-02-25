import React from "react";
import "./AlertBox.css";

const AlertBox = ({ type = "info", message }) => {
  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠";
      case "danger":
        return "❌";
      default:
        return "ℹ";
    }
  };

  return (
    <div className={`alert-box ${type}`}>
      <span className="alert-icon">{getIcon()}</span>
      <span className="alert-message">{message}</span>
    </div>
  );
};

export default AlertBox;