import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Web3 from "web3";
import "./FarmerBatchDetail.css";

const CONTRACT_ADDRESS = "0x826849f64E347BAA34a77360074E6569EaF0dDdd";
const SEPOLIA_CHAIN_ID = "0xaa36a7";

// 🔥 USE YOUR NEW DEPLOYED CONTRACT ABI HERE
const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_transporter",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_coldStorage",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_retailer",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "batchId",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "farmer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "BatchCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "batchId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "ColdChainViolation",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_batchId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_ipfsCID",
				"type": "string"
			},
			{
				"internalType": "bytes32",
				"name": "_merkleRoot",
				"type": "bytes32"
			}
		],
		"name": "createBatch",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_batchId",
				"type": "string"
			}
		],
		"name": "markColdChainViolation",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_batchId",
				"type": "string"
			}
		],
		"name": "sendToColdStorage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_batchId",
				"type": "string"
			}
		],
		"name": "sendToRetailer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_batchId",
				"type": "string"
			}
		],
		"name": "sendToTransporter",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "batchId",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "enum SpinachChain.BatchState",
				"name": "newState",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "StateUpdated",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "coldStorage",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_batchId",
				"type": "string"
			}
		],
		"name": "getBatch",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "enum SpinachChain.BatchState",
				"name": "",
				"type": "uint8"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "retailer",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "transporter",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const stateMap = [
  "Harvested",
  "InTransit",
  "InColdStorage",
  "Delivered",
  "Rejected"
];

const FarmerBatchDetail = () => {
  const { id } = useParams();

  const [batch, setBatch] = useState(null);
  const [blockchainOwner, setBlockchainOwner] = useState(null);
  const [blockchainState, setBlockchainState] = useState(null);
  const [existsOnChain, setExistsOnChain] = useState(false);
  const [sensorData, setSensorData] = useState([]);
  const [aiResult, setAiResult] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    await fetchBackendData();
    await fetchBlockchainData();
  };

  // ==============================
  // FETCH OFF-CHAIN DATA
  // ==============================
  const fetchBackendData = async () => {
    try {
      const batchRes = await axios.get(
        `http://localhost:5000/api/batch/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBatch(batchRes.data);

      const sensorRes = await axios.get(
        `http://localhost:5000/api/sensor-data/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSensorData(sensorRes.data);

      const aiRes = await axios.get(
        `http://localhost:5000/api/ai/analyze-batch/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiResult(aiRes.data);

    } catch (err) {
      console.error("Backend error:", err);
    }
  };

  // ==============================
  // FETCH BLOCKCHAIN DATA
  // ==============================
  const fetchBlockchainData = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const chainId = await window.ethereum.request({
        method: "eth_chainId"
      });

      if (chainId !== SEPOLIA_CHAIN_ID) {
        alert("Switch MetaMask to Sepolia");
        return;
      }

      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(
        CONTRACT_ABI,
        CONTRACT_ADDRESS
      );

      const data = await contract.methods.getBatch(id).call();

      setBlockchainOwner(data[4].toLowerCase());
      setBlockchainState(stateMap[data[6]]);
      setExistsOnChain(true);

    } catch (error) {
      console.log("Batch not on chain yet.");
      setExistsOnChain(false);
    }
  };

  // ==============================
  // CREATE BATCH ON BLOCKCHAIN
  // ==============================
  const handleCreateOnChain = async () => {
    if (!window.ethereum) return alert("Install MetaMask");

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(
        CONTRACT_ABI,
        CONTRACT_ADDRESS
      );

      await contract.methods
        .createBatch(
          id,
          batch?.ipfs_cid || "",
          batch?.merkle_root ||
            "0x0000000000000000000000000000000000000000000000000000000000000000"
        )
        .send({ from: accounts[0] });

      alert("✅ Created on blockchain");
      fetchBlockchainData();

    } catch (error) {
      console.error(error);
      alert("❌ Blockchain creation failed");
    }
  };

  // ==============================
  // FARMER → TRANSPORTER
  // ==============================
  const handleSendToTransporter = async () => {
    if (!window.ethereum) return alert("Install MetaMask");

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(
        CONTRACT_ABI,
        CONTRACT_ADDRESS
      );

      await contract.methods
        .sendToTransporter(id)
        .send({ from: accounts[0] });

      alert("✅ Sent to Transporter");
      fetchBlockchainData();

    } catch (error) {
      console.error(error);
      alert(error?.message || "❌ Transaction failed");
    }
  };

  if (!batch) return <div className="detail-container">Loading...</div>;

  return (
    <div className="detail-container">
      <h2>🌿 Batch Details - {id}</h2>

      {/* OFF-CHAIN */}
      <div className="card">
        <h3>📦 Off-Chain (IPFS + AI)</h3>
        <p><strong>IPFS CID:</strong> {batch.ipfs_cid}</p>
        <p><strong>Merkle Root:</strong> {batch.merkle_root}</p>
      </div>

      {/* BLOCKCHAIN */}
      <div className="card">
        <h3>🔗 Blockchain</h3>

        {!existsOnChain ? (
          <>
            <p>❌ Not yet created on blockchain</p>
            <button onClick={handleCreateOnChain}>
              Create on Blockchain
            </button>
          </>
        ) : (
          <>
            <p><strong>Owner:</strong> {blockchainOwner}</p>
            <p><strong>State:</strong> {blockchainState}</p>
          </>
        )}
      </div>

      {/* FARMER ACTION */}
      {existsOnChain && blockchainState === "Harvested" && (
        <div className="card">
          <h3>🚚 Send to Transporter</h3>
          <button onClick={handleSendToTransporter}>
            Send to Transporter
          </button>
        </div>
      )}

      {/* SENSOR DATA */}
      <div className="card">
        <h3>📊 IoT Data</h3>
        {sensorData.length === 0 ? (
          <p>No sensor data</p>
        ) : (
          sensorData.map((data, index) => (
            <div key={index}>
              🌡 {data.temperature}°C |
              💧 {data.humidity}% |
              🌱 {data.soil_moisture}%
            </div>
          ))
        )}
      </div>

      {/* AI RESULTS */}
      {aiResult && (
        <div className="card">
          <h3>🤖 AI Prediction</h3>
          <p>Health: {aiResult.health_score}%</p>
          <p>Disease: {aiResult.disease_probability}%</p>
          <p>Yield: {aiResult.predicted_yield} kg</p>
        </div>
      )}
    </div>
  );
};

export default FarmerBatchDetail;