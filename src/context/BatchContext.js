import React, { createContext, useState, useContext } from "react";

const BatchContext = createContext();

export const BatchProvider = ({ children }) => {
  const [selectedBatch, setSelectedBatch] = useState("");

  return (
    <BatchContext.Provider value={{ selectedBatch, setSelectedBatch }}>
      {children}
    </BatchContext.Provider>
  );
};

export const useBatch = () => useContext(BatchContext);