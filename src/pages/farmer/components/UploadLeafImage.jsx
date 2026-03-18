import React, { useState } from "react";
import axios from "axios";
import "./UploadLeafImage.css";

const UploadLeafImage = ({ batchId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_BASE = process.env.REACT_APP_API_URL;

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("batch_id", batchId);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_BASE}/ai/leaf-detect`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        }
      );

      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Error analyzing image. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leaf-container">
      <h3>🍃 Leaf Disease Detection</h3>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {preview && (
        <div className="preview-section">
          <img src={preview} alt="Leaf Preview" />
        </div>
      )}

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Leaf"}
      </button>

      {error && <p className="error-text">{error}</p>}

      {result && (
        <div className="result-box">
          <p><strong>Disease:</strong> {result.disease}</p>
          <p><strong>Confidence:</strong> {result.confidence}%</p>
          {result.suggestion && (
            <p><strong>Suggested Action:</strong> {result.suggestion}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadLeafImage;