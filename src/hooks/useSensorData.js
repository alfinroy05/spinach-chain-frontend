import { useState, useEffect } from "react";
import { getSensorDataAPI } from "../services/api";

const useSensorData = (batchId) => {
  const [sensorData, setSensorData] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!batchId) return;

    const fetchSensorData = async () => {
      try {
        setLoading(true);

        const result = await getSensorDataAPI(batchId);

        const readings = result.sensor_readings || [];

        // Format for charts
        const formatted = readings.map((item) => ({
          time: new Date(item.created_at).toLocaleTimeString(),
          moisture: item.soil_moisture,
          temp: item.temperature,
          humidity: item.humidity,
          nitrogen: item.nitrogen,
        }));

        setSensorData(formatted);
        setLatestData(formatted[formatted.length - 1] || null);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch sensor data");
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
  }, [batchId]);

  return { sensorData, latestData, loading, error };
};

export default useSensorData;