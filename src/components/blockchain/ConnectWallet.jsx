import React, { useEffect, useState } from "react";
import "./ConnectWallet.css";

const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111

const ConnectWallet = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState("");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // ============================================
  // 🔹 Connect Wallet
  // ============================================
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        setError("Please switch to Sepolia network.");
        setIsCorrectNetwork(false);
        return;
      }

      const walletAddress = accounts[0].toLowerCase();

      setAccount(walletAddress);
      setChainId(currentChainId);
      setIsCorrectNetwork(true);
      setError("");

      localStorage.setItem("wallet", walletAddress);

    } catch (err) {
      console.error(err);
      setError("Wallet connection rejected.");
    }
  };

  // ============================================
  // 🔹 Auto Reconnect on Refresh
  // ============================================
  useEffect(() => {
    const autoReconnect = async () => {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      setChainId(currentChainId);

      if (currentChainId === SEPOLIA_CHAIN_ID) {
        setIsCorrectNetwork(true);
      }

      if (accounts.length > 0) {
        const walletAddress = accounts[0].toLowerCase();
        setAccount(walletAddress);
        localStorage.setItem("wallet", walletAddress);
      }
    };

    autoReconnect();
  }, []);

  // ============================================
  // 🔹 Handle Account / Network Changes
  // ============================================
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // Wallet disconnected
        setAccount(null);
        localStorage.removeItem("wallet");
        window.location.href = "/login";
      } else {
        const newWallet = accounts[0].toLowerCase();
        const storedWallet = localStorage.getItem("wallet");

        // 🔐 Security: force logout if wallet changes
        if (storedWallet && storedWallet !== newWallet) {
          alert("Wallet changed. Logging out for security.");
          localStorage.clear();
          window.location.href = "/login";
        } else {
          setAccount(newWallet);
          localStorage.setItem("wallet", newWallet);
        }
      }
    };

    const handleChainChanged = (newChainId) => {
      setChainId(newChainId);

      if (newChainId !== SEPOLIA_CHAIN_ID) {
        alert("Please switch back to Sepolia network.");
        setIsCorrectNetwork(false);
      } else {
        setIsCorrectNetwork(true);
      }

      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  // ============================================
  // 🔹 Switch to Sepolia Automatically
  // ============================================
  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (err) {
      setError("Network switch failed.");
    }
  };

  return (
    <div className="wallet-container">
      <h3>🔗 Blockchain Connection</h3>

      {account ? (
        <div className="wallet-info">
          <p>✅ Wallet Connected</p>
          <p className="address">
            {account.slice(0, 6)}...{account.slice(-4)}
          </p>
          <p className="network">
            Network: {isCorrectNetwork ? "Sepolia" : "Wrong Network"}
          </p>

          {!isCorrectNetwork && (
            <button className="switch-btn" onClick={switchToSepolia}>
              Switch to Sepolia
            </button>
          )}
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