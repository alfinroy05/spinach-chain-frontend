import { useEffect, useState, useCallback } from "react";

const SEPOLIA_CHAIN_ID = "0xaa36a7";

const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // ============================================
  // 🔹 Check Existing Connection (Auto-Connect)
  // ============================================
  const checkConnection = useCallback(async () => {
    try {
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
      } else {
        setIsCorrectNetwork(false);
      }

      if (accounts.length > 0) {
        setAccount(accounts[0].toLowerCase());
        setIsConnected(true);
        localStorage.setItem("wallet", accounts[0].toLowerCase());
      }

    } catch (err) {
      console.error("Wallet check failed:", err);
    }
  }, []);

  // ============================================
  // 🔹 Connect Wallet
  // ============================================
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask not installed.");
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

      setAccount(accounts[0].toLowerCase());
      setChainId(currentChainId);
      setIsConnected(true);
      setIsCorrectNetwork(true);
      setError("");

      localStorage.setItem("wallet", accounts[0].toLowerCase());

    } catch (err) {
      setError("Wallet connection rejected.");
    }
  };

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
      setError("Failed to switch network.");
    }
  };

  // ============================================
  // 🔹 Disconnect (Frontend Only)
  // ============================================
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setIsCorrectNetwork(false);
    localStorage.removeItem("wallet");
  };

  // ============================================
  // 🔹 Listen for Account / Network Changes
  // ============================================
  useEffect(() => {
    if (!window.ethereum) return;

    checkConnection();

    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0].toLowerCase());
        setIsConnected(true);
        localStorage.setItem("wallet", accounts[0].toLowerCase());
      }
    });

    window.ethereum.on("chainChanged", (newChainId) => {
      setChainId(newChainId);

      if (newChainId === SEPOLIA_CHAIN_ID) {
        setIsCorrectNetwork(true);
      } else {
        setIsCorrectNetwork(false);
      }
    });

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, [checkConnection]);

  return {
    account,
    chainId,
    isConnected,
    isCorrectNetwork,
    error,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
  };
};

export default useWallet;