import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./styles/global.css";
import "./styles/layout.css";
import "./styles/theme.css";
import "./styles/responsive.css";

/* Layout Components */
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

/* Pages */
import Dashboard from "./pages/Dashboard";
import BatchManagement from "./pages/BatchManagement";
import SupplyChain from "./pages/SupplyChain";
import ColdChainMonitor from "./pages/ColdChainMonitor";
import Verification from "./pages/Verification";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <div className="app-container">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="main-content">

          {/* Top Navbar */}
          <Navbar />

          {/* Routes */}
          <div className="page-wrapper">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/batches" element={<BatchManagement />} />
              <Route path="/supply" element={<SupplyChain />} />
              <Route path="/coldchain" element={<ColdChainMonitor />} />
              <Route path="/verify" element={<Verification />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>

          {/* Footer */}
          <Footer />

        </div>
      </div>
    </Router>
  );
}

export default App;