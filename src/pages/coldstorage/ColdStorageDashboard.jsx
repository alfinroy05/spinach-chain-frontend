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
            coldStorageOwned.push({
              batch_id: batch.batch_id,
              state,
              cold_chain_violated: violated
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
        batches.map((batch) => (
          <div key={batch.batch_id} className="cold-card">

            <p><strong>Batch ID:</strong> {batch.batch_id}</p>
            <p><strong>State:</strong> {batch.state}</p>

            <p>
              <strong>Cold Chain:</strong>{" "}
              {batch.cold_chain_violated
                ? "⚠ Violation"
                : "✅ Safe"}
            </p>

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
        ))
      )}
    </div>
  );
};

export default ColdStorageDashboard;