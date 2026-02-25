import React, { useState, useEffect } from "react";
import { useBlockchainContext } from "../context/BlockchainContext";


const SupplyChain = () => {
  const {
    account,
    connectWallet,
    contract,
    transferOwnership
  } = useBlockchainContext();

  const [batchId, setBatchId] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [batchData, setBatchData] = useState(null);
  const [ownershipHistory, setOwnershipHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Fetch Batch Info
  // -----------------------------
  const fetchBatch = async (id) => {
    if (!contract || !id) return;

    try {
      const batch = await contract.getBatch(id);

      setBatchData({
        batchId: batch[0],
        ipfsCID: batch[1],
        merkleRoot: batch[2],
        owner: batch[3],
        state: Number(batch[4])
      });

    } catch (err) {
      console.error("Error fetching batch:", err);
      setBatchData(null);
    }
  };

  // -----------------------------
  // Fetch Ownership History
  // -----------------------------
  const fetchOwnershipHistory = async (id) => {
    if (!contract || !id) return;

    try {
      const filter = contract.filters.OwnershipTransferred(id);
      const events = await contract.queryFilter(filter);

      const history = events.map((event) => ({
        from: event.args.from,
        to: event.args.to,
        state: Number(event.args.newState)
      }));

      setOwnershipHistory(history);
    } catch (err) {
      console.error("Error fetching ownership history:", err);
    }
  };

  // -----------------------------
  // Handle Transfer
  // -----------------------------
  const handleTransfer = async () => {
    if (!batchId || !newOwner) {
      alert("Enter Batch ID and New Owner Address");
      return;
    }

    try {
      setLoading(true);

      const tx = await transferOwnership(batchId, newOwner);

      alert("Transfer Successful!\nTx Hash:\n" + tx);

      await fetchBatch(batchId);
      await fetchOwnershipHistory(batchId);

      setNewOwner("");
      setLoading(false);

    } catch (err) {
      console.error(err);
      alert("Transfer Failed");
      setLoading(false);
    }
  };

  // -----------------------------
  // Fetch When Batch Changes
  // -----------------------------
  useEffect(() => {
    if (batchId && contract) {
      fetchBatch(batchId);
      fetchOwnershipHistory(batchId);
    }
  }, [batchId, contract]);

  // -----------------------------
  // Convert State Enum
  // -----------------------------
  const getStateLabel = (state) => {
    switch (state) {
      case 0:
        return "Created (Farmer)";
      case 1:
        return "Processed";
      case 2:
        return "Distributed";
      case 3:
        return "Retail";
      default:
        return "Unknown";
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>🚚 Spinach Supply Chain</h2>

      {/* Connect Wallet */}
      {!account ? (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <p>
          Connected: {account.slice(0, 6)}...
          {account.slice(-4)}
        </p>
      )}

      <hr />

      {/* Batch Input */}
      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Enter Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          style={{ padding: "10px", width: "300px" }}
        />
      </div>

      {/* Batch Details */}
      {batchData && (
        <div style={{ marginTop: "20px" }}>
          <h3>📦 Batch Details</h3>
          <p><strong>Batch ID:</strong> {batchData.batchId}</p>
          <p><strong>Current Owner:</strong> {batchData.owner}</p>
          <p><strong>Stage:</strong> {getStateLabel(batchData.state)}</p>
          <p><strong>IPFS CID:</strong> {batchData.ipfsCID}</p>
          <p><strong>Merkle Root:</strong> {batchData.merkleRoot}</p>
        </div>
      )}

      {/* Ownership History */}
      {ownershipHistory.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>🔄 Ownership History</h3>
          {ownershipHistory.map((item, index) => (
            <div
              key={index}
              style={{
                background: "#f2f2f2",
                padding: "10px",
                marginBottom: "10px"
              }}
            >
              <p><strong>Stage:</strong> {getStateLabel(item.state)}</p>
              <p><strong>From:</strong> {item.from}</p>
              <p><strong>To:</strong> {item.to}</p>
            </div>
          ))}
        </div>
      )}

      <hr />

      {/* Transfer Ownership */}
      {account && (
        <div style={{ marginTop: "20px" }}>
          <h3>🔁 Transfer Ownership</h3>

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
            {loading ? "Transferring..." : "Transfer Batch"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SupplyChain;