import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import "./TransporterDashboard.css";
import contractABI from "../../contracts/abi.json";

const CONTRACT_ADDRESS = "0x826849f64E347BAA34a77360074E6569EaF0dDdd";
const API_BASE = "process.env.REACT_APP_API_URL";
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

            

            axios.get(`${API_BASE}/batches`, {
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

                    if (owner === currentWallet && state === "InTransit") {

                        let sensor = null;

                        try {

                            const sensorRes = await axios.get(
                                `${API_BASE}/sensor-data/${batch.batch_id}`,
                                { headers: { Authorization: `Bearer ${token}` } }
                            );

                            const readings =
                                sensorRes.data?.sensor_readings || [];

                            if (readings.length > 0) {
                                sensor = readings[readings.length - 1];
                            }

                        } catch { }

                        transporterBatches.push({
                            batchId: batch.batch_id,
                            owner,
                            state,
                            harvestTime: batch.harvest_timestamp,
                            createdAt: batch.created_at,
                            ipfs: batch.ipfs_cid,

                            // 🔹 AI/ML Results (ADDED – does not affect existing logic)
                            healthScore: batch.health_score,
                            diseaseRisk: batch.disease_probability,
                            envRisk: batch.environmental_risk,
                            diseaseClass: batch.disease_class,
                            anomaly: batch.anomaly_detected,

                            sensor
                        });
                    }

                } catch {
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

                batches.map((batch) => {

                    const harvestAge =
                        batch.harvestTime
                            ? Math.floor(
                                (Date.now() - new Date(batch.harvestTime)) /
                                (1000 * 60 * 60)
                            )
                            : null;

                    return (

                        <div key={batch.batchId} className="transport-card">

                            <p><strong>Batch:</strong> {batch.batchId}</p>
                            <p><strong>Owner:</strong> {batch.owner}</p>
                            <p><strong>State:</strong> {batch.state}</p>

                            <p>
                                <strong>Harvested:</strong>{" "}
                                {batch.harvestTime
                                    ? new Date(batch.harvestTime).toLocaleString()
                                    : "N/A"}
                            </p>

                            {harvestAge !== null && (
                                <p><strong>Crop Age:</strong> {harvestAge} hours</p>
                            )}

                            <p>
                                <strong>Recorded:</strong>{" "}
                                {batch.createdAt
                                    ? new Date(batch.createdAt).toLocaleString()
                                    : "N/A"}
                            </p>

                            {/* SENSOR DATA */}
                            {batch.sensor && (
                                <div className="sensor-summary">

                                    <p><strong>Latest Environmental Condition</strong></p>

                                    <p>🌡 Temperature: {batch.sensor.temperature} °C</p>
                                    <p>💧 Humidity: {batch.sensor.humidity} %</p>
                                    <p>🌱 Nitrogen: {batch.sensor.nitrogen}</p>
                                    <p>🌱 Phosphorus: {batch.sensor.phosphorus}</p>
                                    <p>🌱 Potassium: {batch.sensor.potassium}</p>

                                    <p>
                                        <small>
                                            Sensor Time:{" "}
                                            {new Date(
                                                batch.sensor.created_at
                                            ).toLocaleString()}
                                        </small>
                                    </p>

                                </div>
                            )}

                            {/* AI/ML OUTPUT */}
                            {(batch.healthScore !== undefined) && (
                                <div className="ai-summary">

                                    <p><strong>AI Crop Analysis</strong></p>

                                    {batch.diseaseClass && (
                                        <p>🍅 Crop Grade: {batch.diseaseClass}</p>
                                    )}

                                    {batch.healthScore !== null && (
                                        <p>
                                            ❤️ Health Score: {(batch.healthScore * 100).toFixed(1)}%
                                        </p>
                                    )}

                                    {batch.diseaseRisk !== null && (
                                        <p>
                                            ⚠ Disease Risk: {(batch.diseaseRisk * 100).toFixed(1)}%
                                        </p>
                                    )}

                                    {batch.envRisk !== null && (
                                        <p>
                                            🌱 Environmental Risk: {(batch.envRisk * 100).toFixed(1)}%
                                        </p>
                                    )}

                                    {batch.anomaly && (
                                        <p style={{ color: "red" }}>
                                            ⚠ Anomaly detected in crop condition
                                        </p>
                                    )}

                                </div>
                            )}

                            {/* IPFS LINK */}
                            {batch.ipfs && (
                                <p>
                                    <strong>IPFS Metadata:</strong>{" "}
                                    <a
                                        href={`https://gateway.pinata.cloud/ipfs/${batch.ipfs}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        View Data
                                    </a>
                                </p>
                            )}

                            <button
                                disabled={actionLoading === batch.batchId}
                                onClick={() => handleSendToColdStorage(batch.batchId)}
                            >
                                {actionLoading === batch.batchId
                                    ? "Processing..."
                                    : "Send to Cold Storage"}
                            </button>

                        </div>

                    );
                })
            )}

        </div>
    );
};

export default TransporterDashboard;