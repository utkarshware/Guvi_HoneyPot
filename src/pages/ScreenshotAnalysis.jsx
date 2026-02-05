import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
} from "@mui/material";
import {
  Image as ImageIcon,
  CloudUpload as UploadIcon,
  Psychology as PsychologyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Shield as ShieldIcon,
  TextFields as TextIcon,
  Screenshot as ScreenshotIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { styled } from "@mui/material/styles";
import { azureServices } from "../services/azureServices";
import { useSession } from "../context/SessionContext";

// Styled Components
const GlassCard = styled(Paper)(({ theme, glow }) => ({
  background:
    "linear-gradient(145deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)",
  backdropFilter: "blur(20px)",
  border: `1px solid ${glow ? "rgba(255, 107, 53, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
  borderRadius: 16,
  padding: theme.spacing(3),
  boxShadow: glow
    ? "0 0 40px rgba(255, 107, 53, 0.15)"
    : "0 8px 32px rgba(0, 0, 0, 0.3)",
}));

const AnimatedButton = styled(motion.button)(({ theme }) => ({
  background: "linear-gradient(135deg, #FF6B35 0%, #F7C815 100%)",
  border: "none",
  borderRadius: 12,
  padding: "14px 28px",
  color: "white",
  fontSize: "1rem",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  width: "100%",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 10px 30px rgba(255, 107, 53, 0.4)",
  },
  "&:disabled": {
    opacity: 0.6,
    cursor: "not-allowed",
    transform: "none",
  },
}));

const UploadArea = styled(Paper)(({ theme, isDragging }) => ({
  padding: theme.spacing(6),
  background: isDragging
    ? "rgba(255, 107, 53, 0.1)"
    : "rgba(255, 255, 255, 0.03)",
  border: `2px dashed ${isDragging ? "#FF6B35" : "rgba(255, 107, 53, 0.3)"}`,
  borderRadius: 16,
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "rgba(255, 107, 53, 0.6)",
    background: "rgba(255, 255, 255, 0.05)",
  },
}));

const ScreenshotAnalysis = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const imageInputRef = useRef(null);

  // Session management hooks
  const {
    startSession,
    updateCurrentSession,
    recordScamDetection,
    submitCurrentSession,
  } = useSession();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processImage(file);
    } else {
      setError("Please upload a valid image file (PNG, JPG, JPEG, etc.)");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = (file) => {
    setImageFile(file);
    setAnalysisResult(null);
    setExtractedText("");
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeScreenshot = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    try {
      // Step 1: Extract text using OCR (40%)
      setProgress(10);
      console.log("Starting OCR for file:", imageFile.name);
      const ocrResult = await azureServices.extractTextFromImage(imageFile);
      setProgress(40);
      console.log("OCR Result:", ocrResult);

      const text = ocrResult.text || "";
      setExtractedText(text);

      if (!text || text.trim().length === 0) {
        throw new Error(
          "No text found in the image. Please upload an image containing readable text.",
        );
      }

      // Step 2: Analyze text for scam patterns (60%)
      setProgress(50);
      const scamPatterns = azureServices.analyzeForScamPatterns(text);
      setProgress(60);

      // Step 3: Analyze text sentiment and entities (80%)
      setProgress(70);
      const textAnalysis = await azureServices.analyzeText(text);
      setProgress(80);

      // Step 4: Extract intelligence (phone numbers, links, etc.)
      const intelligence = azureServices.extractIntelligence(text);
      setProgress(90);

      // Calculate risk score
      const riskScore = calculateRiskScore(
        scamPatterns,
        textAnalysis,
        intelligence,
      );
      const riskLevel = getRiskLevel(riskScore);
      const isScam = riskScore >= 40;

      // Generate patterns list for display
      const detectedPatterns = [];
      if (scamPatterns.urgencyTactics.length > 0) {
        detectedPatterns.push(
          `Urgency tactics detected: ${scamPatterns.urgencyTactics.join(", ")}`,
        );
      }
      if (scamPatterns.financialRequests.length > 0) {
        detectedPatterns.push(
          `Financial keywords found: ${scamPatterns.financialRequests.join(", ")}`,
        );
      }
      if (scamPatterns.impersonation.length > 0) {
        detectedPatterns.push(
          `Impersonation attempt: ${scamPatterns.impersonation.join(", ")}`,
        );
      }
      if (scamPatterns.dataRequests.length > 0) {
        detectedPatterns.push(
          `Data/credential requests: ${scamPatterns.dataRequests.join(", ")}`,
        );
      }
      if (intelligence.phishingLinks.length > 0) {
        detectedPatterns.push(
          `Suspicious links detected: ${intelligence.phishingLinks.length}`,
        );
      }
      if (intelligence.phoneNumbers.length > 0) {
        detectedPatterns.push(
          `Phone numbers found: ${intelligence.phoneNumbers.join(", ")}`,
        );
      }
      if (intelligence.upiIds.length > 0) {
        detectedPatterns.push(
          `UPI IDs detected: ${intelligence.upiIds.join(", ")}`,
        );
      }

      // Generate recommendations
      const recommendations = generateRecommendations(
        riskScore,
        scamPatterns,
        intelligence,
      );

      // Combine results
      const result = {
        isScam,
        confidence: Math.min(95, 60 + riskScore * 0.35),
        riskLevel,
        riskScore,
        patterns: detectedPatterns,
        recommendations,
        sentiment: textAnalysis.sentiment,
        keyPhrases: textAnalysis.keyPhrases || [],
        entities: textAnalysis.entities || [],
        extractedText: text,
        linesExtracted: ocrResult.lines?.length || text.split("\n").length,
        intelligence,
        isRealAzure: !ocrResult.note, // Check if using real Azure or mock
      };

      setAnalysisResult(result);
      setProgress(100);

      // Start session and record results for GUVI callback
      const sessionId = startSession("screenshot");

      // Build suspicious keywords from patterns
      const suspiciousKeywords = [
        ...scamPatterns.urgencyTactics,
        ...scamPatterns.financialRequests,
        ...scamPatterns.impersonation,
        ...scamPatterns.dataRequests,
      ].slice(0, 10); // Limit to 10 keywords

      // Update session with extracted intelligence
      updateCurrentSession({
        totalMessagesExchanged: 1, // Single screenshot analysis
        extractedIntelligence: {
          bankAccounts: intelligence.bankAccounts || [],
          upiIds: intelligence.upiIds || [],
          phishingLinks: intelligence.phishingLinks || [],
          phoneNumbers: intelligence.phoneNumbers || [],
          suspiciousKeywords,
        },
        agentNotes: `Screenshot Analysis: Risk Level ${riskLevel} (${riskScore}%). ${detectedPatterns.length} suspicious patterns detected. Sentiment: ${textAnalysis.sentiment}. ${text.length} characters extracted via OCR.`,
      });

      // Record scam detection result
      recordScamDetection(isScam);

      setSnackbar({
        open: true,
        message: `Analysis complete! Session ${sessionId.slice(0, 8)}... created for GUVI submission.`,
        severity: isScam ? "warning" : "success",
      });
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err.message || "Failed to analyze screenshot. Please try again.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateRiskScore = (patterns, textAnalysis, intelligence) => {
    let score = 0;

    // Pattern contributions
    score += patterns.urgencyTactics.length * 12;
    score += patterns.financialRequests.length * 10;
    score += patterns.impersonation.length * 18;
    score += patterns.dataRequests.length * 15;
    score += patterns.suspiciousLinks.length * 20;

    // Intelligence contributions
    score += intelligence.phoneNumbers.length * 8;
    score += intelligence.upiIds.length * 15;
    score += intelligence.phishingLinks.length * 25;

    // Sentiment contribution
    if (textAnalysis.sentiment === "negative") score += 15;
    if (textAnalysis.sentiment === "mixed") score += 8;

    return Math.min(100, score);
  };

  const getRiskLevel = (score) => {
    if (score >= 70) return "High";
    if (score >= 40) return "Medium";
    if (score >= 20) return "Low";
    return "Minimal";
  };

  const generateRecommendations = (riskScore, patterns, intelligence) => {
    const recs = [];

    if (riskScore >= 70) {
      recs.push(
        "🚨 This is very likely a SCAM. Do NOT respond or click any links.",
      );
      recs.push(
        "Do NOT share any personal information, OTPs, or banking details.",
      );
      recs.push(
        "Report this to cybercrime.gov.in or call 1930 (India Cyber Crime Helpline).",
      );
    } else if (riskScore >= 40) {
      recs.push("⚠️ Exercise extreme caution with this message.");
      recs.push(
        "Verify the sender through official channels before responding.",
      );
    }

    if (patterns.impersonation.length > 0) {
      recs.push(
        "Banks and government agencies NEVER ask for OTPs or passwords via messages.",
      );
    }
    if (intelligence.phishingLinks.length > 0) {
      recs.push("Do NOT click any links. They may lead to phishing sites.");
    }
    if (intelligence.upiIds.length > 0) {
      recs.push(
        "Never send money to unknown UPI IDs, especially for 'prizes' or 'verification'.",
      );
    }
    if (patterns.dataRequests.length > 0) {
      recs.push(
        "Never share OTP, PIN, CVV, or passwords with anyone over phone or message.",
      );
    }

    if (recs.length === 0) {
      recs.push(
        "This appears relatively safe, but always verify unexpected messages.",
      );
      recs.push(
        "When in doubt, contact the organization directly through official channels.",
      );
    }

    return recs;
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "#ff4757";
      case "medium":
        return "#ffa502";
      case "low":
        return "#2ed573";
      default:
        return "#70a1ff";
    }
  };

  const clearAnalysis = () => {
    setImageFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setExtractedText("");
    setError(null);
    setProgress(0);
  };

  // Submit current session to GUVI callback endpoint
  const handleSubmitToGuvi = async () => {
    try {
      const result = await submitCurrentSession();
      if (result.success) {
        setSnackbar({
          open: true,
          message: `Successfully submitted to GUVI! Session: ${result.sessionId?.slice(0, 8)}...`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: `Submission failed: ${result.error}`,
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error submitting to GUVI: ${err.message}`,
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              p: 2,
              borderRadius: 3,
              background: "rgba(255, 107, 53, 0.1)",
            }}
          >
            <ScreenshotIcon sx={{ fontSize: 40, color: "primary.main" }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Screenshot Fraud Analyzer
            </Typography>
          </Box>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Upload a screenshot of suspicious messages, emails, or websites. Our
            AI will extract text and detect potential fraud patterns.
          </Typography>
        </motion.div>
      </Box>

      <Grid container spacing={4}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <GlassCard glow>
            <Typography
              variant="h6"
              sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
            >
              <UploadIcon color="primary" />
              Upload Screenshot
            </Typography>

            <UploadArea
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => imageInputRef.current?.click()}
            >
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleFileSelect}
                accept="image/*,.png,.jpg,.jpeg,.gif,.webp,.bmp"
                style={{ display: "none" }}
              />
              {imagePreview ? (
                <Box>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 300,
                      borderRadius: 8,
                      objectFit: "contain",
                    }}
                  />
                </Box>
              ) : (
                <>
                  <ImageIcon
                    sx={{ fontSize: 64, color: "primary.main", mb: 2 }}
                  />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Drop screenshot here
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    or click to browse
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 2 }}
                  >
                    Supported: PNG, JPG, JPEG, GIF, WebP, BMP (max 10MB)
                  </Typography>
                </>
              )}
            </UploadArea>

            {imageFile && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  icon={<ImageIcon />}
                  label={`${imageFile.name} (${(imageFile.size / 1024 / 1024).toFixed(2)} MB)`}
                  onDelete={clearAnalysis}
                  color="primary"
                  variant="outlined"
                  sx={{ width: "100%" }}
                />
              </Box>
            )}

            {/* Progress Bar */}
            {isAnalyzing && (
              <Box sx={{ mt: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="caption">Analyzing...</Typography>
                  <Typography variant="caption">{progress}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "rgba(255, 107, 53, 0.2)",
                    "& .MuiLinearProgress-bar": {
                      background: "linear-gradient(90deg, #FF6B35, #F7C815)",
                    },
                  }}
                />
              </Box>
            )}

            <AnimatedButton
              onClick={analyzeScreenshot}
              disabled={!imageFile || isAnalyzing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ marginTop: 24 }}
            >
              {isAnalyzing ? (
                <>
                  <CircularProgress size={20} color="inherit" />
                  Analyzing Screenshot...
                </>
              ) : (
                <>
                  <PsychologyIcon />
                  Analyze for Fraud
                </>
              )}
            </AnimatedButton>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {/* Azure Info */}
            <Alert
              severity="info"
              icon={<InfoIcon />}
              sx={{ mt: 3, background: "rgba(112, 161, 255, 0.1)" }}
            >
              <Typography variant="body2">
                <strong>Powered by Azure:</strong> Computer Vision OCR for text
                extraction, Text Analytics for analysis, and AI pattern
                detection.
              </Typography>
            </Alert>
          </GlassCard>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          <AnimatePresence mode="wait">
            {analysisResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard
                  glow
                  sx={{
                    borderColor: getRiskColor(analysisResult.riskLevel),
                  }}
                >
                  {/* Risk Score Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {analysisResult.isScam ? (
                        <ErrorIcon sx={{ fontSize: 40, color: "#ff4757" }} />
                      ) : (
                        <CheckIcon sx={{ fontSize: 40, color: "#2ed573" }} />
                      )}
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {analysisResult.isScam
                            ? "⚠️ Potential Fraud Detected"
                            : "✅ Appears Legitimate"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Confidence: {analysisResult.confidence}%
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={`${analysisResult.riskLevel} Risk`}
                      sx={{
                        backgroundColor: `${getRiskColor(analysisResult.riskLevel)}20`,
                        color: getRiskColor(analysisResult.riskLevel),
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  {/* Risk Score Bar */}
                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">Risk Score</Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: getRiskColor(analysisResult.riskLevel) }}
                      >
                        {analysisResult.riskScore}/100
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={analysisResult.riskScore}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: getRiskColor(
                            analysisResult.riskLevel,
                          ),
                        },
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Extracted Text */}
                  {extractedText && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <TextIcon fontSize="small" color="primary" />
                        Extracted Text ({analysisResult.linesExtracted} lines)
                      </Typography>
                      <Paper
                        sx={{
                          p: 2,
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: 2,
                          maxHeight: 150,
                          overflow: "auto",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "pre-wrap" }}
                        >
                          {extractedText}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  {/* Detected Patterns */}
                  {analysisResult.patterns?.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <WarningIcon fontSize="small" color="warning" />
                        Detected Fraud Patterns
                      </Typography>
                      <List dense>
                        {analysisResult.patterns.map((pattern, idx) => (
                          <ListItem key={idx}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <ErrorIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText primary={pattern} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Recommendations */}
                  {analysisResult.recommendations?.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <ShieldIcon fontSize="small" color="success" />
                        Recommendations
                      </Typography>
                      <List dense>
                        {analysisResult.recommendations.map((rec, idx) => (
                          <ListItem key={idx}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <CheckIcon fontSize="small" color="success" />
                            </ListItemIcon>
                            <ListItemText primary={rec} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Stats */}
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Card sx={{ background: "rgba(255, 255, 255, 0.05)" }}>
                        <CardContent sx={{ textAlign: "center", py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Sentiment
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              textTransform: "capitalize",
                              fontWeight: 600,
                            }}
                          >
                            {analysisResult.sentiment || "Neutral"}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card sx={{ background: "rgba(255, 255, 255, 0.05)" }}>
                        <CardContent sx={{ textAlign: "center", py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Key Phrases
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {analysisResult.keyPhrases?.length || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card sx={{ background: "rgba(255, 255, 255, 0.05)" }}>
                        <CardContent sx={{ textAlign: "center", py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Entities
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {analysisResult.entities?.length || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* GUVI Submission Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleSubmitToGuvi}
                    sx={{
                      mt: 3,
                      py: 1.5,
                      background: "linear-gradient(135deg, #FF6B35, #F7C815)",
                      fontWeight: 600,
                      "&:hover": {
                        background: "linear-gradient(135deg, #e55a2b, #d9b012)",
                      },
                    }}
                  >
                    Submit to GUVI Evaluation
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={clearAnalysis}
                    sx={{ mt: 2 }}
                  >
                    Analyze Another Screenshot
                  </Button>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <GlassCard>
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <ShieldIcon
                      sx={{
                        fontSize: 80,
                        color: "rgba(255, 255, 255, 0.1)",
                        mb: 2,
                      }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      Upload a screenshot to start analysis
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Our AI will extract text and detect potential fraud
                      patterns
                    </Typography>
                  </Box>

                  {/* Common Screenshot Types */}
                  <Divider sx={{ my: 3 }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, color: "text.secondary" }}
                  >
                    What We Can Analyze:
                  </Typography>
                  <Grid container spacing={1}>
                    {[
                      "SMS/Text Messages",
                      "Email Screenshots",
                      "Social Media DMs",
                      "Website Popups",
                      "Payment Requests",
                      "Fake Invoices",
                    ].map((type) => (
                      <Grid item xs={6} key={type}>
                        <Chip
                          label={type}
                          size="small"
                          variant="outlined"
                          sx={{ width: "100%" }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ScreenshotAnalysis;
