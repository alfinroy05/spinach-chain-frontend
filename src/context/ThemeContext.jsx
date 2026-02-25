import React, { createContext, useState, useContext, useEffect } from "react";

// Create context
const ThemeContext = createContext();

// Custom hook
export const useTheme = () => {
  return useContext(ThemeContext);
};

// Provider
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  // Apply theme class to body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};