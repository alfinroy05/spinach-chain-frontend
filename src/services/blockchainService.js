import { ethers } from "ethers";
import contractABI from "../../smart_contract/abi.json";

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0xac11c7dF14096B2D416b7378D8E24c621354CF41";

// Connect Wallet
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
};

// Get Contract Instance
export const getContract = async () => {
  const { signer } = await connectWallet();

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractABI,
    signer
  );

  return contract;
};

/* ===========================
   WRITE FUNCTIONS
=========================== */

// Create Batch
export const createBatch = async (batchId, ipfsCID, merkleRoot) => {
  const contract = await getContract();

  const tx = await contract.createBatch(batchId, ipfsCID, merkleRoot);
  await tx.wait();

  return tx.hash;
};

// Transfer Ownership
export const transferOwnership = async (batchId, newOwner) => {
  const contract = await getContract();

  const tx = await contract.transferOwnership(batchId, newOwner);
  await tx.wait();

  return tx.hash;
};

/* ===========================
   READ FUNCTIONS
=========================== */

// Get Batch Details
export const getBatchDetails = async (batchId) => {
  const contract = await getContract();
  const batch = await contract.getBatch(batchId);

  return batch;
};

// Get Current Network
export const getNetwork = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  return network.name;
};