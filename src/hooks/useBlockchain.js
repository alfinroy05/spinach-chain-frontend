import { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";

const SEPOLIA_CHAIN_ID = "0xaa36a7";

const useBlockchain = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  // --------------------------------------------------
  // 🔹 Initialize If Already Connected
  // --------------------------------------------------
  const initializeWallet = async () => {
    if (!window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum);

    const accounts = await provider.send("eth_accounts", []);

    if (accounts.length > 0) {
      const signer = await provider.getSigner();

      const contractInstance = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      setAccount(accounts[0]);
      setContract(contractInstance);
    }
  };

  // --------------------------------------------------
  // 🔹 Connect Wallet
  // --------------------------------------------------
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask not detected");
        return;
      }

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });

      const provider = new ethers.BrowserProvider(window.ethereum);

      const accounts = await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();

      const contractInstance = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      setAccount(accounts[0]);
      setContract(contractInstance);
      setError("");

    } catch (err) {
      console.error(err);
      setError(err.message || "Wallet connection failed");
    }
  };

  // --------------------------------------------------
  // 🔹 Create Batch
  // --------------------------------------------------
  const createBatch = async (batchId, ipfsCID, merkleRoot) => {
    if (!contract) {
      setError("Connect wallet first");
      return;
    }

    try {
      setLoading(true);

      const tx = await contract.createBatch(
        batchId,
        ipfsCID,
        merkleRoot
      );

      const receipt = await tx.wait();

      setLoading(false);

      return receipt.hash;

    } catch (err) {
      console.error(err);
      setLoading(false);
      setError(err.reason || err.message || "Transaction failed");
      throw err;
    }
  };

  const transferOwnership = async (batchId, newOwner) => {
  if (!contract) throw new Error("Connect wallet first");

  setLoading(true);

  try {
    const tx = await contract.transferOwnership(
      batchId,
      newOwner
    );

    await tx.wait();
    setLoading(false);

    return tx.hash;

  } catch (err) {
    setLoading(false);
    throw err;
  }
};

  // --------------------------------------------------
  // 🔹 Auto Detect Changes
  // --------------------------------------------------
  useEffect(() => {
    initializeWallet();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        initializeWallet();
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  // --------------------------------------------------
return {
  account,
  contract,
  loading,
  error,
  connectWallet,
  createBatch,
  transferOwnership
};
};

export default useBlockchain;