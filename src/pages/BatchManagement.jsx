import React, { useState, useEffect } from "react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import TransactionStatus from "../components/blockchain/TransactionStatus";
import useBlockchain from "../hooks/useBlockchain";
import { useBatch } from "../context/BatchContext";
import {
  createBatchAPI,
  finalizeBatchAPI,
  getAllBatchesAPI
} from "../services/api";
import "./BatchManagement.css";

const BatchManagement = () => {
  const { connectWallet, account, createBatch } = useBlockchain();
  const { selectedBatch, setSelectedBatch } = useBatch();

  const [isOpen, setIsOpen] = useState(false);
  const [newBatchId, setNewBatchId] = useState("");
  const [batches, setBatches] = useState([]);

  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  // 🔥 Load batches
  useEffect(() => {
    const loadBatches = async () => {
      try {
        const result = await getAllBatchesAPI();
        setBatches(result.batches || []);
      } catch (err) {
        console.error("Failed to load batches", err);
      }
    };

    loadBatches();
  }, []);

  // ✅ CREATE BATCH (DB ONLY)
  const handleCreateBatch = async () => {
    try {
      if (!account) {
        alert("Connect wallet first");
        return;
      }

      if (!newBatchId.trim()) {
        alert("Enter Batch ID");
        return;
      }

      setStatus("pending");

      await createBatchAPI(newBatchId, account);

      const result = await getAllBatchesAPI();
      setBatches(result.batches || []);

      setSelectedBatch(newBatchId);

      setMessage("Batch created successfully (DB).");
      setStatus("success");
      setIsOpen(false);
      setNewBatchId("");

    } catch (error) {
      console.error("Create Batch Error:", error);
      setStatus("error");
      setMessage("Batch creation failed.");
    }
  };

  // 🔥 FINALIZE + CREATE ON BLOCKCHAIN
  const handleFinalizeBatch = async () => {
    try {
      if (!account) {
        alert("Connect wallet first");
        return;
      }

      if (!selectedBatch) {
        alert("Please select a batch first.");
        return;
      }

      setStatus("pending");
      setMessage("Finalizing batch...");

      // 1️⃣ Backend Finalize (IPFS + Merkle)
      const data = await finalizeBatchAPI(selectedBatch);

      const ipfsCID = data.ipfs_cid;
      const merkleRoot = data.merkle_root;

      if (!ipfsCID || !merkleRoot) {
        throw new Error("Invalid finalize response");
      }

      // 🔥 IMPORTANT FIX: Ensure 0x prefix for bytes32
      const formattedMerkleRoot = merkleRoot.startsWith("0x")
        ? merkleRoot
        : "0x" + merkleRoot;

      console.log("IPFS CID:", ipfsCID);
      console.log("Merkle Root:", formattedMerkleRoot);

      // 2️⃣ Blockchain Create Batch
      await createBatch(
        selectedBatch,
        ipfsCID,
        formattedMerkleRoot
      );

      setMessage("Batch finalized and stored on blockchain successfully!");
      setStatus("success");

    } catch (error) {
      console.error("Finalize Blockchain Error:", error);
      setStatus("error");
      setMessage("Transaction Failed. Check MetaMask for details.");
    }
  };

  return (
    <div className="batch-container">
      <h1>📦 Spinach Batch Management</h1>

      {/* Batch Selector */}
      <div className="batch-selector">
        <label>Select Batch:</label>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          <option value="">-- Select Batch --</option>
          {batches.map((batch) => (
            <option key={batch.batch_id} value={batch.batch_id}>
              {batch.batch_id}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="batch-actions">
        <Button onClick={connectWallet}>
          🔗 Connect Wallet
        </Button>

        <Button onClick={() => setIsOpen(true)}>
          ➕ Create New Batch
        </Button>

        <Button onClick={handleFinalizeBatch}>
          🚀 Finalize Batch
        </Button>
      </div>

      {selectedBatch && (
        <p className="selected-batch">
          Current Batch: <strong>{selectedBatch}</strong>
        </p>
      )}

      <TransactionStatus status={status} message={message} />

      {/* Create Batch Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Spinach Batch"
      >
        <div className="form-group">
          <label>Batch ID</label>
          <input
            type="text"
            value={newBatchId}
            onChange={(e) => setNewBatchId(e.target.value)}
            placeholder="SPINACH_001"
          />
        </div>

        <Button onClick={handleCreateBatch}>
          Submit Batch
        </Button>
      </Modal>
    </div>
  );
};

export default BatchManagement;