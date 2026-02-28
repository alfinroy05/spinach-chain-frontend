import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import "./TransporterDashboard.css";
import contractABI from "../../contracts/abi.json";

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

const TransporterDashboard = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");
    const [contract, setContract] = useState(null);
    const [wallet, setWallet] = useState("");

    useEffect(() => {
        initialize();

        // 🔥 Listen for wallet change
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", () => {
                window.location.reload();
            });
        }
    }, []);

    const initialize = async () => {
        try {
            if (!window.ethereum) {
                setError("MetaMask not installed");
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
            const address = await signer.getAddress();
            setWallet(address.toLowerCase());

            const contractInstance = new ethers.Contract(
                CONTRACT_ADDRESS,
                contractABI,
                signer
            );

            setContract(contractInstance);

            await fetchBatches(contractInstance, address.toLowerCase());

        } catch (err) {
            console.error(err);
            setError("Initialization failed.");
        } finally {
            setLoading(false);
        }
    };

    const fetchBatches = async (contractInstance, currentWallet) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please login again.");
                return;
            }

            const res = await axios.get(`${API_BASE}/batches`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const backendBatches = res.data || [];
            const transporterBatches = [];

            for (let batch of backendBatches) {
                try {
                    const data = await contractInstance.getBatch(batch.batch_id);

                    const owner = data[4].toLowerCase();
                    const stateIndex = Number(data[6]);
                    const state = stateMap[stateIndex];

                    if (
                        owner === currentWallet &&
                        state === "InTransit"
                    ) {
                        transporterBatches.push({
                            batchId: batch.batch_id,
                            owner,
                            state
                        });
                    }

                } catch (err) {
                    console.log("Batch not on chain:", batch.batch_id);
                }
            }

            setBatches(transporterBatches);

        } catch (err) {
            console.error(err);
            setError("Failed to load batches.");
        }
    };

    const handleSendToColdStorage = async (batchId) => {
        try {
            if (!contract) return;

            setActionLoading(batchId);

            const tx = await contract.sendToColdStorage(batchId);
            await tx.wait();

            alert("✅ Sent to Cold Storage");

            await fetchBatches(contract, wallet);

        } catch (err) {
            console.error(err);
            alert(err.reason || err.message || "Transaction failed");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading)
        return <div className="transporter-container">Loading...</div>;

    if (error)
        return <div className="transporter-container error">{error}</div>;

    return (
        <div className="transporter-container">
            <h2>🚚 Transporter Dashboard</h2>
            <p><strong>Connected Wallet:</strong> {wallet}</p>

            {batches.length === 0 ? (
                <p>No assigned batches.</p>
            ) : (
                batches.map((batch) => (
                    <div key={batch.batchId} className="transport-card">
                        <p><strong>Batch:</strong> {batch.batchId}</p>
                        <p><strong>Owner:</strong> {batch.owner}</p>
                        <p><strong>State:</strong> {batch.state}</p>

                        <button
                            disabled={actionLoading === batch.batchId}
                            onClick={() => handleSendToColdStorage(batch.batchId)}
                        >
                            {actionLoading === batch.batchId
                                ? "Processing..."
                                : "Send to Cold Storage"}
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};

export default TransporterDashboard;