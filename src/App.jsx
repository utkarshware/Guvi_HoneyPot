import React, { useState } from "react";
import { Box, Container } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SessionProvider } from "./context/SessionContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import TabNavigation from "./components/TabNavigation";
import AudioAnalysis from "./pages/AudioAnalysis";
import ScreenshotAnalysis from "./pages/ScreenshotAnalysis";
import FraudQuestionnaire from "./pages/FraudQuestionnaire";
import SessionDashboard from "./components/SessionDashboard";
import Footer from "./components/Footer";
import ParticlesBackground from "./components/ParticlesBackground";

function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <AudioAnalysis />;
      case 1:
        return <ScreenshotAnalysis />;
      case 2:
        return <FraudQuestionnaire />;
      case 3:
        return <SessionDashboard />;
      default:
        return <AudioAnalysis />;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <ParticlesBackground />
      <Header />
      <HeroSection />
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        <AnimatePresence mode="wait">
          <Box key={activeTab}>{renderTabContent()}</Box>
        </AnimatePresence>
      </Container>
      <Footer />
    </Box>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: "3px solid rgba(255, 107, 53, 0.2)",
            borderTopColor: "#FF6B35",
            animation: "spin 1s linear infinite",
            "@keyframes spin": {
              to: { transform: "rotate(360deg)" },
            },
          }}
        />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Login Route - redirect to dashboard if already authenticated
function LoginRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <AppRoutes />
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;
