import React, { useState, useEffect } from "react";
import useBlockchain from "../hooks/useBlockchain";

const SupplyChain = () => {
  const {
    account,
    connectWallet,
    getBatch,
    transferOwnership,
    updateState
  } = useBlockchain();

  const [batchId, setBatchId] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // ROLE → STATE INDEX
  // --------------------------------------------------
  const roleToState = {
    Transporter: 1,     // InTransit
    ColdStorage: 2,     // InColdStorage
    Retailer: 3         // Delivered
  };

  const stateLabels = [
    "Harvested (Farmer)",
    "In Transit (Transporter)",
    "In Cold Storage",
    "Delivered (Retailer)",
    "Rejected"
  ];

  // --------------------------------------------------
  // FETCH BATCH
  // --------------------------------------------------
  const fetchBatch = async (id) => {
    try {
      const batch = await getBatch(id);

      setBatchData({
        batchId: batch[0],
        ipfsCID: batch[1],
        merkleRoot: batch[2],
        farmer: batch[3],
        currentOwner: batch[4],
        harvestTimestamp: batch[5],
        state: Number(batch[6]),
        coldChainViolated: batch[7]
      });

    } catch (err) {
      console.error("Fetch Batch Error:", err);
      setBatchData(null);
    }
  };

  // --------------------------------------------------
  // LOAD WHEN ID CHANGES
  // --------------------------------------------------
  useEffect(() => {
    if (batchId) {
      fetchBatch(batchId);
    }
  }, [batchId]);

  // --------------------------------------------------
  // HANDLE TRANSFER + UPDATE STATE
  // --------------------------------------------------
  const handleTransfer = async () => {
    if (!batchId || !newOwner || !selectedRole) {
      alert("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      const nextState = roleToState[selectedRole];

      // 🚨 Prevent skipping stages
      if (nextState !== batchData.state + 1) {
        alert("You must move to the next stage sequentially.");
        setLoading(false);
        return;
      }

      // 1️⃣ Transfer ownership
      const tx1 = await transferOwnership(batchId, newOwner);
      console.log("Ownership Tx:", tx1);

      // 2️⃣ Update stage
      const tx2 = await updateState(batchId, nextState);
      console.log("State Tx:", tx2);

      alert("Ownership transferred & stage updated!");

      setNewOwner("");
      setSelectedRole("");

      await fetchBatch(batchId);

      setLoading(false);

    } catch (err) {
      console.error(err);
      alert("Transfer failed");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>🚚 Spinach Supply Chain Lifecycle</h2>

      {!account ? (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <p>
          Connected: {account.slice(0,6)}...
          {account.slice(-4)}
        </p>
      )}

      <hr />

      {/* Batch Input */}
      <input
        type="text"
        placeholder="Enter Batch ID"
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
        style={{ padding: "10px", width: "300px" }}
      />

      {/* Batch Details */}
      {batchData && (
        <div style={{ marginTop: "20px" }}>
          <h3>📦 Batch Details</h3>

          <p><strong>Batch ID:</strong> {batchData.batchId}</p>
          <p><strong>Farmer:</strong> {batchData.farmer}</p>
          <p><strong>Current Owner:</strong> {batchData.currentOwner}</p>
          <p><strong>Stage:</strong> {stateLabels[batchData.state]}</p>
          <p><strong>Cold Chain Violation:</strong> {batchData.coldChainViolated ? "YES ⚠️" : "No"}</p>
          <p><strong>IPFS CID:</strong> {batchData.ipfsCID}</p>
          <p><strong>Merkle Root:</strong> {batchData.merkleRoot}</p>
        </div>
      )}

      <hr />

      {/* Transfer Section */}
      {account && batchData && (
        <div style={{ marginTop: "20px" }}>
          <h3>🔁 Transfer to Next Stage</h3>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{ padding: "10px", width: "250px" }}
          >
            <option value="">Select Next Role</option>
            <option value="Transporter">Transporter</option>
            <option value="ColdStorage">Cold Storage</option>
            <option value="Retailer">Retailer</option>
          </select>

          <br /><br />

          <input
            type="text"
            placeholder="New Owner Address"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            style={{ padding: "10px", width: "300px" }}
          />

          <br /><br />

          <button
            onClick={handleTransfer}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: "green",
              color: "white",
              border: "none"
            }}
          >
            {loading ? "Processing..." : "Transfer & Update Stage"}
          </button>
        </div>
      )}

      {/* Timeline */}
      {batchData && (
        <div style={{ marginTop: "40px" }}>
          <h3>📊 Supply Chain Timeline</h3>

          {stateLabels.map((label, index) => (
            <div
              key={index}
              style={{
                padding: "10px",
                background:
                  index <= batchData.state
                    ? "#d4edda"
                    : "#f2f2f2",
                marginBottom: "5px",
                fontWeight:
                  index === batchData.state
                    ? "bold"
                    : "normal"
              }}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplyChain;