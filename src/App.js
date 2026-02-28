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
import Register from "./pages/Register";

import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import FarmerBatchDetail from "./pages/farmer/FarmerBatchDetail";

import TransporterDashboard from "./pages/transporter/TransporterDashboard";
import RetailerDashboard from "./pages/retailer/RetailerDashboard";
import ColdStorageDashboard from "./pages/coldstorage/ColdStorageDashboard";
import VerifyBatch from "./pages/public/VerifyBatch";
import NotFound from "./pages/NotFound";

/* Auth */
import ProtectedRoute from "./components/auth/ProtectedRoute";

function AppLayout({ children }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="page-wrapper">{children}</div>
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

        {/* 🌿 Public Consumer Verification */}
        <Route path="/verify/:batchId" element={<VerifyBatch />} />

        {/* 🔐 Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= FARMER ================= */}
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

        <Route
          path="/farmer/batch/:id"
          element={
            <ProtectedRoute allowedRole="farmer">
              <AppLayout>
                <FarmerBatchDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= TRANSPORTER ================= */}
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

        {/* ================= RETAILER ================= */}
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

        {/* ================= COLD STORAGE ================= */}
        <Route
          path="/cold-storage"
          element={
            <ProtectedRoute allowedRole="cold_storage">
              <AppLayout>
                <ColdStorageDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ❌ 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}

export default App;