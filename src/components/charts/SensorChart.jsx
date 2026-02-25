import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./SensorChart.css";

const SensorChart = ({ data }) => {
  // Fallback demo data if no props passed
  const demoData = [
    { time: "10:00", moisture: 60, temp: 27 },
    { time: "10:30", moisture: 62, temp: 28 },
    { time: "11:00", moisture: 64, temp: 29 },
    { time: "11:30", moisture: 61, temp: 30 },
    { time: "12:00", moisture: 59, temp: 28 },
  ];

  const chartData = data || demoData;

  return (
    <div className="chart-container">
      <h3>📊 Field Sensor Monitoring</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />

          <Line
            type="monotone"
            dataKey="moisture"
            stroke="#2E7D32"
            strokeWidth={3}
            name="Soil Moisture (%)"
          />

          <Line
            type="monotone"
            dataKey="temp"
            stroke="#FFA000"
            strokeWidth={3}
            name="Temperature (°C)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorChart;