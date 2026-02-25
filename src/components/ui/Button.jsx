import React from "react";
import "./Button.css";

const Button = ({
  children,
  type = "primary",
  onClick,
  disabled = false,
  loading = false,
}) => {
  return (
    <button
      className={`btn ${type}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? "Processing..." : children}
    </button>
  );
};

export default Button;