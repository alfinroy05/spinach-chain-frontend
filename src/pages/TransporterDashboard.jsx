import React, { useEffect, useState } from "react";
import "./TransporterDashboard.css";

const TransporterDashboard = () => {
  const [assignedBatches, setAssignedBatches] = useState([]);

  useEffect(() => {
    // 🔹 Replace with API call later
    const demoData = [
      {
        batch_id: "BATCH6",
        farm_name: "Kerala Green Farms",
        pickup_time: "2026-02-24T10:00:00",
        status: "In Transit",
        destination: "Cold Storage - Kochi"
      }
    ];

    setAssignedBatches(demoData);
  }, []);

  const handleConfirmPickup = (batchId) => {
    alert("Pickup confirmed for " + batchId);
    // 🔥 Later: call backend to update state to IN_TRANSIT
  };

  const handleTransferToColdStorage = (batchId) => {
    alert("Transferred to Cold Storage: " + batchId);
    // 🔥 Later: call blockchain transferOwnership + updateState
  };

  return (
    <div className="transporter-container">
      <h2>🚛 Transporter Dashboard</h2>

      {assignedBatches.length === 0 ? (
        <p>No batches assigned.</p>
      ) : (
        assignedBatches.map((batch) => (
          <div key={batch.batch_id} className="transporter-card">
            <p><strong>Batch ID:</strong> {batch.batch_id}</p>
            <p><strong>Farm:</strong> {batch.farm_name}</p>
            <p><strong>Status:</strong> {batch.status}</p>
            <p><strong>Pickup Time:</strong> {new Date(batch.pickup_time).toLocaleString()}</p>
            <p><strong>Destination:</strong> {batch.destination}</p>

            <div className="transporter-actions">
              <button onClick={() => handleConfirmPickup(batch.batch_id)}>
                Confirm Pickup
              </button>

              <button onClick={() => handleTransferToColdStorage(batch.batch_id)}>
                Transfer to Cold Storage
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TransporterDashboard;