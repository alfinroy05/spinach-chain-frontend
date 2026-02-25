import React from "react";
import useSensorData from "../hooks/useSensorData";
import InfoCard from "../components/ui/InfoCard";
import AlertBox from "../components/ui/AlertBox";
import SensorChart from "../components/charts/SensorChart";
import YieldChart from "../components/charts/YieldChart";
import "./Dashboard.css";

const Dashboard = () => {
  const { sensorData, latestData, loading, error } = useSensorData();

  if (loading) return <p>Loading field data...</p>;
  if (error) return <AlertBox type="danger" message={error} />;

  const moisture = latestData?.moisture || 0;
  const temp = latestData?.temp || 0;
  const nitrogen = latestData?.nitrogen || 0;

  // Simple risk logic
  let alertType = "success";
  let alertMessage = "All field conditions are healthy.";

  if (moisture < 40) {
    alertType = "warning";
    alertMessage = "Soil moisture is low. Consider irrigation.";
  }

  if (temp > 35) {
    alertType = "danger";
    alertMessage = "Temperature is too high! Risk of heat stress.";
  }

  return (
    <div className="dashboard-container">
      <h1>🌿 Farmer Dashboard</h1>

      {/* Info Cards */}
      <div className="card-grid">
        <InfoCard
          title="Soil Moisture"
          value={`${moisture}%`}
          icon="💧"
          status={moisture < 40 ? "warning" : "success"}
        />

        <InfoCard
          title="Temperature"
          value={`${temp} °C`}
          icon="🌡"
          status={temp > 35 ? "danger" : "success"}
        />

        <InfoCard
          title="Nitrogen Level"
          value={`${nitrogen} mg`}
          icon="🧪"
          status="normal"
        />

        <InfoCard
          title="Yield Prediction"
          value="110 kg"
          icon="📈"
          status="success"
        />
      </div>

      {/* Alert */}
      <AlertBox type={alertType} message={alertMessage} />

      {/* Charts */}
      <div className="charts-section">
        <SensorChart data={sensorData} />
        <YieldChart />
      </div>
    </div>
  );
};

export default Dashboard;