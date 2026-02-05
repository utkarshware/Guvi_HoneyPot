import React from "react";
import { Box, Typography, Container, Button, Chip, Stack } from "@mui/material";
import { motion } from "framer-motion";
import {
  Shield as ShieldIcon,
  Psychology as PsychologyIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

const HeroSection = () => {
  const features = [
    { icon: <ShieldIcon />, label: "Scam Detection" },
    { icon: <PsychologyIcon />, label: "AI-Powered" },
    { icon: <VisibilityIcon />, label: "Real-time Analysis" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        pt: { xs: 10, md: 0 },
        pb: { xs: 8, md: 0 },
        position: "relative",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Chip
              label="🛡️ AI-Powered Protection"
              sx={{
                mb: 3,
                py: 2.5,
                px: 1,
                background: "rgba(255, 107, 53, 0.15)",
                border: "1px solid rgba(255, 107, 53, 0.3)",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
                fontWeight: 800,
                lineHeight: 1.1,
                mb: 3,
              }}
            >
              Agentic{" "}
              <Box
                component="span"
                sx={{
                  background:
                    "linear-gradient(135deg, #FF6B35 0%, #F7C815 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Honey-Pot
              </Box>
              <br />
              for Scam Detection
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography
              variant="h5"
              sx={{
                color: "text.secondary",
                maxWidth: 700,
                mx: "auto",
                mb: 4,
                fontWeight: 400,
                lineHeight: 1.7,
              }}
            >
              AI-powered system that detects scam intent, engages scammers
              autonomously, and extracts valuable intelligence without revealing
              detection.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              flexWrap="wrap"
              sx={{ mb: 5, gap: 2 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <Chip
                    icon={feature.icon}
                    label={feature.label}
                    sx={{
                      py: 2.5,
                      px: 1,
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      "& .MuiChip-icon": {
                        color: "primary.main",
                      },
                    }}
                  />
                </motion.div>
              ))}
            </Stack>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  px: 5,
                  py: 1.5,
                  fontSize: "1.1rem",
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => window.open("https://github.com/utkarshware/Guvi_HoneyPot#readme", "_blank")}
                sx={{
                  px: 5,
                  py: 1.5,
                  fontSize: "1.1rem",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "white",
                  "&:hover": {
                    borderColor: "primary.main",
                    background: "rgba(255, 107, 53, 0.1)",
                  },
                }}
              >
                View Documentation
              </Button>
            </Stack>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, md: 8 }}
              justifyContent="center"
              sx={{ mt: 8 }}
            >
              {[
                { value: "99.2%", label: "Detection Accuracy" },
                { value: "<100ms", label: "Response Time" },
                { value: "24/7", label: "AI Monitoring" },
              ].map((stat) => (
                <Box key={stat.label} sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #FF6B35, #F7C815)",
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
              ))}
            </Stack>
          </motion.div>
        </Box>
      </Container>

      {/* Gradient Orbs */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: 400,
          height: 400,
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
          right: "10%",
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

export default HeroSection;
