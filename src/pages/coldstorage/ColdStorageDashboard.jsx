import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import contractABI from "../../contracts/abi.json";
import "./ColdStorageDashboard.css";

const CONTRACT_ADDRESS = "0x826849f64E347BAA34a77360074E6569EaF0dDdd";
const API_BASE = "http://localhost:5000/api";
const SEPOLIA_CHAIN_ID = 11155111;

const stateMap = [
  "Harvested",
  "InTransit",
  "InColdStorage",
  "Delivered",
  "Rejected"
];

const ColdStorageDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [wallet, setWallet] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask not installed.");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        setError("Please switch MetaMask to Sepolia network.");
        return;
      }

      const signer = await provider.getSigner();
      const address = (await signer.getAddress()).toLowerCase();
      setWallet(address);

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer
      );

      setContract(contractInstance);

      await fetchColdStorageBatches(contractInstance, address);

    } catch (err) {
      console.error(err);
      setError("Initialization failed.");
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // FETCH ONLY BATCHES OWNED BY COLD STORAGE (ON-CHAIN)
  // ==================================================
  const fetchColdStorageBatches = async (contractInstance, currentWallet) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Login expired. Please login again.");
        return;
      }

      const res = await axios.get(`${API_BASE}/batches`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const backendBatches = res.data || [];
      const coldStorageOwned = [];

      for (let batch of backendBatches) {
        try {
          const data = await contractInstance.getBatch(batch.batch_id);

          const owner = data[4].toLowerCase();
          const stateIndex = Number(data[6]);
          const violated = data[7];
          const state = stateMap[stateIndex];

          if (
            owner === currentWallet &&
            state === "InColdStorage"
          ) {

            let sensor = null;

            try {
              const sensorRes = await axios.get(
                `${API_BASE}/sensor-data/${batch.batch_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              const readings =
                sensorRes.data?.sensor_readings || [];

              if (readings.length > 0) {
                sensor = readings[readings.length - 1];
              }

            } catch {}

            coldStorageOwned.push({
              batch_id: batch.batch_id,
              state,
              cold_chain_violated: violated,

              // timestamps
              harvestTime: batch.harvest_timestamp,
              createdAt: batch.created_at,

              // IPFS
              ipfs: batch.ipfs_cid,

              // AI results
              healthScore: batch.health_score,
              diseaseRisk: batch.disease_probability,
              envRisk: batch.environmental_risk,
              diseaseClass: batch.disease_class,
              anomaly: batch.anomaly_detected,

              // sensor
              sensor
            });
          }

        } catch (err) {
          console.log("Not on chain:", batch.batch_id);
        }
      }

      setBatches(coldStorageOwned);

    } catch (err) {
      console.error(err);
      setError("Failed to fetch batches.");
    }
  };

  // ==================================================
  // SEND TO RETAILER
  // ==================================================
  const handleSendToRetailer = async (batchId) => {
    try {
      if (!contract) return;

      setActionLoading(batchId);

      const tx = await contract.sendToRetailer(batchId);
      await tx.wait();

      alert("✅ Sent to Retailer (On-Chain)");

      await fetchColdStorageBatches(contract, wallet);

    } catch (err) {
      console.error(err);
      alert(err.reason || err.message || "Transaction failed");
    } finally {
      setActionLoading(null);
    }
  };

  // ==================================================
  // MARK COLD CHAIN VIOLATION (ADMIN ONLY)
  // ==================================================
  const handleFlagViolation = async (batchId) => {
    try {
      if (!contract) return;

      setActionLoading(batchId);

      const tx = await contract.markColdChainViolation(batchId);
      await tx.wait();

      alert("⚠ Cold Chain Violation Recorded (On-Chain)");

      await fetchColdStorageBatches(contract, wallet);

    } catch (err) {
      console.error(err);
      alert(err.reason || err.message || "Only Admin can mark violation");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading)
    return <div className="cold-container">Loading...</div>;

  if (error)
    return <div className="cold-container error">{error}</div>;

  return (
    <div className="cold-container">
      <h2>❄ Cold Storage Dashboard (Decentralized)</h2>
      <p><strong>Connected Wallet:</strong> {wallet}</p>

      {batches.length === 0 ? (
        <p>No batches assigned to this cold storage wallet.</p>
      ) : (
        batches.map((batch) => {

          const harvestAge =
            batch.harvestTime
              ? Math.floor(
                  (Date.now() - new Date(batch.harvestTime)) /
                  (1000 * 60 * 60)
                )
              : null;

          return (
            <div key={batch.batch_id} className="cold-card">

              <p><strong>Batch ID:</strong> {batch.batch_id}</p>
              <p><strong>State:</strong> {batch.state}</p>

              <p>
                <strong>Cold Chain:</strong>{" "}
                {batch.cold_chain_violated
                  ? "⚠ Violation"
                  : "✅ Safe"}
              </p>

              <p>
                <strong>Harvested:</strong>{" "}
                {batch.harvestTime
                  ? new Date(batch.harvestTime).toLocaleString()
                  : "N/A"}
              </p>

              {harvestAge !== null && (
                <p><strong>Crop Age:</strong> {harvestAge} hours</p>
              )}

              <p>
                <strong>Recorded:</strong>{" "}
                {batch.createdAt
                  ? new Date(batch.createdAt).toLocaleString()
                  : "N/A"}
              </p>

              {/* SENSOR DATA */}
              {batch.sensor && (
                <div className="sensor-summary">

                  <p><strong>Latest Environmental Condition</strong></p>

                  <p>🌡 Temperature: {batch.sensor.temperature} °C</p>
                  <p>💧 Humidity: {batch.sensor.humidity} %</p>
                  <p>🌱 Nitrogen: {batch.sensor.nitrogen}</p>
                  <p>🌱 Phosphorus: {batch.sensor.phosphorus}</p>
                  <p>🌱 Potassium: {batch.sensor.potassium}</p>

                  <p>
                    <small>
                      Sensor Time:{" "}
                      {new Date(
                        batch.sensor.created_at
                      ).toLocaleString()}
                    </small>
                  </p>

                </div>
              )}

              {/* AI ANALYSIS */}
              {batch.healthScore !== undefined && (
                <div className="ai-summary">

                  <p><strong>AI Crop Analysis</strong></p>

                  {batch.diseaseClass && (
                    <p>🍅 Crop Grade: {batch.diseaseClass}</p>
                  )}

                  {batch.healthScore !== null && (
                    <p>
                      ❤️ Health Score: {(batch.healthScore * 100).toFixed(1)}%
                    </p>
                  )}

                  {batch.diseaseRisk !== null && (
                    <p>
                      ⚠ Disease Risk: {(batch.diseaseRisk * 100).toFixed(1)}%
                    </p>
                  )}

                  {batch.envRisk !== null && (
                    <p>
                      🌱 Environmental Risk: {(batch.envRisk * 100).toFixed(1)}%
                    </p>
                  )}

                  {batch.anomaly && (
                    <p style={{color:"red"}}>
                      ⚠ Anomaly detected in crop condition
                    </p>
                  )}

                </div>
              )}

              {/* IPFS */}
              {batch.ipfs && (
                <p>
                  <strong>IPFS Metadata:</strong>{" "}
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${batch.ipfs}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Data
                  </a>
                </p>
              )}

              <div className="button-group">

                <button
                  disabled={actionLoading === batch.batch_id}
                  onClick={() =>
                    handleSendToRetailer(batch.batch_id)
                  }
                >
                  {actionLoading === batch.batch_id
                    ? "Processing..."
                    : "Send to Retailer"}
                </button>

                <button
                  className="danger-btn"
                  disabled={actionLoading === batch.batch_id}
                  onClick={() =>
                    handleFlagViolation(batch.batch_id)
                  }
                >
                  Flag Violation
                </button>

              </div>

            </div>
          );
        })
      )}
    </div>
  );
};

export default ColdStorageDashboard;