import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AIResultCard.css";

const AIResultCard = ({ batchId }) => {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchAIResult();
  }, [batchId]);

  const fetchAIResult = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE}/ai/predict/${batchId}`
      );

      setAiData(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load AI prediction.");
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 75) return "green";
    if (score >= 50) return "orange";
    return "red";
  };

  if (loading) return <div className="ai-card">Loading AI results...</div>;
  if (error) return <div className="ai-card error">{error}</div>;
  if (!aiData) return null;

  return (
    <div className="ai-card">
      <h3>🤖 AI Crop Intelligence</h3>

      <div className="health-section">
        <div
          className="health-circle"
          style={{ backgroundColor: getHealthColor(aiData.health_score) }}
        >
          {aiData.health_score}%
        </div>
        <p className="health-label">Health Score</p>
      </div>

      <div className="ai-details">
        <p>
          🦠 <strong>Disease Risk:</strong> {aiData.disease_risk}%
        </p>
        <p>
          📈 <strong>Predicted Yield:</strong> {aiData.predicted_yield} kg
        </p>
        {aiData.recommendation && (
          <p>
            🌱 <strong>Recommendation:</strong> {aiData.recommendation}
          </p>
        )}
      </div>
    </div>
  );
};

export default AIResultCard;