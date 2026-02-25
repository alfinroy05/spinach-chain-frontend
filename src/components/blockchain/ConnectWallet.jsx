import React, { useState, useEffect } from "react";
import "./ConnectWallet.css";

const ConnectWallet = () => {
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [error, setError] = useState("");

  // Connect Wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed. Please install MetaMask.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      setAccount(accounts[0]);
      setNetwork(chainId);
      setError("");
    } catch (err) {
      setError("Connection failed. Please try again.");
    }
  };

  // Detect account change
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <div className="wallet-container">
      <h3>🔗 Blockchain Connection</h3>

      {account ? (
        <div className="wallet-info">
          <p>✅ Wallet Connected</p>
          <p className="address">
            {account.slice(0, 6)}...{account.slice(-4)}
          </p>
          <p className="network">Network ID: {network}</p>
        </div>
      ) : (
        <button className="connect-btn" onClick={connectWallet}>
          Connect Wallet
        </button>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default ConnectWallet;