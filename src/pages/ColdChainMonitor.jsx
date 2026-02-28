import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import useSensorData from "../hooks/useSensorData";
import { useBatch } from "../context/BatchContext";
import InfoCard from "../components/ui/InfoCard";
import AlertBox from "../components/ui/AlertBox";
import SensorChart from "../components/charts/SensorChart";
import contractABI from "../abi/SpinachChain.json";
import "./ColdChainMonitor.css";

const CONTRACT_ADDRESS = "0x826849f64E347BAA34a77360074E6569EaF0dDdd";
const SEPOLIA_CHAIN_ID = 11155111;

const stateMap = [
  "Harvested",
  "InTransit",
  "InColdStorage",
  "Delivered",
  "Rejected"
];

const ColdChainMonitor = () => {
  const { selectedBatch } = useBatch();
  const { sensorData, latestData, loading, error } =
    useSensorData(selectedBatch);

  const [contract, setContract] = useState(null);
  const [wallet, setWallet] = useState("");
  const [batchState, setBatchState] = useState(null);
  const [batchOwner, setBatchOwner] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (selectedBatch) {
      initBlockchain();
    }
  }, [selectedBatch]);

  const initBlockchain = async () => {
    if (!window.ethereum) return;

    await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();

    if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
      alert("Switch MetaMask to Sepolia network.");
      return;
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setWallet(address);

    const contractInstance = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractABI,
      signer
    );

    setContract(contractInstance);

    const data = await contractInstance.getBatch(selectedBatch);
    setBatchOwner(data[4].toLowerCase());
    setBatchState(stateMap[data[6]]);
  };

  if (!selectedBatch) {
    return (
      <div className="coldchain-container">
        <h1>❄ Cold Chain Monitor</h1>
        <p>Please select a batch from Dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="coldchain-container">
        <h1>❄ Cold Chain Monitor</h1>
        <p>Loading cold chain data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="coldchain-container">
        <h1>❄ Cold Chain Monitor</h1>
        <AlertBox type="danger" message={error} />
      </div>
    );
  }

  const temperature = latestData?.temp || 0;
  const humidity = latestData?.humidity || 0;

  let alertType = "success";
  let alertMessage = "Cold chain conditions are stable.";

  if (temperature > 10) {
    alertType = "danger";
    alertMessage =
      "Temperature exceeded safe limit! Risk of spoilage.";
  } else if (temperature > 6) {
    alertType = "warning";
    alertMessage =
      "Temperature slightly high. Monitor closely.";
  }

  // =====================================================
  // SEND TO RETAILER (ColdStorage → Retailer)
  // =====================================================
  const handleSendToRetailer = async () => {
    if (!contract) return;

    try {
      setActionLoading(true);

      const tx = await contract.sendToRetailer(selectedBatch);
      await tx.wait();

      alert("✅ Sent to Retailer");
      initBlockchain();

    } catch (err) {
      console.error(err);
      alert(err.reason || err.message || "Transaction failed");
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // MARK COLD CHAIN VIOLATION (Admin Only)
  // =====================================================
  const handleMarkViolation = async () => {
    if (!contract) return;

    try {
      setActionLoading(true);

      const tx = await contract.markColdChainViolation(selectedBatch);
      await tx.wait();

      alert("⚠ Cold Chain Violation Recorded");

    } catch (err) {
      console.error(err);
      alert(err.reason || err.message || "Transaction failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="coldchain-container">
      <h1>❄ Cold Chain Monitor</h1>

      <div className="card-grid">
        <InfoCard
          title="Storage Temperature"
          value={`${temperature} °C`}
          icon="🌡"
          status={alertType}
        />

        <InfoCard
          title="Humidity Level"
          value={`${humidity}%`}
          icon="💧"
          status="normal"
        />
      </div>

      <AlertBox type={alertType} message={alertMessage} />

      <SensorChart data={sensorData} />

      {/* Blockchain Section */}
      <div className="blockchain-section">
        <h3>🔗 Blockchain Status</h3>
        <p><strong>Owner:</strong> {batchOwner}</p>
        <p><strong>State:</strong> {batchState}</p>
      </div>

      {/* ColdStorage Action */}
      {batchState === "InColdStorage" &&
        batchOwner === wallet?.toLowerCase() && (
          <div className="action-section">
            <button
              disabled={actionLoading}
              onClick={handleSendToRetailer}
            >
              {actionLoading ? "Processing..." : "Send to Retailer"}
            </button>
          </div>
        )}

      {/* Auto Violation Button if High Temp */}
      {temperature > 10 && (
        <div className="action-section">
          <button
            disabled={actionLoading}
            onClick={handleMarkViolation}
          >
            Record Cold Chain Violation
          </button>
        </div>
      )}
    </div>
  );
};

export default ColdChainMonitor;