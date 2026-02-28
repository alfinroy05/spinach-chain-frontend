import React, { useEffect, useState } from "react";
import "./RetailerDashboard.css";

const RetailerDashboard = () => {
  const [receivedBatches, setReceivedBatches] = useState([]);

  useEffect(() => {
    // 🔥 Replace with backend API call later
    const demoData = [
      {
        batch_id: "BATCH6",
        farm_name: "Kerala Green Farms",
        delivered_at: "2026-02-25T09:45:00",
        health_score: 92,
        disease_probability: 4,
        predicted_yield: 110,
        cold_chain_violated: false,
        leaf_image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38"
      }
    ];

    setReceivedBatches(demoData);
  }, []);

  const handleApprove = (batchId) => {
    alert("Batch Approved: " + batchId);
    // 🔥 Later: update state to Delivered / Retail Approved
  };

  const handleReject = (batchId) => {
    alert("Batch Rejected: " + batchId);
    // 🔥 Later: update state to Rejected
  };

  return (
    <div className="retailer-container">
      <h2>🏬 Retailer Dashboard</h2>

      {receivedBatches.length === 0 ? (
        <p>No batches received yet.</p>
      ) : (
        receivedBatches.map((batch) => (
          <div key={batch.batch_id} className="retailer-card">

            <div className="retailer-image">
              <img src={batch.leaf_image} alt="Spinach Leaf" />
            </div>

            <div className="retailer-info">
              <h3>Batch ID: {batch.batch_id}</h3>
              <p><strong>Farm:</strong> {batch.farm_name}</p>
              <p><strong>Delivered At:</strong> {new Date(batch.delivered_at).toLocaleString()}</p>

              <div className="ai-section">
                <p><strong>Health Score:</strong> {batch.health_score}%</p>
                <p><strong>Disease Risk:</strong> {batch.disease_probability}%</p>
                <p><strong>Predicted Yield:</strong> {batch.predicted_yield} kg</p>
                <p>
                  <strong>Cold Chain:</strong>{" "}
                  {batch.cold_chain_violated ? "⚠️ Violated" : "Maintained ✅"}
                </p>
              </div>

              <div className="retailer-actions">
                <button className="approve" onClick={() => handleApprove(batch.batch_id)}>
                  Approve for Sale
                </button>
                <button className="reject" onClick={() => handleReject(batch.batch_id)}>
                  Reject Batch
                </button>
              </div>

            </div>

          </div>
        ))
      )}
    </div>
  );
};

export default RetailerDashboard;