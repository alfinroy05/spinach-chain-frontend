import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import "./styles/global.css";
import "./styles/layout.css";
import "./styles/theme.css";
import "./styles/responsive.css";

/* Layout */
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

/* Pages */
import Login from "./pages/Login";
import Register from "./pages/Register";   // ✅ ADDED
import FarmerDashboard from "./pages/FarmerDashboard";
import TransporterDashboard from "./pages/TransporterDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
import ColdChainMonitor from "./pages/ColdChainMonitor";
import Verification from "./pages/Verification";
import NotFound from "./pages/NotFound";

/* Auth */
import ProtectedRoute from "./components/auth/ProtectedRoute";

function AppLayout({ children }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="page-wrapper">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>

        {/* 🔄 Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 🔓 Public Consumer Route */}
        <Route path="/verify/:batchId" element={<Verification />} />

        {/* 🔐 Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔐 Farmer Dashboard */}
        <Route
          path="/farmer"
          element={
            <ProtectedRoute allowedRole="farmer">
              <AppLayout>
                <FarmerDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* 🔐 Transporter Dashboard */}
        <Route
          path="/transporter"
          element={
            <ProtectedRoute allowedRole="transporter">
              <AppLayout>
                <TransporterDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* 🔐 Retailer Dashboard */}
        <Route
          path="/retailer"
          element={
            <ProtectedRoute allowedRole="retailer">
              <AppLayout>
                <RetailerDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* 🔐 Cold Storage Dashboard */}
        <Route
          path="/cold-storage"
          element={
            <ProtectedRoute allowedRole="cold_storage">
              <AppLayout>
                <ColdChainMonitor />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ❌ 404 Page */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}

export default App;