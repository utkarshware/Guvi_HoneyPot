import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Alert,
  Chip,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress,
  Snackbar,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Screenshot as ScreenshotIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon,
  Warning as WarningIcon,
  Link as LinkIcon,
  Phone as PhoneIcon,
  AccountBalance as BankIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Translate as TranslateIcon,
  Language as LanguageIcon,
  Visibility as VisionIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import GlassCard from "../components/GlassCard";
import AnimatedButton from "../components/AnimatedButton";
import ResultCard from "../components/ResultCard";
import { honeyGuardAPI } from "../services/api";

const ScreenshotCheck = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState([]);
  const [extractedText, setExtractedText] = useState("");
  const [sessionId, setSessionId] = useState(() =>
    honeyGuardAPI.generateSessionId(),
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [supportedLanguages] = useState(honeyGuardAPI.getSupportedLanguages());
  const [serviceStatus] = useState(honeyGuardAPI.getServiceStatus());

  const onDrop = useCallback((acceptedFiles) => {
    const newImages = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
      id: Math.random().toString(36).substr(2, 9),
    }));
    setUploadedImages((prev) => [...prev, ...newImages]);
    setSnackbar({
      open: true,
      message: `${acceptedFiles.length} image(s) uploaded`,
      severity: "success",
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeImage = (id) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  };

  const analyzeScreenshots = async () => {
    if (uploadedImages.length === 0) return;

    setIsAnalyzing(true);
    setResults([]);

    try {
      // Analyze each image using the API service
      for (let i = 0; i < uploadedImages.length; i++) {
        const analysisResult = await honeyGuardAPI.analyzeScreenshot(
          uploadedImages[i].file,
          sessionId,
        );

        setExtractedText(analysisResult.extractedText);
        setResults((prev) => [
          ...prev,
          {
            ...analysisResult,
            imageId: uploadedImages[i].id,
            imageName: uploadedImages[i].name,
          },
        ]);
      }

      const hasScams = results.some((r) => r.scamDetected);
      setSnackbar({
        open: true,
        message: hasScams
          ? "⚠️ Scam content detected in screenshots!"
          : "Analysis complete",
        severity: hasScams ? "warning" : "success",
      });
    } catch (error) {
      console.error("Screenshot analysis error:", error);
      setSnackbar({
        open: true,
        message: `Analysis failed: ${error.message}`,
        severity: "error",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  const resetSession = () => {
    setUploadedImages([]);
    setSelectedImage(null);
    setResults([]);
    setExtractedText("");
    setSessionId(honeyGuardAPI.generateSessionId());
    honeyGuardAPI.clearSession(sessionId);
    setSnackbar({
      open: true,
      message: "Session reset successfully",
      severity: "info",
    });
  };

  const exportSession = () => {
    const sessionData = honeyGuardAPI.getSessionSummary(sessionId);
    const exportData = {
      ...sessionData,
      results,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `screenshot-analysis-${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSnackbar({
      open: true,
      message: "Session exported successfully",
      severity: "success",
    });
  };

  const detectionFeatures = [
    {
      icon: <VisionIcon />,
      title: "Azure Computer Vision",
      desc: "OCR text extraction from images",
    },
    {
      icon: <LinkIcon />,
      title: "Phishing URLs",
      desc: "Detect malicious and suspicious links",
    },
    {
      icon: <PhoneIcon />,
      title: "Phone Numbers",
      desc: "Extract scammer contact numbers",
    },
    {
      icon: <BankIcon />,
      title: "Banking Scams",
      desc: "Identify fake bank notifications",
    },
    {
      icon: <SecurityIcon />,
      title: "UPI Fraud",
      desc: "Detect UPI-based payment scams",
    },
    {
      icon: <TranslateIcon />,
      title: "Multi-Language",
      desc: "Auto-detect and translate text",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ pb: 8 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            <ScreenshotIcon
              sx={{ mr: 2, verticalAlign: "middle", color: "primary.main" }}
            />
            Screenshot Scam Check
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Upload screenshots of suspicious messages. Powered by Microsoft
            Azure Computer Vision for OCR and multi-language text extraction and
            analysis.
          </Typography>

          {/* Azure Service Status */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              mt: 2,
              flexWrap: "wrap",
            }}
          >
            <Chip
              icon={<VisionIcon />}
              label={`Vision: ${serviceStatus.vision}`}
              size="small"
              color={
                serviceStatus.vision === "configured" ? "success" : "default"
              }
              variant="outlined"
            />
            <Chip
              icon={<TranslateIcon />}
              label={`Translator: ${serviceStatus.translator}`}
              size="small"
              color={
                serviceStatus.translator === "configured"
                  ? "success"
                  : "default"
              }
              variant="outlined"
            />
            <Chip
              icon={<LanguageIcon />}
              label={`Language: ${serviceStatus.language}`}
              size="small"
              color={
                serviceStatus.language === "configured" ? "success" : "default"
              }
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Features */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {detectionFeatures.map((feature, index) => (
            <Grid item xs={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Paper
                  sx={{
                    p: 2,
                    textAlign: "center",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 2,
                    transition: "all 0.3s",
                    "&:hover": {
                      background: "rgba(255, 107, 53, 0.1)",
                      borderColor: "rgba(255, 107, 53, 0.3)",
                    },
                  }}
                >
                  <Box sx={{ color: "primary.main", mb: 1 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {feature.desc}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          {/* Upload Section */}
          <Grid item xs={12} md={6}>
            <GlassCard glow>
              <Typography
                variant="h6"
                sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
              >
                <UploadIcon color="primary" />
                Upload Screenshots
              </Typography>

              {/* Dropzone */}
              <Box
                {...getRootProps()}
                sx={{
                  p: 4,
                  border: "2px dashed",
                  borderColor: isDragActive
                    ? "primary.main"
                    : "rgba(255, 255, 255, 0.2)",
                  borderRadius: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  background: isDragActive
                    ? "rgba(255, 107, 53, 0.1)"
                    : "rgba(255, 255, 255, 0.02)",
                  "&:hover": {
                    borderColor: "primary.main",
                    background: "rgba(255, 107, 53, 0.05)",
                  },
                }}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={{ y: isDragActive ? -10 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <UploadIcon
                    sx={{ fontSize: 50, color: "primary.main", mb: 2 }}
                  />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {isDragActive
                      ? "Drop your screenshots here"
                      : "Drag & drop screenshots"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    or click to browse (PNG, JPG, WEBP - Max 10MB each)
                  </Typography>
                </motion.div>
              </Box>

              {/* Uploaded Images Preview */}
              <AnimatePresence>
                {uploadedImages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Box sx={{ mt: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 2, color: "text.secondary" }}
                      >
                        Uploaded ({uploadedImages.length}/5):
                      </Typography>
                      <Grid container spacing={2}>
                        {uploadedImages.map((image) => (
                          <Grid item xs={6} key={image.id}>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                            >
                              <Paper
                                sx={{
                                  position: "relative",
                                  overflow: "hidden",
                                  borderRadius: 2,
                                  border:
                                    selectedImage?.id === image.id
                                      ? "2px solid"
                                      : "1px solid rgba(255, 255, 255, 0.1)",
                                  borderColor:
                                    selectedImage?.id === image.id
                                      ? "primary.main"
                                      : "rgba(255, 255, 255, 0.1)",
                                  cursor: "pointer",
                                  "&:hover .image-overlay": {
                                    opacity: 1,
                                  },
                                }}
                                onClick={() => setSelectedImage(image)}
                              >
                                <Box
                                  component="img"
                                  src={image.preview}
                                  alt={image.name}
                                  sx={{
                                    width: "100%",
                                    height: 120,
                                    objectFit: "cover",
                                  }}
                                />
                                <Box
                                  className="image-overlay"
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: "rgba(0, 0, 0, 0.6)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 1,
                                    opacity: 0,
                                    transition: "opacity 0.3s",
                                  }}
                                >
                                  <Tooltip title="Preview">
                                    <IconButton
                                      size="small"
                                      sx={{ color: "white" }}
                                    >
                                      <ZoomInIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Remove">
                                    <IconButton
                                      size="small"
                                      sx={{ color: "error.main" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(image.id);
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                                <Box sx={{ p: 1 }}>
                                  <Typography variant="caption" noWrap>
                                    {image.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    {image.size}
                                  </Typography>
                                </Box>
                              </Paper>
                            </motion.div>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Analyze Button */}
              <Box sx={{ mt: 3 }}>
                <AnimatedButton
                  fullWidth
                  icon={<ScreenshotIcon />}
                  loading={isAnalyzing}
                  onClick={analyzeScreenshots}
                  disabled={uploadedImages.length === 0}
                >
                  {isAnalyzing
                    ? "Analyzing Screenshots..."
                    : `Analyze ${uploadedImages.length} Screenshot${uploadedImages.length !== 1 ? "s" : ""}`}
                </AnimatedButton>
              </Box>

              {/* Progress */}
              {isAnalyzing && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(results.length / uploadedImages.length) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 3,
                        background: "linear-gradient(90deg, #FF6B35, #F7C815)",
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Processing {results.length + 1} of {uploadedImages.length}
                    ...
                  </Typography>
                </Box>
              )}
            </GlassCard>

            {/* Selected Image Preview */}
            {selectedImage && (
              <GlassCard sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Preview: {selectedImage.name}
                </Typography>
                <Box
                  component="img"
                  src={selectedImage.preview}
                  alt={selectedImage.name}
                  sx={{
                    width: "100%",
                    maxHeight: 400,
                    objectFit: "contain",
                    borderRadius: 2,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                />
              </GlassCard>
            )}
          </Grid>

          {/* Results Section */}
          <Grid item xs={12} md={6}>
            {isAnalyzing && results.length === 0 ? (
              <GlassCard hover={false}>
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <CircularProgress
                    size={60}
                    sx={{ color: "primary.main", mb: 3 }}
                  />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Processing Screenshots...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Extracting text and analyzing for scam patterns
                  </Typography>
                </Box>
              </GlassCard>
            ) : results.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Extracted Text */}
                {extractedText && (
                  <GlassCard>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <ImageIcon color="primary" />
                      Extracted Text (OCR)
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace" }}
                      >
                        {extractedText}
                      </Typography>
                    </Paper>
                  </GlassCard>
                )}

                {/* Analysis Results */}
                {results.map((result, index) => (
                  <motion.div
                    key={result.imageId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <ResultCard result={result} />
                  </motion.div>
                ))}
              </Box>
            ) : (
              <GlassCard hover={false}>
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <ScreenshotIcon
                    sx={{
                      fontSize: 60,
                      color: "text.secondary",
                      mb: 2,
                      opacity: 0.5,
                    }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    No Screenshots Analyzed
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload and analyze screenshots to detect scam patterns
                  </Typography>
                </Box>
              </GlassCard>
            )}

            {/* API Info */}
            <Alert
              severity="info"
              icon={<WarningIcon />}
              sx={{
                mt: 3,
                background: "rgba(112, 161, 255, 0.1)",
                border: "1px solid rgba(112, 161, 255, 0.3)",
              }}
            >
              <Typography variant="body2">
                <strong>OCR Integration:</strong> This demo uses simulated OCR.
                The analysis engine extracts text patterns and identifies
                potential scam indicators including phone numbers, UPI IDs,
                phishing links, and urgency tactics.
              </Typography>
            </Alert>
          </Grid>
        </Grid>

        {/* Session Controls */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mt: 4,
            pt: 3,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={resetSession}
            sx={{
              borderColor: "rgba(255, 255, 255, 0.3)",
              "&:hover": { borderColor: "primary.main" },
            }}
          >
            New Session
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportSession}
            disabled={results.length === 0}
            sx={{
              borderColor: "rgba(255, 255, 255, 0.3)",
              "&:hover": { borderColor: "primary.main" },
            }}
          >
            Export Results
          </Button>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default ScreenshotCheck;
