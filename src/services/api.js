import axios from "axios";

// Backend base URL
const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===========================
   BATCH MANAGEMENT
=========================== */

// Create Batch
export const createBatchAPI = async (batchId, farmerAddress) => {
  const response = await api.post("/create-batch", {
    batch_id: batchId,
    farmer_address: farmerAddress,
  });
  return response.data;
};

// Finalize Batch (Generate Merkle + Upload IPFS)
export const finalizeBatchAPI = async (batchId) => {
  const response = await api.post(`/finalize-batch/${batchId}`);
  return response.data;
};

/* ===========================
   SENSOR DATA
=========================== */

// Add Sensor Data
export const addSensorDataAPI = async (batchId, sensorData) => {
  const response = await api.post(
    `/sensor-data/${batchId}`,
    sensorData
  );
  return response.data;
};

// Get Sensor Data for Batch
export const getSensorDataAPI = async (batchId) => {
  const response = await api.get(
    `/sensor-data/${batchId}`
  );
  return response.data;
};

export const getAllBatchesAPI = async () => {
  const response = await api.get("/batches");
  return response.data;
};
/* ===========================
   AI ANALYSIS
=========================== */

// Analyze Batch
export const analyzeBatchAPI = async (batchId) => {
  const response = await api.get(
    `/analyze-batch/${batchId}`
  );
  return response.data;
};

export default api;