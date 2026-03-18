import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Web3 from "web3";
import "./FarmerBatchDetail.css";

const CONTRACT_ADDRESS = "0x826849f64E347BAA34a77360074E6569EaF0dDdd";
const SEPOLIA_CHAIN_ID = "0xaa36a7";
const API_BASE = process.env.REACT_APP_API_URL || "";
/* ===== ABI (UNCHANGED) ===== */
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
]



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
	const [sensorData, setSensorData] = useState([]);
	const [aiResult, setAiResult] = useState(null);
	const [selectedImage, setSelectedImage] = useState(null);
	const [loadingAI, setLoadingAI] = useState(false);

	const [blockchainOwner, setBlockchainOwner] = useState(null);
	const [blockchainState, setBlockchainState] = useState(null);
	const [existsOnChain, setExistsOnChain] = useState(false);
	const [currentAccount, setCurrentAccount] = useState(null);

	const token = localStorage.getItem("token");

	useEffect(() => {
		initialize(); // first load

		const interval = setInterval(() => {
			fetchBackendData();   // 🔥 this is the key line
		}, 10000); // every 10 seconds

		return () => clearInterval(interval);
	}, []);

	const initialize = async () => {
		await fetchBackendData();
		await fetchBlockchainData();
	};

	/* ==============================
	   BACKEND DATA
	============================== */
	const fetchBackendData = async () => {
		try {
			const batchRes = await axios.get(
				`${API_BASE}/batch/${id}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setBatch(batchRes.data);

			const sensorRes = await axios.get(
				`${API_BASE}/sensor-data/${id}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			const readings =
				sensorRes.data?.sensor_readings || sensorRes.data;

			setSensorData(Array.isArray(readings) ? readings : []);
		} catch (err) {
			console.error("Backend error:", err);
			setSensorData([]);
		}
	};

	/* ==============================
	   RUN AI
	============================== */
	const handleRunAI = async () => {
		if (!selectedImage) return alert("Upload tomato image");

		try {
			setLoadingAI(true);

			const formData = new FormData();
			formData.append("image", selectedImage);

			const response = await axios.post(
				`${API_BASE}/predict/${id}`,
				formData,
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			setAiResult(response.data.ai_analysis);
			alert("✅ AI Prediction Completed");

		} catch (error) {
			console.error(error);
			alert("❌ AI prediction failed");
		} finally {
			setLoadingAI(false);
		}
	};

	/* ==============================
	   BLOCKCHAIN FETCH
	============================== */
	const fetchBlockchainData = async () => {
		if (!window.ethereum) return;

		try {
			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts"
			});

			setCurrentAccount(accounts[0].toLowerCase());

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

		} catch {
			setExistsOnChain(false);
		}
	};

	/* ==============================
	   CREATE ON BLOCKCHAIN
	============================== */
	const handleCreateOnChain = async () => {
		try {
			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts"
			});

			const web3 = new Web3(window.ethereum);
			const contract = new web3.eth.Contract(
				CONTRACT_ABI,
				CONTRACT_ADDRESS
			);

			// Ensure merkle root is proper bytes32
			const formattedMerkleRoot = batch?.merkle_root
				? batch.merkle_root.startsWith("0x")
					? batch.merkle_root
					: "0x" + batch.merkle_root
				: "0x0000000000000000000000000000000000000000000000000000000000000000";

			await contract.methods
				.createBatch(
					id,
					batch?.ipfs_cid || "",
					formattedMerkleRoot
				)
				.send({ from: accounts[0] });

			alert("✅ Created on Blockchain");
			fetchBlockchainData();

		} catch (err) {
			console.error(err);
			alert("❌ Blockchain transaction failed");
		}
	};

	/* ==============================
	   SEND TO TRANSPORTER
	============================== */
	const handleSendToTransporter = async () => {
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

		} catch (err) {
			console.error(err);
			alert("❌ Transfer failed");
		}
	};

	if (!batch) return <div className="detail-container">Loading...</div>;

	const latest =
		sensorData.length > 0
			? sensorData[sensorData.length - 1]
			: null;

	return (
		<div className="detail-container">
			<h2>🌿 Batch Details - {id}</h2>

			{/* OFF-CHAIN */}
			<div className="card">
				<h3>📦 Off-Chain</h3>
				<p><strong>IPFS CID:</strong> {batch.ipfs_cid}</p>
				<p><strong>Merkle Root:</strong> {batch.merkle_root}</p>
			</div>

			{/* BLOCKCHAIN */}
			<div className="card">
				<h3>🔗 Blockchain Status</h3>

				{!existsOnChain ? (
					<>
						<p>❌ Not created on blockchain</p>
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

			{existsOnChain &&
				blockchainState === "Harvested" &&
				blockchainOwner === currentAccount && (
					<div className="card">
						<h3>🚚 Transfer</h3>
						<button onClick={handleSendToTransporter}>
							Send to Transporter
						</button>
					</div>
				)}

			{/* SENSOR CARD */}
			<div className="card sensor-card">
				<div className="sensor-header">
					<h3>🌿 Live Farm Sensor Data</h3>
					<span className="live-indicator">🟢 Live</span>
				</div>

				{latest ? (
					<div className="sensor-grid">

						{/* Temperature */}
						<div className="sensor-item">
							<div className="sensor-icon">🌡</div>
							<div className="sensor-data">
								<p className="sensor-label">Temperature</p>
								<p className="sensor-value">
									{latest.temperature ?? "N/A"}°C
								</p>
							</div>
						</div>

						{/* Humidity */}
						<div className="sensor-item">
							<div className="sensor-icon">💧</div>
							<div className="sensor-data">
								<p className="sensor-label">Humidity</p>
								<p className="sensor-value">
									{latest.humidity ?? "N/A"}%
								</p>
							</div>
						</div>

						{/* Nitrogen */}
						<div className="sensor-item">
							<div className="sensor-icon">🌿</div>
							<div className="sensor-data">
								<p className="sensor-label">Nitrogen</p>
								<p className="sensor-value">
									{latest.nitrogen ?? "N/A"}
								</p>
							</div>
						</div>

						{/* Phosphorus */}
						<div className="sensor-item">
							<div className="sensor-icon">🧪</div>
							<div className="sensor-data">
								<p className="sensor-label">Phosphorus</p>
								<p className="sensor-value">
									{latest.phosphorus ?? "N/A"}
								</p>
							</div>
						</div>

						{/* Potassium */}
						<div className="sensor-item">
							<div className="sensor-icon">🌾</div>
							<div className="sensor-data">
								<p className="sensor-label">Potassium</p>
								<p className="sensor-value">
									{latest.potassium ?? "N/A"}
								</p>
							</div>
						</div>

					</div>
				) : (
					<p className="no-data">No sensor data available</p>
				)}
			</div>

			{/* AI IMAGE INPUT */}
			<div className="card">
				<h3>📷 Tomato Leaf Analysis</h3>

				<div className="upload-options">

					{/* Upload Image */}


					{/* Take Photo */}
					<label className="upload-btn camera">
						📸 Take Photo
						<input
							type="file"
							accept="image/*"
							capture="environment"
							onChange={(e) => {
								const file = e.target.files[0];
								if (file) setSelectedImage(file);
							}}
							hidden
						/>
					</label>

				</div>

				{/* Image Preview */}
				{selectedImage && (
					<div style={{ marginTop: "12px" }}>
						<p style={{ fontSize: "0.9rem", marginBottom: "6px" }}>
							Selected: {selectedImage.name}
						</p>

						<img
							src={URL.createObjectURL(selectedImage)}
							alt="leaf preview"
							className="image-preview"
						/>
					</div>
				)}

				{/* Run AI Button */}
				<button
					onClick={handleRunAI}
					disabled={loadingAI || !selectedImage}
				>
					{loadingAI ? "Processing..." : "Run AI Prediction"}
				</button>
			</div>
			{/* AI RESULTS */}
			{aiResult && (
				<div className="card">
					<h3>🤖 AI Crop Health Report</h3>

					{/* Tomato Grade */}
					<h4>🍅 Tomato Quality</h4>
					<p>
						<strong>Predicted Grade:</strong> {aiResult.disease_class}
					</p>
					<p>
						<strong>Model Confidence:</strong>{" "}
						{(aiResult.disease_probability * 100).toFixed(2)}%
					</p>

					{aiResult.disease_class === "Ripe" && (
						<p style={{ color: "green" }}>
							✅ Tomatoes are ready for harvesting and selling.
						</p>
					)}

					{aiResult.disease_class === "Unripe" && (
						<p style={{ color: "#FFC107" }}>
							⏳ Tomatoes need more time before harvesting.
						</p>
					)}

					{aiResult.disease_class === "Reject" && (
						<p style={{ color: "red" }}>
							❌ Some tomatoes are damaged or poor quality.
						</p>
					)}

					<hr />

					{/* Environmental Risk */}
					<h4>🌱 Environmental Condition</h4>
					<p>
						<strong>Environmental Risk:</strong>{" "}
						{(aiResult.environmental_risk * 100).toFixed(2)}%
					</p>

					{aiResult.environmental_risk < 0.3 && (
						<p style={{ color: "green" }}>
							✅ Environment conditions are safe.
						</p>
					)}

					{aiResult.environmental_risk >= 0.3 &&
						aiResult.environmental_risk < 0.6 && (
							<p style={{ color: "#FFC107" }}>
								⚠ Moderate environmental risk. Monitor conditions.
							</p>
						)}

					{aiResult.environmental_risk >= 0.6 && (
						<p style={{ color: "red" }}>
							❌ High environmental risk. Take action immediately.
						</p>
					)}

					<hr />

					{/* Health Score */}
					<h4>❤️ Overall Crop Health</h4>
					<p>
						<strong>Health Score:</strong>{" "}
						{(aiResult.health_score * 100).toFixed(2)}%
					</p>

					{aiResult.health_score > 0.75 && (
						<p style={{ color: "green" }}>
							🌟 Excellent crop condition.
						</p>
					)}

					{aiResult.health_score <= 0.75 &&
						aiResult.health_score > 0.5 && (
							<p style={{ color: "#4CAF50" }}>
								👍 Good condition. Ready for market.
							</p>
						)}

					{aiResult.health_score <= 0.5 &&
						aiResult.health_score > 0.3 && (
							<p style={{ color: "#FFC107" }}>
								⚠ Moderate condition. Improve farming practices.
							</p>
						)}

					{aiResult.health_score <= 0.3 && (
						<p style={{ color: "red" }}>
							❌ Poor condition. Immediate attention required.
						</p>
					)}

					<hr />

					{/* Simple Explanation */}
					<h5>📘 How Health Score is Calculated</h5>
					<p style={{ fontSize: "0.9rem", color: "#555" }}>
						Health Score combines image quality analysis (60%) and environmental
						risk (30%) to evaluate overall crop condition.
					</p>
				</div>
			)}
		</div>
	);
};

export default FarmerBatchDetail;