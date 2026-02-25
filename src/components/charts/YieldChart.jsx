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
  ReferenceLine,
} from "recharts";
import "./YieldChart.css";

const YieldChart = ({ data }) => {
  // Demo fallback data
  const demoData = [
    { day: "Day 1", yield: 10 },
    { day: "Day 5", yield: 25 },
    { day: "Day 10", yield: 45 },
    { day: "Day 15", yield: 70 },
    { day: "Day 20", yield: 95 },
    { day: "Day 25", yield: 110 },
    { day: "Day 30", yield: 125 },
  ];

  const chartData = data || demoData;

  return (
    <div className="yield-container">
      <h3>🌿 Yield Growth Prediction</h3>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />

          <Line
            type="monotone"
            dataKey="yield"
            stroke="#2E7D32"
            strokeWidth={3}
            name="Predicted Yield (kg)"
          />

          {/* Optional Harvest Target Line */}
          <ReferenceLine
            y={120}
            label="Harvest Target"
            stroke="#FFA000"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default YieldChart;