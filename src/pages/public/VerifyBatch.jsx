import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import contractABI from "../../contracts/abi.json";
import "./VerifyBatch.css";

const CONTRACT_ADDRESS = "0x826849f64E347BAA34a77360074E6569EaF0dDdd";
const SEPOLIA_RPC =
  "https://sepolia.infura.io/v3/5b701e10c81540548cfddaf846431251";

const stateMap = [
  "Harvested",
  "InTransit",
  "InColdStorage",
  "Delivered",
  "Rejected"
];

const VerifyBatch = () => {
  const { batchId } = useParams();

  const [farmData, setFarmData] = useState(null);
  const [blockchainData, setBlockchainData] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    verifyBatch();
  }, [batchId]);

  const verifyBatch = async () => {
    try {
      const cleanId = batchId.trim();

      // 🔹 Backend (AI + Farm info)
      try {
        const res = await axios.get(
          `http://localhost:5000/api/public/verify/${cleanId}`
        );
        setFarmData(res.data);
      } catch {
        console.log("Backend info not available");
      }

      // 🔹 Blockchain verification
      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        provider
      );

      const onChain = await contract.getBatch(cleanId);

      const stateIndex = Number(onChain[6]);
      const state = stateMap[stateIndex];
      const coldViolation = onChain[7];
      const harvestTime = Number(onChain[5]) * 1000;

      setBlockchainData({
        state,
        coldViolation,
        harvestTime
      });

      setIsVerified(state === "Delivered");

    } catch (err) {
      console.error(err);
      setError("This QR code is invalid or product not registered.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="verify-container">
        🔎 Verifying product authenticity...
      </div>
    );

  if (error)
    return (
      <div className="verify-container error">
        ❌ {error}
      </div>
    );

  return (
    <div className="verify-container">
      <div className="verify-card">

        <h1 className="title">🌿 SpinachChain Product Verification</h1>

        {isVerified ? (
          <div className="verified-badge success">
            ✅ Authentic Product – Delivered to Retailer
          </div>
        ) : (
          <div className="verified-badge danger">
            ⚠ Product Not Fully Delivered Yet
          </div>
        )}

        <div className="section">
          <h3>📦 Batch Information</h3>
          <p><strong>Batch ID:</strong> {batchId}</p>
          <p><strong>Supply Chain Status:</strong> {blockchainData?.state}</p>
          <p>
            <strong>Cold Storage Condition:</strong>{" "}
            {blockchainData?.coldViolation
              ? "⚠ Temperature deviation detected"
              : "❄ Stored under safe temperature"}
          </p>
          <p>
            <strong>Harvest Date (Blockchain):</strong>{" "}
            {new Date(blockchainData?.harvestTime).toLocaleString()}
          </p>
        </div>

        {farmData && (
          <>
            <div className="section">
              <h3>🌾 Farm Details</h3>
              <p><strong>Farm Name:</strong> {farmData.farm_name}</p>
              <p>
                <strong>Harvested On:</strong>{" "}
                {new Date(farmData.harvest_timestamp).toLocaleString()}
              </p>
            </div>

            <div className="section ai-section">
              <h3>🤖 AI Quality Assessment</h3>

              <div className="ai-grid">
                <div className="ai-card">
                  <div className="ai-value">
                    {farmData.health_score}%
                  </div>
                  <div className="ai-label">
                    Crop Health Score
                  </div>
                </div>

                <div className="ai-card">
                  <div className="ai-value">
                    {farmData.disease_probability}%
                  </div>
                  <div className="ai-label">
                    Disease Risk
                  </div>
                </div>

                <div className="ai-card">
                  <div className="ai-value">
                    {farmData.predicted_yield} kg
                  </div>
                  <div className="ai-label">
                    Predicted Yield
                  </div>
                </div>
              </div>

              <p className="ai-note">
                These predictions are generated using AI/ML models trained on agricultural datasets.
              </p>
            </div>
          </>
        )}

        <div className="trust-note">
          🔒 This verification is secured by Ethereum blockchain technology.
        </div>

      </div>
    </div>
  );
};

export default VerifyBatch;