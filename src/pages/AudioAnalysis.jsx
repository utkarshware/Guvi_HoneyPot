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
  AudioFile as AudioFileIcon,
  CloudUpload as UploadIcon,
  Psychology as PsychologyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Shield as ShieldIcon,
  RecordVoiceOver as VoiceIcon,
  Translate as TranslateIcon,
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

const AnimatedButton = styled(motion.button)(({ theme, variant }) => ({
  background:
    variant === "danger"
      ? "linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)"
      : "linear-gradient(135deg, #FF6B35 0%, #F7C815 100%)",
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

const AudioAnalysis = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [transcribedText, setTranscribedText] = useState("");
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const audioInputRef = useRef(null);

  // Session context for GUVI callback
  const {
    startSession,
    updateCurrentSession,
    recordScamDetection,
    submitCurrentSession,
    isReadyForSubmission,
    currentSessionId,
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
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      setAnalysisResult(null);
      setTranscribedText("");
      setError(null);
    } else {
      setError("Please upload a valid audio file (MP3, WAV, OGG, etc.)");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setAnalysisResult(null);
      setTranscribedText("");
      setError(null);
    }
  };

  const analyzeAudio = async () => {
    if (!audioFile) return;

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    // Start a new session for this analysis
    const session = startSession("audio");

    try {
      // Step 1: Transcribe audio (30%)
      setProgress(10);
      const transcription = await azureServices.transcribeAudio(audioFile);
      setProgress(30);

      const text = transcription.text || transcription.transcript || "";
      setTranscribedText(text);

      if (!text) {
        throw new Error(
          "Could not transcribe audio. Please ensure the audio contains clear speech.",
        );
      }

      // Update session with transcribed message
      updateCurrentSession({
        message: {
          sender: "scammer",
          text,
          source: "audio",
          fileName: audioFile.name,
        },
        source: "audio",
      });

      // Step 2: Analyze for scam patterns (60%)
      setProgress(50);
      const scamPatterns = azureServices.analyzeForScamPatterns(text);
      const riskScore = azureServices.calculateTextRiskScore(scamPatterns);
      const scamAnalysis = {
        isScam: riskScore >= 40,
        confidence: Math.min(95, 60 + riskScore * 0.35),
        riskLevel:
          riskScore >= 70
            ? "High"
            : riskScore >= 40
              ? "Medium"
              : riskScore >= 20
                ? "Low"
                : "Minimal",
        riskScore: riskScore,
        patterns: [
          ...scamPatterns.urgencyTactics,
          ...scamPatterns.financialRequests,
          ...scamPatterns.impersonation,
          ...scamPatterns.dataRequests,
        ],
        recommendations:
          riskScore >= 70
            ? [
                "This is very likely a SCAM. Do NOT respond.",
                "Do NOT share OTPs or banking details.",
              ]
            : riskScore >= 40
              ? [
                  "Exercise caution with this communication.",
                  "Verify the sender through official channels.",
                ]
              : ["This appears safe, but always stay vigilant."],
      };
      setProgress(70);

      // Step 3: Sentiment analysis (90%)
      const sentimentResult = await azureServices.analyzeText(text);
      setProgress(90);

      // Extract intelligence from the analysis
      const extractedIntelligence = {
        phoneNumbers: [
          ...new Set(text.match(/\+?91[-\s]?\d{10}|\+?\d{10,12}/g) || []),
        ],
        upiIds: [...new Set(text.match(/[\w.-]+@[\w]+/g) || [])],
        phishingLinks: [
          ...new Set(
            text.match(
              /https?:\/\/[^\s]+|[\w-]+\.(com|in|org|net|xyz|tk|ml)[^\s]*/gi,
            ) || [],
          ),
        ],
        bankAccounts: [...new Set(text.match(/\d{9,18}/g) || [])],
        suspiciousKeywords: scamAnalysis.patterns || [],
      };

      // Combine results
      const result = {
        isScam: scamAnalysis.isScam,
        scamDetected: scamAnalysis.isScam,
        confidence: scamAnalysis.confidence,
        riskLevel: scamAnalysis.riskLevel,
        riskScore: scamAnalysis.riskScore,
        patterns: scamAnalysis.patterns || [],
        recommendations: scamAnalysis.recommendations || [],
        sentiment: sentimentResult.sentiment,
        keyPhrases: sentimentResult.keyPhrases || [],
        entities: sentimentResult.entities || [],
        transcribedText: text,
        extractedIntelligence,
        summary: `Audio analysis: ${scamAnalysis.isScam ? "Scam detected" : "No scam detected"} with ${scamAnalysis.riskScore}% confidence`,
      };

      setAnalysisResult(result);
      setProgress(100);

      // Record scam detection result in session
      recordScamDetection(result);

      // Show success message
      if (result.isScam) {
        setSnackbar({
          open: true,
          message: "🚨 Scam detected! Session ready for GUVI submission.",
          severity: "warning",
        });
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.message || "Failed to analyze audio. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit to GUVI callback
  const handleSubmitToGuvi = async () => {
    const result = await submitCurrentSession();
    setSnackbar({
      open: true,
      message: result.success
        ? "✅ Successfully submitted to GUVI!"
        : `❌ Submission failed: ${result.message}`,
      severity: result.success ? "success" : "error",
    });
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
    setAudioFile(null);
    setAnalysisResult(null);
    setTranscribedText("");
    setError(null);
    setProgress(0);
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
            <AudioFileIcon sx={{ fontSize: 40, color: "primary.main" }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Audio Fraud Analyzer
            </Typography>
          </Box>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Upload an audio file (MP3, WAV, OGG) to detect potential scam
            patterns using Azure Speech Services and AI-powered analysis.
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
              Upload Audio File
            </Typography>

            <UploadArea
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => audioInputRef.current?.click()}
            >
              <input
                type="file"
                ref={audioInputRef}
                onChange={handleFileSelect}
                accept="audio/*,.mp3,.wav,.ogg,.webm,.m4a,.flac"
                style={{ display: "none" }}
              />
              <AudioFileIcon
                sx={{ fontSize: 64, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h6" sx={{ mb: 1 }}>
                {audioFile ? audioFile.name : "Drop audio file here"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to browse
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 2 }}
              >
                Supported: MP3, WAV, OGG, WebM, M4A, FLAC (max 25MB)
              </Typography>
            </UploadArea>

            {audioFile && (
              <Box sx={{ mt: 3 }}>
                <Chip
                  icon={<AudioFileIcon />}
                  label={`${audioFile.name} (${(audioFile.size / 1024 / 1024).toFixed(2)} MB)`}
                  onDelete={clearAnalysis}
                  color="primary"
                  variant="outlined"
                  sx={{ width: "100%", justifyContent: "space-between", py: 2 }}
                />

                {/* Audio Preview */}
                <Box sx={{ mt: 2 }}>
                  <audio
                    controls
                    src={URL.createObjectURL(audioFile)}
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                </Box>
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
              onClick={analyzeAudio}
              disabled={!audioFile || isAnalyzing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ marginTop: 24 }}
            >
              {isAnalyzing ? (
                <>
                  <CircularProgress size={20} color="inherit" />
                  Analyzing Audio...
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
                <strong>Powered by Azure:</strong> Speech-to-Text transcription,
                Text Analytics for sentiment, and AI pattern detection.
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

                  {/* Transcribed Text */}
                  {transcribedText && (
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
                        <VoiceIcon fontSize="small" color="primary" />
                        Transcribed Text
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
                        <Typography variant="body2">
                          {transcribedText}
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

                  {/* Sentiment & Key Phrases */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card sx={{ background: "rgba(255, 255, 255, 0.05)" }}>
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">
                            Sentiment
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ textTransform: "capitalize" }}
                          >
                            {analysisResult.sentiment || "Neutral"}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card sx={{ background: "rgba(255, 255, 255, 0.05)" }}>
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">
                            Key Phrases
                          </Typography>
                          <Typography variant="h6">
                            {analysisResult.keyPhrases?.length || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Submit to GUVI Button */}
                  {analysisResult.isScam && (
                    <Alert
                      severity="warning"
                      sx={{ mt: 3, background: "rgba(255, 165, 2, 0.1)" }}
                      action={
                        <Button
                          color="warning"
                          size="small"
                          startIcon={<SendIcon />}
                          onClick={handleSubmitToGuvi}
                        >
                          Submit to GUVI
                        </Button>
                      }
                    >
                      Scam detected! Submit results to GUVI for evaluation.
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={clearAnalysis}
                    sx={{ mt: 3 }}
                  >
                    Analyze Another Audio
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
                      Upload an audio file to start analysis
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Our AI will detect potential fraud patterns in voice
                      recordings
                    </Typography>
                  </Box>

                  {/* Common Scam Types */}
                  <Divider sx={{ my: 3 }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, color: "text.secondary" }}
                  >
                    Common Audio Scam Types We Detect:
                  </Typography>
                  <Grid container spacing={1}>
                    {[
                      "Tech Support Scams",
                      "IRS/Tax Fraud Calls",
                      "Bank Impersonation",
                      "Prize/Lottery Scams",
                      "Grandparent Scams",
                      "Debt Collection Fraud",
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
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AudioAnalysis;
