import React, { useState } from "react";
import AlertBox from "../components/ui/AlertBox";
import useBlockchain from "../hooks/useBlockchain";
import "./Verification.css";

const Verification = () => {
  const { getBatch } = useBlockchain(); // 🔥 Read-only function

  const [batchId, setBatchId] = useState("");
  const [batchData, setBatchData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    try {
      setError("");
      setBatchData(null);

      if (!batchId.trim()) {
        setError("Enter Batch ID");
        return;
      }

      setLoading(true);

      // 🔹 1️⃣ Read from blockchain (NO wallet needed)
      const batch = await getBatch(batchId);

      const ipfsCID = batch[1];
      const state = Number(batch[6]);
      const coldViolation = batch[7];

      // 🔹 2️⃣ Fetch IPFS data
      const response = await fetch(
        `https://gateway.pinata.cloud/ipfs/${ipfsCID}`
      );

      const ipfsData = await response.json();

      setBatchData({
        batchId,
        state,
        coldViolation,
        ipfsData
      });

      setLoading(false);

    } catch (err) {
      console.error(err);
      setError("Product not found or verification failed");
      setLoading(false);
    }
  };

  const stateLabels = [
    "Harvested",
    "In Transit",
    "In Cold Storage",
    "Delivered",
    "Rejected"
  ];

  return (
    <div className="verify-container">
      <h1>🌿 Product Authenticity Check</h1>

      <div className="verify-box">
        <input
          type="text"
          placeholder="Enter Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
        />

        <button onClick={handleVerify}>
          {loading ? "Checking..." : "Verify Product"}
        </button>
      </div>

      {error && <AlertBox type="danger" message={error} />}

      {batchData && (
        <div className="consumer-card">

          <h2>✅ Verified Product</h2>

          <p><strong>Batch ID:</strong> {batchData.batchId}</p>

          <p>
            <strong>Status:</strong>{" "}
            {stateLabels[batchData.state]}
          </p>

          <p>
            <strong>Cold Chain:</strong>{" "}
            {batchData.coldViolation
              ? "⚠️ Temperature Issue Detected"
              : "Maintained Properly ✅"}
          </p>

          <hr />

          <h3>🌱 Farm Information</h3>
          <p><strong>Farm:</strong> {batchData.ipfsData.farmer}</p>

          <h3>📊 Quality Metrics</h3>
          <p><strong>Health Score:</strong> {batchData.ipfsData.health_score || "N/A"}%</p>
          <p><strong>Disease Risk:</strong> {batchData.ipfsData.disease_probability || "N/A"}%</p>
          <p><strong>Predicted Yield:</strong> {batchData.ipfsData.predicted_yield || "N/A"} kg</p>

          <AlertBox
            type="success"
            message="This product is verified and recorded on blockchain."
          />
        </div>
      )}
    </div>
  );
};

export default Verification;