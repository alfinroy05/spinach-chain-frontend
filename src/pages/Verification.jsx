import React, { useState } from "react";
import Button from "../components/ui/Button";
import AlertBox from "../components/ui/AlertBox";
import useBlockchain from "../hooks/useBlockchain";
import "./Verification.css";

const Verification = () => {
  const { connectWallet, account, contract } = useBlockchain();

  const [batchId, setBatchId] = useState("");
  const [batchData, setBatchData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    try {
      setError("");
      setBatchData(null);

      if (!account) {
        setError("Please connect wallet first");
        return;
      }

      if (!contract) {
        setError("Blockchain not initialized");
        return;
      }

      if (!batchId.trim()) {
        setError("Enter Batch ID");
        return;
      }

      setLoading(true);

      console.log("Verifying:", batchId);

      // 🔥 Read from blockchain
      const batch = await contract.getBatch(batchId);

      const ipfsCID = batch[1];
      const merkleRoot = batch[2];
      const farmer = batch[3];
      const currentOwner = batch[4];
      const state = Number(batch[6]);
      const coldViolation = batch[7];

      // 🔥 Fetch IPFS
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsCID}`);
      const ipfsData = await response.json();

      setBatchData({
        batchId,
        farmer,
        currentOwner,
        state,
        coldViolation,
        ipfsCID,
        merkleRoot,
        ipfsData
      });

      setLoading(false);

    } catch (err) {
      console.error("Verification Error:", err);
      setError("Batch not found on blockchain");
      setLoading(false);
    }
  };

  const getStateLabel = (state) => {
    switch (state) {
      case 0: return "Harvested";
      case 1: return "In Transit";
      case 2: return "In Cold Storage";
      case 3: return "Delivered";
      case 4: return "Rejected";
      default: return "Unknown";
    }
  };

  return (
    <div className="verify-container">
      <h1>🔎 Blockchain Product Verification</h1>

      {!account ? (
        <Button onClick={connectWallet}>
          Connect Wallet
        </Button>
      ) : (
        <p>Connected: {account.slice(0,6)}...{account.slice(-4)}</p>
      )}

      <div className="verify-box">
        <input
          type="text"
          placeholder="Enter Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
        />

        <Button onClick={handleVerify}>
          {loading ? "Verifying..." : "Verify Batch"}
        </Button>
      </div>

      {error && <AlertBox type="danger" message={error} />}

      {batchData && (
        <div className="verify-result">
          <h3>🌿 Blockchain Verified Data</h3>

          <p><strong>Batch ID:</strong> {batchData.batchId}</p>
          <p><strong>Farmer:</strong> {batchData.farmer}</p>
          <p><strong>Current Owner:</strong> {batchData.currentOwner}</p>
          <p><strong>Stage:</strong> {getStateLabel(batchData.state)}</p>
          <p>
            <strong>Cold Chain Violation:</strong>{" "}
            {batchData.coldViolation ? "YES ⚠️" : "No"}
          </p>
          <p><strong>IPFS CID:</strong> {batchData.ipfsCID}</p>

          <h4>📦 IPFS Data:</h4>
          <pre>
            {JSON.stringify(batchData.ipfsData, null, 2)}
          </pre>

          <AlertBox
            type="success"
            message="Verified successfully on blockchain."
          />
        </div>
      )}
    </div>
  );
};

export default Verification;