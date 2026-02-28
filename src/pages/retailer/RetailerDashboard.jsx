import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import "./RetailerDashboard.css";
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

const RetailerDashboard = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [wallet, setWallet] = useState("");
    const [contract, setContract] = useState(null);

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
                setError("Switch MetaMask to Sepolia network.");
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

            await fetchRetailerBatches(contractInstance, address);

        } catch (err) {
            console.error(err);
            setError("Blockchain initialization failed.");
        } finally {
            setLoading(false);
        }
    };

    const fetchRetailerBatches = async (contractInstance, currentWallet) => {
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
            const retailerOwned = [];

            for (let batch of backendBatches) {
                try {
                    const data = await contractInstance.getBatch(batch.batch_id);

                    const owner = data[4].toLowerCase();
                    const stateIndex = Number(data[6]);
                    const state = stateMap[stateIndex];
                    const violated = data[7];

                    if (
                        owner === currentWallet &&
                        state === "Delivered"
                    ) {
                        retailerOwned.push({
                            batch_id: batch.batch_id,
                            blockchainState: state,
                            owner,
                            cold_chain_violated: violated,
                            ...batch
                        });
                    }

                } catch (err) {
                    console.log("Not on chain:", batch.batch_id);
                }
            }

            setBatches(retailerOwned);

        } catch (err) {
            console.error(err);
            setError("Failed to fetch batches.");
        }
    };

    const getQualityBadge = (score) => {
        if (!score) return "quality-bad";
        if (score >= 75) return "quality-good";
        if (score >= 50) return "quality-medium";
        return "quality-bad";
    };

    const downloadQR = (batchId) => {
        const canvas = document.getElementById(`qr-${batchId}`);
        const pngUrl = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");

        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `QR_${batchId}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    if (loading) {
        return (
            <div className="retailer-container">
                <h2>🏪 Retailer Dashboard</h2>
                <p>Loading blockchain data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="retailer-container error">
                {error}
            </div>
        );
    }

    return (
        <div className="retailer-container">
            <h2>🏪 Decentralized Retailer Dashboard</h2>
            <p><strong>Connected Wallet:</strong> {wallet}</p>

            {batches.length === 0 ? (
                <p>No Delivered batches assigned to this retailer wallet.</p>
            ) : (
                batches.map((batch) => (
                    <div key={batch.batch_id} className="retailer-card">

                        <p><strong>Batch ID:</strong> {batch.batch_id}</p>
                        <p><strong>Blockchain State:</strong> {batch.blockchainState}</p>
                        <p><strong>Current Owner:</strong> {batch.owner}</p>

                        <p>
                            <strong>Cold Chain Status:</strong>{" "}
                            {batch.cold_chain_violated
                                ? "⚠ Violation"
                                : "✅ Safe"}
                        </p>

                        <p><strong>Farm:</strong> {batch.farm_name || "N/A"}</p>

                        <div className={`quality-badge ${getQualityBadge(batch.health_score)}`}>
                            🌿 Health Score: {batch.health_score || 0}%
                        </div>

                        <p>
                            🦠 <strong>Disease Risk:</strong>{" "}
                            {batch.disease_probability || 0}%
                        </p>

                        <p>
                            📦 <strong>Predicted Yield:</strong>{" "}
                            {batch.predicted_yield || 0} kg
                        </p>

                        {/* ================== QR SECTION ================== */}

                        {!batch.cold_chain_violated && (
                            <div className="qr-section">
                                <h4>Public Verification QR</h4>

                                <QRCodeCanvas
                                    id={`qr-${batch.batch_id}`}
                                    value={`${window.location.origin}/verify/${batch.batch_id}`}
                                    size={180}
                                />

                                <button
                                    className="download-btn"
                                    onClick={() => downloadQR(batch.batch_id)}
                                >
                                    Download QR
                                </button>
                            </div>
                        )}

                    </div>
                ))
            )}
        </div>
    );
};

export default RetailerDashboard;