import React from "react";
import "./TransactionStatus.css";

const TransactionStatus = ({ status, txHash }) => {
  /*
    status values:
    "idle"
    "pending"
    "success"
    "error"
  */

  if (status === "idle") return null;

  return (
    <div className={`tx-container ${status}`}>
      {status === "pending" && (
        <>
          <h4>⏳ Transaction in Progress</h4>
          <p>Please wait while blockchain confirms...</p>
        </>
      )}

      {status === "success" && (
        <>
          <h4>✅ Transaction Successful</h4>
          <p>Your spinach batch has been updated successfully.</p>
          {txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-link"
            >
              View on Etherscan
            </a>
          )}
        </>
      )}

      {status === "error" && (
        <>
          <h4>❌ Transaction Failed</h4>
          <p>Something went wrong. Please try again.</p>
        </>
      )}
    </div>
  );
};

export default TransactionStatus;