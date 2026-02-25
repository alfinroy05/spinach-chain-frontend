import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { BatchProvider } from './context/BatchContext';
import { BlockchainProvider } from './context/BlockchainContext'; // 🔥 ADD THIS

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BlockchainProvider>   {/* 🔥 WRAP EVERYTHING */}
      <BatchProvider>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BatchProvider>
    </BlockchainProvider>
  </React.StrictMode>
);

reportWebVitals();