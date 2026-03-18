import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";
import "./SensorChart.css";

const SensorChart = ({ batchId }) => {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchSensorData();

    const interval = setInterval(() => {
      fetchSensorData();
    }, 10000);

    return () => clearInterval(interval);
  }, [batchId]);

  const fetchSensorData = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/sensor-data/${batchId}`
      );
      setSensorData(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Sensor fetch error:", err);
      setLoading(false);
    }
  };

  if (loading) return <div className="sensor-card">Loading sensor data...</div>;
  if (sensorData.length === 0)
    return <div className="sensor-card">No sensor data available.</div>;

  const latest = sensorData[sensorData.length - 1];

  return (
    <div className="sensor-card">
      <h3>📊 IoT Sensor Monitoring</h3>

      {/* ================= Latest Values ================= */}
      <div className="latest-values">
        <p>🌡 Temp: {latest.temperature}°C</p>
        <p>💧 Humidity: {latest.humidity}%</p>
        <p>🌱 Soil Moisture: {latest.soil_moisture}%</p>
        <p>🧪 N: {latest.nitrogen}</p>
        <p>🧪 P: {latest.phosphorus}</p>
        <p>🧪 K: {latest.potassium}</p>
      </div>

      {/* ================= Temperature ================= */}
      <h4>Temperature Trend</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={sensorData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="temperature" stroke="#ff5722" />
        </LineChart>
      </ResponsiveContainer>

      {/* ================= Humidity ================= */}
      <h4>Humidity Trend</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={sensorData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="humidity" stroke="#2196f3" />
        </LineChart>
      </ResponsiveContainer>

      {/* ================= NPK Combined Chart ================= */}
      <h4>NPK Nutrient Levels</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={sensorData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="nitrogen" stroke="#4caf50" />
          <Line type="monotone" dataKey="phosphorus" stroke="#ff9800" />
          <Line type="monotone" dataKey="potassium" stroke="#9c27b0" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorChart;