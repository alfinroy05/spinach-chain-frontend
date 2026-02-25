import { createContext, useContext } from "react";
import useBlockchain from "../hooks/useBlockchain";

const BlockchainContext = createContext();

export const BlockchainProvider = ({ children }) => {
  const blockchain = useBlockchain();

  return (
    <BlockchainContext.Provider value={blockchain}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchainContext = () => {
  return useContext(BlockchainContext);
};