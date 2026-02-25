import axios from "axios";

// ⚠️ Store these in .env later
const PINATA_API_KEY = "YOUR_PINATA_API_KEY";
const PINATA_SECRET_API_KEY = "YOUR_PINATA_SECRET_KEY";

const PINATA_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

/* ===========================
   Upload JSON to IPFS
=========================== */

export const uploadToIPFS = async (data) => {
  try {
    const response = await axios.post(PINATA_URL, data, {
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    return response.data.IpfsHash; // This is your CID
  } catch (error) {
    console.error("IPFS Upload Error:", error);
    throw new Error("Failed to upload to IPFS");
  }
};

/* ===========================
   Fetch Data from IPFS
=========================== */

export const fetchFromIPFS = async (cid) => {
  try {
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("IPFS Fetch Error:", error);
    throw new Error("Failed to fetch IPFS data");
  }
};