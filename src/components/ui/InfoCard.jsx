import React from "react";
import "./InfoCard.css";

const InfoCard = ({
  title,
  value,
  icon,
  status = "normal", // normal | success | warning | danger
}) => {
  return (
    <div className={`info-card ${status}`}>
      <div className="card-top">
        <span className="card-icon">{icon}</span>
        <h4 className="card-title">{title}</h4>
      </div>

      <h2 className="card-value">{value}</h2>
    </div>
  );
};

export default InfoCard;