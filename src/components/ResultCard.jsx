import React from "react";
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import GlassCard from "./GlassCard";

const ResultCard = ({ result, type = "analysis" }) => {
  if (!result) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "scam":
      case "fraud":
      case "high":
        return "error";
      case "suspicious":
      case "medium":
        return "warning";
      case "safe":
      case "low":
        return "success";
      default:
        return "info";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "scam":
      case "fraud":
      case "high":
        return <ErrorIcon color="error" />;
      case "suspicious":
      case "medium":
        return <WarningIcon color="warning" />;
      case "safe":
      case "low":
        return <CheckCircleIcon color="success" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard glow hover={false}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Analysis Result
          </Typography>
          <Chip
            icon={getStatusIcon(result.status)}
            label={result.status || "Unknown"}
            color={getStatusColor(result.status)}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Risk Score */}
        {result.riskScore !== undefined && (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Risk Score
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {result.riskScore}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={result.riskScore}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  background:
                    result.riskScore > 70
                      ? "linear-gradient(90deg, #ff4757, #ff6b81)"
                      : result.riskScore > 40
                        ? "linear-gradient(90deg, #ffa502, #ffbe76)"
                        : "linear-gradient(90deg, #2ed573, #7bed9f)",
                },
              }}
            />
          </Box>
        )}

        <Divider sx={{ my: 2, borderColor: "rgba(255, 255, 255, 0.1)" }} />

        {/* Detected Patterns */}
        {result.patterns && result.patterns.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1.5, color: "text.secondary" }}
            >
              Detected Patterns
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {result.patterns.map((pattern, index) => (
                <Chip
                  key={index}
                  label={pattern}
                  size="small"
                  sx={{
                    background: "rgba(255, 107, 53, 0.15)",
                    border: "1px solid rgba(255, 107, 53, 0.3)",
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Intelligence Extracted */}
        {result.intelligence && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1.5, color: "text.secondary" }}
            >
              Extracted Intelligence
            </Typography>
            <List dense sx={{ py: 0 }}>
              {Object.entries(result.intelligence).map(
                ([key, value]) =>
                  value &&
                  value.length > 0 && (
                    <ListItem key={key} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <InfoIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={key.replace(/([A-Z])/g, " $1").trim()}
                        secondary={
                          Array.isArray(value) ? value.join(", ") : value
                        }
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: 500,
                        }}
                        secondaryTypographyProps={{ variant: "caption" }}
                      />
                    </ListItem>
                  ),
              )}
            </List>
          </Box>
        )}

        {/* AI Response */}
        {result.reply && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, color: "primary.main" }}
            >
              AI Agent Response
            </Typography>
            <Typography variant="body2" color="text.secondary">
              "{result.reply}"
            </Typography>
          </Box>
        )}

        {/* Summary */}
        {result.summary && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {result.summary}
            </Typography>
          </Box>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default ResultCard;
