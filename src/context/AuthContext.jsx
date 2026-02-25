import React, { createContext, useState, useContext } from "react";

// Create Context
const AuthContext = createContext();

// Custom Hook to use Auth
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider Component
export const AuthProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [role, setRole] = useState(null); 
  // role can be: "farmer", "transporter", "retailer", "consumer"

  // Login (wallet connect)
  const login = (address, userRole) => {
    setWalletAddress(address);
    setRole(userRole);
  };

  // Logout
  const logout = () => {
    setWalletAddress(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        walletAddress,
        role,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};