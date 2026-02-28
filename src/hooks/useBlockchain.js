import { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";

const SEPOLIA_CHAIN_ID = "0xaa36a7";

const useBlockchain = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [readContract, setReadContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  // ==================================================
  // 🔹 Initialize Blockchain (Auto on Load)
  // ==================================================
  useEffect(() => {
    const initialize = async () => {
      if (!window.ethereum) return;

      try {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(newProvider);

        // Read-only contract (no signer needed)
        const readOnly = new ethers.Contract(
          contractAddress,
          contractABI,
          newProvider
        );
        setReadContract(readOnly);

        // Check if wallet already connected
        const accounts = await newProvider.send("eth_accounts", []);

        if (accounts.length > 0) {
          const signer = await newProvider.getSigner();
          const signerAddress = await signer.getAddress();

          const signerContract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );

          setAccount(signerAddress);
          setContract(signerContract);
        }
      } catch (err) {
        console.error("Initialization Error:", err);
      }
    };

    initialize();

    // 🔥 Force reload when account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

  }, [contractAddress]);

  // ==================================================
  // 🔹 Connect Wallet
  // ==================================================
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

      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);

      const accounts = await newProvider.send("eth_requestAccounts", []);
      const signer = await newProvider.getSigner();
      const signerAddress = await signer.getAddress();

      const signerContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      setAccount(signerAddress);
      setContract(signerContract);
      setError("");

    } catch (err) {
      console.error("Wallet Connect Error:", err);
      setError(err.message || "Wallet connection failed");
    }
  };

  // ==================================================
  // 🔹 Create Batch
  // ==================================================
  const createBatch = async (batchId, ipfsCID, merkleRoot) => {
    if (!contract) throw new Error("Connect wallet first");

    try {
      setLoading(true);

      const tx = await contract.createBatch(
        batchId,
        ipfsCID,
        merkleRoot
      );

      await tx.wait();
      setLoading(false);

      return tx.hash;

    } catch (err) {
      setLoading(false);
      setError(err.reason || err.message || "Transaction failed");
      throw err;
    }
  };

  // ==================================================
  // 🔹 Transfer Ownership
  // ==================================================
  const transferOwnership = async (batchId, newOwner) => {
    if (!contract) throw new Error("Connect wallet first");

    try {
      setLoading(true);

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

  // ==================================================
  // 🔹 Update State
  // ==================================================
  const updateState = async (batchId, stateIndex) => {
    if (!contract) throw new Error("Connect wallet first");

    try {
      setLoading(true);

      const tx = await contract.updateState(
        batchId,
        stateIndex
      );

      await tx.wait();
      setLoading(false);

      return tx.hash;

    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // ==================================================
  // 🔹 Read Batch (No Wallet Required)
  // ==================================================
  const getBatch = async (batchId) => {
    if (!readContract) throw new Error("Blockchain not initialized");

    return await readContract.getBatch(batchId);
  };

  // ==================================================
  // 🔹 Event Listeners
  // ==================================================
  const listenToEvents = (callback) => {
    if (!readContract) return;

    readContract.on("OwnershipTransferred", (batchId, newOwner) => {
      callback({
        type: "OwnershipTransferred",
        batchId,
        newOwner
      });
    });

    readContract.on("StateUpdated", (batchId, newState) => {
      callback({
        type: "StateUpdated",
        batchId,
        newState: Number(newState)
      });
    });
  };

  // ==================================================
  return {
    account,
    contract,
    loading,
    error,
    connectWallet,
    createBatch,
    transferOwnership,
    updateState,
    getBatch,
    listenToEvents
  };
};

export default useBlockchain;