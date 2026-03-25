import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Web3 from "web3";
import "./FarmerDashboard.css";

const CONTRACT_ADDRESS = "0x826849f64E347BAA34a77360074E6569EaF0dDdd";
const SEPOLIA_CHAIN_ID = "0xaa36a7";

// 🔥 KEEP YOUR FULL ABI HERE
const CONTRACT_ABI = [
	{
		"inputs": [],
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
				"internalType": "string",
				"name": "ipfsCID",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "merkleRoot",
				"type": "bytes32"
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
		"name": "OwnershipTransferred",
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
			},
			{
				"internalType": "address",
				"name": "_newOwner",
				"type": "address"
			},
			{
				"internalType": "enum SpinachChain.BatchState",
				"name": "_newState",
				"type": "uint8"
			}
		],
		"name": "transferAndUpdateState",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];;

const stateMap = [
	"Harvested",
	"InTransit",
	"InColdStorage",
	"Delivered",
	"Rejected"
];

const FarmerDashboard = () => {
	const [batches, setBatches] = useState([]);
	const [newBatchId, setNewBatchId] = useState("");
	const [loading, setLoading] = useState(true);

	const navigate = useNavigate();
	const token = localStorage.getItem("token");

	// ==================================================
	// INITIAL LOAD
	// ==================================================
	useEffect(() => {
		if (!token) {
			navigate("/login");
			return;
		}

		fetchBatches();
	}, []);

	// ==================================================
	// FETCH ALL BATCHES (OFF-CHAIN ONLY)
	// ==================================================
	const fetchBatches = async () => {
		try {
			const res = await axios.get(
				"http://localhost:5000/api/batches",
				{
					headers: { Authorization: `Bearer ${token}` }
				}
			);

			const offChainBatches = res.data || [];

			// 🔥 Attach blockchain state to each batch
			const enrichedBatches = await Promise.all(
				offChainBatches.map(async (batch) => {
					const chainData = await fetchBlockchainState(batch.batch_id);
					return { ...batch, ...chainData };
				})
			);

			setBatches(enrichedBatches);

		} catch (err) {
			console.error("Error fetching batches:", err);

			if (err.response?.status === 401) {
				alert("Session expired.");
				localStorage.clear();
				navigate("/login");
			}
		} finally {
			setLoading(false);
		}
	};

	// ==================================================
	// FETCH BLOCKCHAIN STATE
	// ==================================================
	const fetchBlockchainState = async (batchId) => {
		if (!window.ethereum) return { chainState: "NotCreated" };

		try {
			const web3 = new Web3(window.ethereum);

			const chainId = await window.ethereum.request({
				method: "eth_chainId"
			});

			if (chainId !== SEPOLIA_CHAIN_ID)
				return { chainState: "WrongNetwork" };

			const contract = new web3.eth.Contract(
				CONTRACT_ABI,
				CONTRACT_ADDRESS
			);

			const data = await contract.methods.getBatch(batchId).call();

			return {
				chainState: stateMap[data[6]],
				chainOwner: data[4]
			};

		} catch {
			return { chainState: "NotCreated" };
		}
	};

	// ==================================================
	// CREATE NEW BATCH (OFF-CHAIN ONLY)
	// ==================================================
	const handleCreateBatch = async () => {
		if (!newBatchId.trim()) return;

		try {
			await axios.post(
				"http://localhost:5000/api/create-batch",
				{ batch_id: newBatchId },
				{
					headers: { Authorization: `Bearer ${token}` }
				}
			);

			alert("Batch metadata created!");
			setNewBatchId("");
			fetchBatches();

		} catch (err) {
			console.error("Create batch error:", err);
			alert(err.response?.data?.error || "Failed to create batch");
		}
	};

	if (loading) {
		return <div className="farmer-container">Loading...</div>;
	}

	return (
		<div className="farmer-container">
			<h2>👨‍🌾 Farmer Dashboard</h2>

			{/* ================= CREATE SECTION ================= */}
			<div className="create-section">
				<h3>Create New Batch</h3>
				<input
					type="text"
					placeholder="Enter Batch ID"
					value={newBatchId}
					onChange={(e) => setNewBatchId(e.target.value)}
				/>
				<button onClick={handleCreateBatch}>
					Create Batch
				</button>
			</div>

			{/* ================= BATCH LIST ================= */}
			<div className="batch-list">
				<h3>All Batches</h3>

				{batches.length === 0 ? (
					<p>No batches created yet.</p>
				) : (
					batches.map((batch) => {

						const status = batch.chainState || "NotCreated";
						const owner = batch.chainOwner || null;
						const cid = batch.ipfs_cid || null;

						return (
							<div key={batch.batch_id} className="batch-card">

								<p>
									<strong>Batch ID:</strong> {batch.batch_id}
								</p>

								<p>
									<strong>Blockchain Status:</strong>{" "}
									<span className={`status-badge status-${status}`}>
										{status}
									</span>
								</p>

								<p>
									<strong>Owner:</strong>{" "}
									{owner
										? `${owner.slice(0, 6)}...${owner.slice(-4)}`
										: "Not Assigned"}
								</p>

								<p>
									<strong>IPFS CID:</strong>{" "}
									{cid ? (
										<span className="ipfs-value">
											{cid.slice(0, 10)}...{cid.slice(-6)}
										</span>
									) : (
										<span className="ipfs-missing">
											Not Finalized
										</span>
									)}
								</p>

								<button
									className="view-btn"
									onClick={() =>
										navigate(`/farmer/batch/${batch.batch_id}`)
									}
								>
									View Details
								</button>

							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

export default FarmerDashboard;