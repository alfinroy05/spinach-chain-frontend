import React from "react";
import useSensorData from "../hooks/useSensorData";
import { useBatch } from "../context/BatchContext";
import InfoCard from "../components/ui/InfoCard";
import AlertBox from "../components/ui/AlertBox";
import SensorChart from "../components/charts/SensorChart";
import "./ColdChainMonitor.css";

const ColdChainMonitor = () => {
  // ✅ Get selected batch globally
  const { selectedBatch } = useBatch();

  // ✅ Fetch sensor data dynamically for selected batch
  const { sensorData, latestData, loading, error } =
    useSensorData(selectedBatch);

  // If no batch selected
  if (!selectedBatch) {
    return (
      <div className="coldchain-container">
        <h1>❄ Cold Chain Monitor</h1>
        <p>Please select a batch from Dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="coldchain-container">
        <h1>❄ Cold Chain Monitor</h1>
        <p>Loading cold chain data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="coldchain-container">
        <h1>❄ Cold Chain Monitor</h1>
        <AlertBox type="danger" message={error} />
      </div>
    );
  }

  // Extract latest values safely
  const temperature = latestData?.temp || 0;
  const humidity = latestData?.humidity || 0;

  // Cold chain threshold logic
  let alertType = "success";
  let alertMessage = "Cold chain conditions are stable.";

  if (temperature > 10) {
    alertType = "danger";
    alertMessage =
      "Temperature exceeded safe limit! Risk of spoilage.";
  } else if (temperature > 6) {
    alertType = "warning";
    alertMessage =
      "Temperature slightly high. Monitor closely.";
  }

  return (
    <div className="coldchain-container">
      <h1>❄ Cold Chain Monitor</h1>

      {/* Info Cards */}
      <div className="card-grid">
        <InfoCard
          title="Storage Temperature"
          value={`${temperature} °C`}
          icon="🌡"
          status={alertType}
        />

        <InfoCard
          title="Humidity Level"
          value={`${humidity}%`}
          icon="💧"
          status="normal"
        />
      </div>

      {/* Alert */}
      <AlertBox type={alertType} message={alertMessage} />

      {/* Chart */}
      <SensorChart data={sensorData} />
    </div>
  );
};

export default ColdChainMonitor;