import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ParticlesBackground from "../components/ParticlesBackground";

// Demo credentials
const DEMO_CREDENTIALS = {
  email: "demo@honeyguard.ai",
  password: "HoneyGuard2026!",
};

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rememberMe" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate("/dashboard");
      } else {
        if (!formData.name.trim()) {
          throw new Error("Name is required");
        }
        await register(formData.name, formData.email, formData.password);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData((prev) => ({
      ...prev,
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
    }));
    setError("");
  };

  const features = [
    "AI-Powered Scam Detection",
    "Voice & Text Analysis",
    "Screenshot OCR Processing",
    "Real-time Intelligence Extraction",
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
      }}
    >
      <ParticlesBackground />

      {/* Back to Landing Button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate("/")}
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          color: "white",
          "&:hover": {
            background: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        Back to Home
      </Button>

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ flex: 1, maxWidth: 500 }}
          >
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "16px",
                    background:
                      "linear-gradient(135deg, #FF6B35 0%, #F7C815 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 30px rgba(255, 107, 53, 0.4)",
                  }}
                >
                  <SecurityIcon sx={{ color: "#1a1a2e", fontSize: 36 }} />
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #FF6B35, #F7C815)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  HoneyGuard
                </Typography>
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                Agentic Honey-Pot for
                <br />
                <Box
                  component="span"
                  sx={{
                    background: "linear-gradient(135deg, #FF6B35, #F7C815)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Scam Detection
                </Box>
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                AI-powered system that detects scam intent, engages scammers
                autonomously, and extracts valuable intelligence without
                revealing detection.
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #FF6B35, #F7C815)",
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {feature}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </Box>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ flex: 1, maxWidth: 450, width: "100%" }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                background:
                  "linear-gradient(145deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 4,
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, mb: 1, textAlign: "center" }}
              >
                {isLogin ? "Welcome Back" : "Create Account"}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, textAlign: "center" }}
              >
                {isLogin
                  ? "Sign in to access your dashboard"
                  : "Get started with HoneyGuard"}
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <TextField
                    fullWidth
                    name="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    sx={{ mb: 2.5 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}

                <TextField
                  fullWidth
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2.5 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  helperText="Minimum 6 characters"
                />

                {isLogin && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                          size="small"
                          sx={{
                            color: "primary.main",
                            "&.Mui-checked": { color: "primary.main" },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2">Remember me</Typography>
                      }
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "primary.main",
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Forgot password?
                    </Typography>
                  </Box>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    mb: 2,
                    background:
                      "linear-gradient(135deg, #FF6B35 0%, #F7C815 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #ff8555 0%, #f9d645 100%)",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>

                {/* Demo Credentials Button */}
                {isLogin && (
                  <Box sx={{ mb: 2 }}>
                    <Alert
                      severity="info"
                      icon={<InfoIcon />}
                      action={
                        <Button
                          color="inherit"
                          size="small"
                          onClick={fillDemoCredentials}
                          sx={{ fontWeight: 600 }}
                        >
                          Use Demo
                        </Button>
                      }
                      sx={{
                        background: "rgba(112, 161, 255, 0.1)",
                        border: "1px solid rgba(112, 161, 255, 0.3)",
                      }}
                    >
                      <Typography variant="caption">
                        <strong>Demo:</strong> demo@honeyguard.ai /
                        HoneyGuard2026!
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </form>

              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Typography variant="body2" sx={{ textAlign: "center" }}>
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <Box
                  component="span"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  sx={{
                    color: "primary.main",
                    cursor: "pointer",
                    fontWeight: 600,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </Box>
              </Typography>
            </Paper>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", textAlign: "center", mt: 3 }}
            >
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </Typography>
          </motion.div>
        </Box>
      </Container>

      {/* Gradient Orbs */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255, 107, 53, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(247, 200, 21, 0.1) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
};

export default Login;
