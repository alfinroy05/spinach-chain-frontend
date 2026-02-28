import React, { useEffect, useState } from "react";
import "./FarmerDashboard.css";

const FarmerDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [newBatchId, setNewBatchId] = useState("");
  const [farmName, setFarmName] = useState("Kerala Green Farms");

  // 🔹 Fetch batches (later connect to backend)
  useEffect(() => {
    // TODO: Replace with API call
    const demoData = [
      {
        batch_id: "BATCH6",
        state: "Delivered",
        harvest_timestamp: "2026-02-24T09:10:00",
        delivery_timestamp: "2026-02-25T09:45:00"
      }
    ];

    setBatches(demoData);
  }, []);

  const handleCreateBatch = () => {
    if (!newBatchId) return;

    alert("Batch Created: " + newBatchId);

    // TODO: Call backend create-batch API
    setNewBatchId("");
  };

  return (
    <div className="farmer-container">
      <h2>👨‍🌾 Welcome, {farmName}</h2>

      <div className="create-section">
        <h3>Create New Batch</h3>
        <input
          type="text"
          placeholder="Enter Batch ID"
          value={newBatchId}
          onChange={(e) => setNewBatchId(e.target.value)}
        />
        <button onClick={handleCreateBatch}>
          Create Batch
        </button>
      </div>

      <div className="batch-list">
        <h3>My Batches</h3>

        {batches.length === 0 ? (
          <p>No batches created yet.</p>
        ) : (
          batches.map((batch) => (
            <div key={batch.batch_id} className="batch-card">
              <p><strong>Batch ID:</strong> {batch.batch_id}</p>
              <p><strong>Status:</strong> {batch.state}</p>
              <p><strong>Harvested:</strong> {new Date(batch.harvest_timestamp).toLocaleString()}</p>
              {batch.delivery_timestamp && (
                <p><strong>Delivered:</strong> {new Date(batch.delivery_timestamp).toLocaleString()}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;