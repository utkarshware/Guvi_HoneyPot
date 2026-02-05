import React from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Container,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Psychology as AIIcon,
  Speed as SpeedIcon,
  Language as LanguageIcon,
  Mic as MicIcon,
  Screenshot as ScreenshotIcon,
  QuestionAnswer as QnAIcon,
  Shield as ShieldIcon,
  Visibility as VisionIcon,
  Translate as TranslateIcon,
  RecordVoiceOver as SpeechIcon,
  Analytics as AnalyticsIcon,
  Login as LoginIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
  Description as DocsIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ParticlesBackground from "../components/ParticlesBackground";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    navigate(isAuthenticated ? "/dashboard" : "/login");
  };

  const features = [
    {
      icon: <MicIcon sx={{ fontSize: 40 }} />,
      title: "Voice Analysis",
      description:
        "Real-time voice and text analysis with Azure Speech Services for multi-language scam detection.",
      color: "#FF6B35",
    },
    {
      icon: <ScreenshotIcon sx={{ fontSize: 40 }} />,
      title: "Screenshot OCR",
      description:
        "Extract and analyze text from images using Microsoft Computer Vision with intelligent pattern recognition.",
      color: "#F7C815",
    },
    {
      icon: <AIIcon sx={{ fontSize: 40 }} />,
      title: "AI-Powered Agent",
      description:
        "Autonomous AI agent that engages scammers to extract intelligence without revealing detection.",
      color: "#70A1FF",
    },
    {
      icon: <LanguageIcon sx={{ fontSize: 40 }} />,
      title: "Multi-Language",
      description:
        "Support for 17+ languages including Hindi, Tamil, Telugu, Bengali with Azure Translator.",
      color: "#2ED573",
    },
  ];

  const azureServices = [
    {
      icon: <TranslateIcon />,
      name: "Azure Translator",
      desc: "Multi-language translation",
    },
    { icon: <SpeechIcon />, name: "Azure Speech", desc: "Audio transcription" },
    {
      icon: <VisionIcon />,
      name: "Computer Vision",
      desc: "OCR & image analysis",
    },
    {
      icon: <AnalyticsIcon />,
      name: "Language Service",
      desc: "Text analytics & NLP",
    },
  ];

  const stats = [
    { value: "95%+", label: "Detection Accuracy" },
    { value: "17+", label: "Languages Supported" },
    { value: "<2s", label: "Analysis Time" },
    { value: "24/7", label: "Real-time Protection" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Box sx={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <ParticlesBackground />

      {/* Navigation Header */}
      <Box
        component={motion.div}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          py: 2,
          px: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(26, 26, 46, 0.8)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ShieldIcon sx={{ fontSize: 36, color: "primary.main" }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #FF6B35, #F7C815)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            HoneyGuard AI
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<LoginIcon />}
          onClick={() => navigate("/login")}
          sx={{
            background: "linear-gradient(135deg, #FF6B35, #F7C815)",
            fontWeight: 600,
            px: 3,
            "&:hover": {
              background: "linear-gradient(135deg, #E55A2B, #E0B513)",
              transform: "translateY(-2px)",
            },
          }}
        >
          Login
        </Button>
      </Box>

      {/* Hero Section */}
      <Container
        maxWidth="lg"
        sx={{ pt: 15, pb: 10, position: "relative", zIndex: 1 }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <motion.div variants={itemVariants}>
                <Chip
                  label="🛡️ Powered by Microsoft Azure AI"
                  sx={{
                    mb: 3,
                    background: "rgba(255, 107, 53, 0.2)",
                    border: "1px solid rgba(255, 107, 53, 0.5)",
                    color: "#FF6B35",
                    fontWeight: 600,
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
                    fontWeight: 800,
                    lineHeight: 1.1,
                    mb: 3,
                  }}
                >
                  Agentic{" "}
                  <Box
                    component="span"
                    sx={{
                      background: "linear-gradient(135deg, #FF6B35, #F7C815)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Honey-Pot
                  </Box>
                  <br />
                  Scam Detection
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 4, maxWidth: 550, lineHeight: 1.7 }}
                >
                  AI-powered system that detects scam intent and autonomously
                  engages with scammers to extract intelligence using Microsoft
                  Azure Cognitive Services.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowIcon />}
                    onClick={handleGetStarted}
                    sx={{
                      background: "linear-gradient(135deg, #FF6B35, #F7C815)",
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      "&:hover": {
                        background: "linear-gradient(135deg, #E55A2B, #E0B513)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 10px 30px rgba(255, 107, 53, 0.4)",
                      },
                    }}
                  >
                    {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      color: "white",
                      px: 4,
                      py: 1.5,
                      "&:hover": {
                        borderColor: "#FF6B35",
                        background: "rgba(255, 107, 53, 0.1)",
                      },
                    }}
                    onClick={() =>
                      document
                        .getElementById("features")
                        .scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Learn More
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<DocsIcon />}
                    sx={{
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      color: "white",
                      px: 3,
                      py: 1.5,
                      "&:hover": {
                        borderColor: "#70A1FF",
                        background: "rgba(112, 161, 255, 0.1)",
                      },
                    }}
                    onClick={() =>
                      window.open(
                        "https://github.com/utkarshware/Guvi_HoneyPot#readme",
                        "_blank",
                      )
                    }
                  >
                    Documentation
                  </Button>
                </Stack>
              </motion.div>

              {/* Stats */}
              <motion.div variants={itemVariants}>
                <Grid container spacing={3}>
                  {stats.map((stat, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            background:
                              "linear-gradient(135deg, #FF6B35, #F7C815)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={5}>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
                <Box
                  sx={{
                    position: "relative",
                    p: 4,
                    background: "rgba(255, 255, 255, 0.03)",
                    borderRadius: 4,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      right: -20,
                      width: 100,
                      height: 100,
                      background: "linear-gradient(135deg, #FF6B35, #F7C815)",
                      borderRadius: "50%",
                      filter: "blur(50px)",
                      opacity: 0.5,
                    }}
                  />
                  <ShieldIcon
                    sx={{
                      fontSize: 120,
                      color: "primary.main",
                      opacity: 0.8,
                      display: "block",
                      mx: "auto",
                      mb: 3,
                    }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ textAlign: "center", mb: 2, fontWeight: 600 }}
                  >
                    Protected Detection
                  </Typography>
                  <Stack spacing={1.5}>
                    {[
                      "Bank Fraud Detection",
                      "UPI Scam Protection",
                      "Phishing Link Analysis",
                      "Voice Call Verification",
                    ].map((item, i) => (
                      <Box
                        key={i}
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <CheckIcon sx={{ color: "#2ED573", fontSize: 20 }} />
                        <Typography variant="body2">{item}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>

      {/* Azure Services Section */}
      <Box
        sx={{
          py: 8,
          background: "rgba(0, 0, 0, 0.3)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h6"
              sx={{ textAlign: "center", mb: 4, color: "text.secondary" }}
            >
              Powered by Microsoft Azure Cognitive Services
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              {azureServices.map((service, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 3,
                        background: "rgba(255, 255, 255, 0.03)",
                        borderRadius: 3,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor: "primary.main",
                          background: "rgba(255, 107, 53, 0.1)",
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          mx: "auto",
                          mb: 2,
                          background:
                            "linear-gradient(135deg, #FF6B35, #F7C815)",
                        }}
                      >
                        {service.icon}
                      </Avatar>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {service.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {service.desc}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Container
        id="features"
        maxWidth="lg"
        sx={{ py: 10, position: "relative", zIndex: 1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            sx={{ textAlign: "center", fontWeight: 700, mb: 2 }}
          >
            Powerful{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #FF6B35, #F7C815)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Features
            </Box>
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center", mb: 6, maxWidth: 600, mx: "auto" }}
          >
            Comprehensive scam detection powered by cutting-edge AI and
            Microsoft Azure Cognitive Services
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    background: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: feature.color,
                      boxShadow: `0 10px 40px ${feature.color}20`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        mb: 2,
                        background: `${feature.color}20`,
                        color: feature.color,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ py: 10, position: "relative", zIndex: 1 }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Box
              sx={{
                textAlign: "center",
                p: 6,
                background:
                  "linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(247, 200, 21, 0.1))",
                borderRadius: 4,
                border: "1px solid rgba(255, 107, 53, 0.3)",
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                Ready to Detect Scams?
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ mb: 4, maxWidth: 500, mx: "auto" }}
              >
                Start protecting yourself and extract intelligence from scammers
                using our AI-powered detection system.
              </Typography>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowIcon />}
                onClick={handleGetStarted}
                sx={{
                  background: "linear-gradient(135deg, #FF6B35, #F7C815)",
                  fontWeight: 600,
                  px: 5,
                  py: 1.5,
                  fontSize: "1.1rem",
                  "&:hover": {
                    background: "linear-gradient(135deg, #E55A2B, #E0B513)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 30px rgba(255, 107, 53, 0.4)",
                  },
                }}
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ShieldIcon sx={{ color: "primary.main" }} />
              <Typography variant="body2" color="text.secondary">
                © 2026 HoneyGuard AI. All rights reserved.
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Powered by Microsoft Azure Cognitive Services
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
