import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <h1 className="error-code">404</h1>
      <h2>Page Not Found</h2>
      <p>
        🌿 The page you are looking for does not exist.
        Please return to the dashboard.
      </p>

      <Button onClick={() => navigate("/")}>
        Go to Dashboard
      </Button>
    </div>
  );
};

export default NotFound;