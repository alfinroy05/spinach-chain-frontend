import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <h3>🌿 SpinachChain</h3>
          <p>Smart Spinach Monitoring & Supply Chain System</p>
        </div>

        <div className="footer-center">
          <p>📡 IoT: ESP32 Sensors</p>
          <p>🔗 Blockchain: Ethereum</p>
          <p>☁ Storage: IPFS</p>
        </div>

        <div className="footer-right">
          <p>© {new Date().getFullYear()} SpinachChain</p>
          <p>Built for Smart Farmers 👨‍🌾</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;