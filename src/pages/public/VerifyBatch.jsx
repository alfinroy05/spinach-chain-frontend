import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
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

  const [metadata, setMetadata] = useState(null);
  const [blockchainData, setBlockchainData] = useState(null);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ipfsError, setIpfsError] = useState("");

  useEffect(() => {
    verifyBatch();
  }, [batchId]);

  const verifyBatch = async () => {
    try {
      const cleanId = batchId.trim();

      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        provider
      );

      const onChain = await contract.getBatch(cleanId);

      const ipfsCID = onChain[1];
      const stateIndex = Number(onChain[6]);
      const state = stateMap[stateIndex];
      const coldViolation = onChain[7];
      const harvestTime = Number(onChain[5]) * 1000;

      console.log("Blockchain CID:", ipfsCID);

      setBlockchainData({
        state,
        coldViolation,
        harvestTime,
        ipfsCID
      });

      setVerified(state === "Delivered");

      // 🔹 Fetch IPFS Metadata Safely
      if (ipfsCID && ipfsCID !== "") {
        try {
          const response = await fetch(
            `https://ipfs.io/ipfs/${ipfsCID}`
          );

          if (!response.ok) {
            throw new Error("IPFS fetch failed");
          }

          const text = await response.text();
          console.log("Raw IPFS:", text);

          const data = JSON.parse(text);
          setMetadata(data);
        } catch (ipfsErr) {
          console.error("IPFS Error:", ipfsErr);
          setIpfsError("⚠ Unable to load metadata from IPFS.");
        }
      } else {
        setIpfsError("⚠ No IPFS CID stored on blockchain.");
      }

    } catch (err) {
      console.error("Blockchain Error:", err);
      setError("Invalid QR code or product not found.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="verify-container">
        🔎 Verifying product on blockchain...
      </div>
    );

  if (error)
    return (
      <div className="verify-container error">
        ❌ {error}
      </div>
    );

  const ai = metadata?.ai_analysis;
  const sensors = metadata?.sensor_readings || [];
  const latestSensor =
    sensors.length > 0 ? sensors[sensors.length - 1] : null;

  return (
    <div className="verify-container">
      <div className="verify-card">

        <h1 className="title">🌿 Product Authenticity Verification</h1>

        {/* AUTHENTICITY */}
        {verified ? (
          <div className="verified-badge success">
            ✅ Authentic Product – Successfully Delivered
          </div>
        ) : (
          <div className="verified-badge warning">
            ⏳ Product Verified – Currently In Supply Chain
          </div>
        )}

        {/* BLOCKCHAIN INFO */}
        <div className="section">
          <h3>📦 Blockchain Record</h3>
          <p><strong>Batch ID:</strong> {batchId}</p>
          <p><strong>Current State:</strong> {blockchainData?.state}</p>
          <p>
            <strong>Cold Chain:</strong>{" "}
            {blockchainData?.coldViolation
              ? "⚠ Temperature Violation Detected"
              : "❄ Maintained Properly"}
          </p>
          <p>
            <strong>Harvest Timestamp:</strong>{" "}
            {new Date(blockchainData?.harvestTime).toLocaleString()}
          </p>
        </div>

        {/* IPFS ERROR */}
        {ipfsError && (
          <div className="section" style={{ color: "red" }}>
            {ipfsError}
          </div>
        )}

        {/* METADATA SECTION */}
        {metadata && (
          <>
            <div className="section">
              <h3>🌾 Farm Information</h3>
              <p><strong>Farm ID:</strong> {metadata.farm_id}</p>
              <p>
                <strong>Recorded On:</strong>{" "}
                {new Date(metadata.timestamp).toLocaleString()}
              </p>
            </div>

            {ai && (
              <div className="section ai-section">
                <h3>🤖 AI Quality Assessment</h3>

                <div className="ai-grid">
                  <div className="ai-card">
                    <div className="ai-value">{ai.grade}</div>
                    <div className="ai-label">Tomato Grade</div>
                  </div>

                  <div className="ai-card">
                    <div className="ai-value">
                      {(ai.confidence * 100).toFixed(2)}%
                    </div>
                    <div className="ai-label">Model Confidence</div>
                  </div>

                  <div className="ai-card">
                    <div className="ai-value">
                      {(ai.environmental_risk * 100).toFixed(2)}%
                    </div>
                    <div className="ai-label">Environmental Risk</div>
                  </div>

                  <div className="ai-card">
                    <div className="ai-value">
                      {(ai.health_score * 100).toFixed(2)}%
                    </div>
                    <div className="ai-label">Overall Health Score</div>
                  </div>
                </div>

                {ai.anomaly_detected && (
                  <p style={{ color: "red", marginTop: "12px" }}>
                    ⚠ Anomaly detected in crop health analysis.
                  </p>
                )}
              </div>
            )}

            {latestSensor && (
              <div className="section">
                <h3>🌡 IoT Sensor Summary</h3>
                <p><strong>Total Readings:</strong> {sensors.length}</p>
                <p><strong>Latest Temperature:</strong> {latestSensor.temperature} °C</p>
                <p><strong>Latest Humidity:</strong> {latestSensor.humidity} %</p>
                <p><strong>Nitrogen:</strong> {latestSensor.nitrogen}</p>
                <p><strong>Phosphorus:</strong> {latestSensor.phosphorus}</p>
                <p><strong>Potassium:</strong> {latestSensor.potassium}</p>
              </div>
            )}

            <div className="section transparency">
              <h3>🔍 Transparency & Proof</h3>
              <p><strong>IPFS CID:</strong> {blockchainData.ipfsCID}</p>
              <button
                onClick={() =>
                  window.open(
                    `https://ipfs.io/ipfs/${blockchainData.ipfsCID}`,
                    "_blank"
                  )
                }
              >
                View Raw Metadata
              </button>
            </div>
          </>
        )}

        <div className="trust-note">
          🔒 Secured & verified by Ethereum Blockchain + IPFS
        </div>

      </div>
    </div>
  );
};

export default VerifyBatch;