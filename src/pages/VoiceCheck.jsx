import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  IconButton,
  Chip,
  Paper,
  Alert,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Avatar,
  CircularProgress,
  Snackbar,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Send as SendIcon,
  VolumeUp as VolumeUpIcon,
  Psychology as PsychologyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Translate as TranslateIcon,
  AudioFile as AudioFileIcon,
  Upload as UploadIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../components/GlassCard";
import AnimatedButton from "../components/AnimatedButton";
import ResultCard from "../components/ResultCard";
import { honeyGuardAPI } from "../services/api";

const VoiceCheck = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Azure service states
  const [inputMode, setInputMode] = useState(0); // 0: Voice/Text, 1: Audio File
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [targetTranslateLanguage, setTargetTranslateLanguage] = useState("en");
  const [translatedText, setTranslatedText] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [supportedLanguages] = useState(honeyGuardAPI.getSupportedLanguages());
  const [serviceStatus] = useState(honeyGuardAPI.getServiceStatus());

  const recognitionRef = useRef(null);
  const audioInputRef = useRef(null);

  // Speech recognition languages mapping
  const speechLanguages = [
    { code: "en-IN", name: "English (India)" },
    { code: "en-US", name: "English (US)" },
    { code: "hi-IN", name: "Hindi (India)" },
    { code: "ta-IN", name: "Tamil (India)" },
    { code: "te-IN", name: "Telugu (India)" },
    { code: "bn-IN", name: "Bengali (India)" },
    { code: "mr-IN", name: "Marathi (India)" },
    { code: "gu-IN", name: "Gujarati (India)" },
    { code: "kn-IN", name: "Kannada (India)" },
    { code: "ml-IN", name: "Malayalam (India)" },
    { code: "pa-IN", name: "Punjabi (India)" },
    { code: "ur-IN", name: "Urdu (India)" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "ar-SA", name: "Arabic" },
    { code: "zh-CN", name: "Chinese (Mandarin)" },
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = selectedLanguage;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptText + " ";
          } else {
            interimTranscript += transcriptText;
          }
        }

        setTranscript((prev) => prev + finalTranscript);
        if (interimTranscript) {
          setTranscript(
            (prev) =>
              prev.replace(/\[interim\].*/, "") +
              "[interim]" +
              interimTranscript,
          );
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        setSnackbar({
          open: true,
          message: `Speech recognition error: ${event.error}`,
          severity: "error",
        });
      };
    }

    // Initialize new session
    setSessionId(honeyGuardAPI.generateSessionId());
  }, []);

  // Audio level animation when recording
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
    } else {
      setAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const analyzeMessage = async (text) => {
    if (!text.trim()) return;

    setIsAnalyzing(true);

    try {
      // Use the production API service
      const analysisResult = await honeyGuardAPI.analyzeMessage(
        text,
        sessionId,
        {
          channel: "Voice/Text",
          language: "English",
          locale: "IN",
        },
      );

      // Update conversation history from session
      const session = honeyGuardAPI.getSessionSummary(sessionId);
      if (session) {
        setConversationHistory(session.history);
      }

      setResult(analysisResult);
      setSnackbar({
        open: true,
        message: analysisResult.scamDetected
          ? "⚠️ Scam detected!"
          : "Analysis complete",
        severity: analysisResult.scamDetected ? "warning" : "success",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      setSnackbar({
        open: true,
        message: `Analysis failed: ${error.message}`,
        severity: "error",
      });
    } finally {
      setIsAnalyzing(false);
      setManualInput("");
      setTranscript("");
    }
  };

  const handleSubmit = () => {
    const textToAnalyze =
      transcript.replace(/\[interim\].*/, "").trim() || manualInput.trim();
    if (textToAnalyze) {
      analyzeMessage(textToAnalyze);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: "Copied to clipboard!",
      severity: "success",
    });
  };

  const resetSession = () => {
    const newSessionId = honeyGuardAPI.generateSessionId();
    setSessionId(newSessionId);
    setConversationHistory([]);
    setResult(null);
    setTranslatedText(null);
    setAudioFile(null);
    setSnackbar({
      open: true,
      message: "New session started",
      severity: "info",
    });
  };

  const submitFinalReport = async () => {
    try {
      const response = await honeyGuardAPI.submitFinalResult(sessionId);
      setSnackbar({
        open: true,
        message: "Final report submitted to GUVI endpoint!",
        severity: "success",
      });
      console.log("Final report:", response);
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to submit: ${error.message}`,
        severity: "error",
      });
    }
  };

  const exportSession = () => {
    const session = honeyGuardAPI.getSessionSummary(sessionId);
    if (session) {
      const dataStr = JSON.stringify(session, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `session_${sessionId}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setSnackbar({
        open: true,
        message: "Session exported!",
        severity: "success",
      });
    }
  };

  // Handle audio file upload
  const handleAudioFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        "audio/mpeg",
        "audio/wav",
        "audio/mp3",
        "audio/ogg",
        "audio/webm",
      ];
      if (
        !allowedTypes.includes(file.type) &&
        !file.name.match(/\.(mp3|wav|ogg|webm|m4a)$/i)
      ) {
        setSnackbar({
          open: true,
          message: "Please select an audio file (MP3, WAV, OGG, WebM)",
          severity: "error",
        });
        return;
      }
      setAudioFile(file);
      setSnackbar({
        open: true,
        message: `Audio file loaded: ${file.name}`,
        severity: "success",
      });
    }
  };

  // Analyze audio file using Azure Speech Service
  const analyzeAudioFile = async () => {
    if (!audioFile) {
      setSnackbar({
        open: true,
        message: "Please select an audio file first",
        severity: "warning",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisResult = await honeyGuardAPI.analyzeAudio(
        audioFile,
        selectedLanguage,
        sessionId,
      );

      // Update conversation history
      const session = honeyGuardAPI.getSessionSummary(sessionId);
      if (session) {
        setConversationHistory(session.history);
      }

      setResult(analysisResult);
      setTranscript(analysisResult.transcription?.text || "");

      setSnackbar({
        open: true,
        message: analysisResult.scamDetected
          ? "⚠️ Scam detected in audio!"
          : "Audio analysis complete",
        severity: analysisResult.scamDetected ? "warning" : "success",
      });
    } catch (error) {
      console.error("Audio analysis error:", error);
      setSnackbar({
        open: true,
        message: `Audio analysis failed: ${error.message}`,
        severity: "error",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Translate text using Azure Translator
  const handleTranslate = async () => {
    const textToTranslate =
      transcript.replace(/\[interim\].*/, "").trim() || manualInput.trim();
    if (!textToTranslate) {
      setSnackbar({
        open: true,
        message: "Enter text to translate",
        severity: "warning",
      });
      return;
    }

    setIsTranslating(true);
    try {
      const translation = await honeyGuardAPI.translateText(
        textToTranslate,
        targetTranslateLanguage,
      );
      setTranslatedText(translation);
      setSnackbar({
        open: true,
        message: "Translation complete",
        severity: "success",
      });
    } catch (error) {
      console.error("Translation error:", error);
      setSnackbar({
        open: true,
        message: `Translation failed: ${error.message}`,
        severity: "error",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // Update speech recognition language
  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    setSelectedLanguage(newLang);
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang;
    }
  };

  const exampleScams = [
    "Your bank account will be blocked today. Verify immediately by clicking this link.",
    "Congratulations! You've won ₹50,000. Share your UPI ID to receive the amount.",
    "Your KYC is expired. Update now or your account will be suspended.",
    "This is HDFC Bank. Your card is blocked. Call +91-9876543210 immediately.",
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
            <VolumeUpIcon
              sx={{ mr: 2, verticalAlign: "middle", color: "primary.main" }}
            />
            Voice Scam Check
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Record, type, or upload audio files to analyze for scam patterns.
            Powered by Microsoft Azure Cognitive Services for multi-language
            support.
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
            {Object.entries(serviceStatus).map(([service, status]) => (
              <Chip
                key={service}
                label={`${service}: ${status}`}
                size="small"
                color={status === "configured" ? "success" : "default"}
                variant="outlined"
                sx={{ textTransform: "capitalize" }}
              />
            ))}
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Input Section */}
          <Grid item xs={12} md={6}>
            <GlassCard glow>
              {/* Input Mode Tabs */}
              <Tabs
                value={inputMode}
                onChange={(e, v) => setInputMode(v)}
                sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
              >
                <Tab icon={<MicIcon />} label="Voice/Text" />
                <Tab icon={<AudioFileIcon />} label="Audio File" />
              </Tabs>

              {/* Language Selection */}
              <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>
                    <LanguageIcon sx={{ mr: 1, fontSize: 16 }} />
                    Input Language
                  </InputLabel>
                  <Select
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                    label="Input Language"
                  >
                    {speechLanguages.map((lang) => (
                      <MenuItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Translate To</InputLabel>
                  <Select
                    value={targetTranslateLanguage}
                    onChange={(e) => setTargetTranslateLanguage(e.target.value)}
                    label="Translate To"
                  >
                    {supportedLanguages.map((lang) => (
                      <MenuItem key={lang.code} value={lang.code}>
                        {lang.name} ({lang.nativeName})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {inputMode === 0 ? (
                <>
                  {/* Voice/Text Input Mode */}
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <MicIcon color="primary" />
                    Voice Input
                  </Typography>

                  {/* Recording Button */}
                  <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Box sx={{ position: "relative", display: "inline-block" }}>
                      {/* Audio Level Rings */}
                      <AnimatePresence>
                        {isRecording && (
                          <>
                            {[1, 2, 3].map((ring) => (
                              <motion.div
                                key={ring}
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{
                                  scale: 1 + (audioLevel / 100) * ring * 0.3,
                                  opacity: 0.3 - ring * 0.08,
                                }}
                                exit={{ scale: 1, opacity: 0 }}
                                style={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  width: 100 + ring * 20,
                                  height: 100 + ring * 20,
                                  borderRadius: "50%",
                                  border: "2px solid",
                                  borderColor: "#FF6B35",
                                  pointerEvents: "none",
                                }}
                              />
                            ))}
                          </>
                        )}
                      </AnimatePresence>

                      <IconButton
                        onClick={toggleRecording}
                        sx={{
                          width: 100,
                          height: 100,
                          background: isRecording
                            ? "linear-gradient(135deg, #ff4757, #ff6b81)"
                            : "linear-gradient(135deg, #FF6B35, #F7C815)",
                          boxShadow: isRecording
                            ? "0 0 30px rgba(255, 71, 87, 0.5)"
                            : "0 0 30px rgba(255, 107, 53, 0.4)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                      >
                        {isRecording ? (
                          <MicOffIcon sx={{ fontSize: 40, color: "white" }} />
                        ) : (
                          <MicIcon sx={{ fontSize: 40, color: "white" }} />
                        )}
                      </IconButton>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 2,
                        color: isRecording ? "error.main" : "text.secondary",
                        fontWeight: isRecording ? 600 : 400,
                      }}
                    >
                      {isRecording
                        ? "🔴 Recording... Click to stop"
                        : "Click to start recording"}
                    </Typography>
                  </Box>

                  {/* Transcript Display */}
                  {transcript && (
                    <Paper
                      sx={{
                        p: 2,
                        mb: 3,
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: 2,
                        maxHeight: 150,
                        overflow: "auto",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 1 }}
                      >
                        Transcript:
                      </Typography>
                      <Typography variant="body2">
                        {transcript.replace(/\[interim\]/, " ")}
                      </Typography>
                    </Paper>
                  )}

                  {/* Manual Input */}
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1.5, color: "text.secondary" }}
                  >
                    Or type the suspicious message:
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Enter the suspicious message here..."
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    sx={{ mb: 3 }}
                  />

                  <AnimatedButton
                    fullWidth
                    icon={<SendIcon />}
                    loading={isAnalyzing}
                    onClick={handleSubmit}
                    disabled={!transcript && !manualInput.trim()}
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Message"}
                  </AnimatedButton>

                  {/* Translation Section */}
                  <Box
                    sx={{
                      mt: 3,
                      pt: 2,
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <Button
                        variant="outlined"
                        startIcon={
                          isTranslating ? (
                            <CircularProgress size={16} />
                          ) : (
                            <TranslateIcon />
                          )
                        }
                        onClick={handleTranslate}
                        disabled={
                          isTranslating || (!transcript && !manualInput.trim())
                        }
                        sx={{ flex: 1 }}
                      >
                        {isTranslating ? "Translating..." : "Translate"}
                      </Button>
                    </Box>

                    {translatedText && (
                      <Paper
                        sx={{
                          mt: 2,
                          p: 2,
                          background: "rgba(247, 200, 21, 0.1)",
                          border: "1px solid rgba(247, 200, 21, 0.3)",
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 1 }}
                        >
                          <TranslateIcon
                            sx={{
                              fontSize: 14,
                              mr: 0.5,
                              verticalAlign: "middle",
                            }}
                          />
                          Translated (
                          {
                            supportedLanguages.find(
                              (l) => l.code === targetTranslateLanguage,
                            )?.name
                          }
                          ):
                        </Typography>
                        <Typography variant="body2">
                          {translatedText.translatedText}
                        </Typography>
                        {translatedText.note && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              mt: 1,
                              fontStyle: "italic",
                            }}
                          >
                            {translatedText.note}
                          </Typography>
                        )}
                      </Paper>
                    )}
                  </Box>
                </>
              ) : (
                <>
                  {/* Audio File Upload Mode */}
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <AudioFileIcon color="primary" />
                    Audio File Analysis
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Upload an audio file (MP3, WAV, OGG) to analyze for scam
                    patterns using Microsoft Azure Speech Service.
                  </Typography>

                  {/* File Upload Area */}
                  <Paper
                    sx={{
                      p: 4,
                      mb: 3,
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "2px dashed rgba(255, 107, 53, 0.3)",
                      borderRadius: 2,
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "rgba(255, 107, 53, 0.6)",
                        background: "rgba(255, 255, 255, 0.05)",
                      },
                    }}
                    onClick={() => audioInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={audioInputRef}
                      onChange={handleAudioFileSelect}
                      accept="audio/*,.mp3,.wav,.ogg,.webm,.m4a"
                      style={{ display: "none" }}
                    />
                    <UploadIcon
                      sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
                    />
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {audioFile
                        ? audioFile.name
                        : "Click to upload audio file"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supported: MP3, WAV, OGG, WebM, M4A (max 25MB)
                    </Typography>
                  </Paper>

                  {audioFile && (
                    <Box sx={{ mb: 3 }}>
                      <Chip
                        label={`${audioFile.name} (${(audioFile.size / 1024 / 1024).toFixed(2)} MB)`}
                        onDelete={() => setAudioFile(null)}
                        color="primary"
                        variant="outlined"
                        sx={{ width: "100%" }}
                      />
                    </Box>
                  )}

                  <AnimatedButton
                    fullWidth
                    icon={<PsychologyIcon />}
                    loading={isAnalyzing}
                    onClick={analyzeAudioFile}
                    disabled={!audioFile}
                  >
                    {isAnalyzing ? "Processing Audio..." : "Analyze Audio File"}
                  </AnimatedButton>

                  {/* Transcription Result */}
                  {transcript && inputMode === 1 && (
                    <Paper
                      sx={{
                        mt: 3,
                        p: 2,
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 1 }}
                      >
                        Transcribed Text:
                      </Typography>
                      <Typography variant="body2">{transcript}</Typography>
                    </Paper>
                  )}

                  <Alert
                    severity="info"
                    sx={{ mt: 3, background: "rgba(112, 161, 255, 0.1)" }}
                  >
                    <Typography variant="body2">
                      <strong>Azure Speech Service:</strong> Converts audio to
                      text and analyzes for scam patterns including urgency
                      tactics, financial requests, and impersonation attempts.
                    </Typography>
                  </Alert>
                </>
              )}
            </GlassCard>

            {/* Example Scam Messages */}
            <GlassCard sx={{ mt: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <WarningIcon color="warning" />
                Example Scam Messages
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click any example to test the analyzer:
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {exampleScams.map((scam, index) => (
                  <Chip
                    key={index}
                    label={
                      scam.length > 60 ? scam.substring(0, 60) + "..." : scam
                    }
                    onClick={() => {
                      setManualInput(scam);
                      setInputMode(0); // Switch to text mode
                    }}
                    sx={{
                      height: "auto",
                      py: 1,
                      px: 0.5,
                      justifyContent: "flex-start",
                      "& .MuiChip-label": {
                        whiteSpace: "normal",
                        textAlign: "left",
                      },
                      background: "rgba(255, 107, 53, 0.1)",
                      border: "1px solid rgba(255, 107, 53, 0.2)",
                      cursor: "pointer",
                      "&:hover": {
                        background: "rgba(255, 107, 53, 0.2)",
                      },
                    }}
                  />
                ))}
              </Box>
            </GlassCard>
          </Grid>

          {/* Results Section */}
          <Grid item xs={12} md={6}>
            {/* Conversation History */}
            {conversationHistory.length > 0 && (
              <GlassCard sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <PsychologyIcon color="primary" />
                  Conversation Flow
                </Typography>
                <List sx={{ maxHeight: 300, overflow: "auto" }}>
                  {conversationHistory.map((msg, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        flexDirection:
                          msg.sender === "user" ? "row-reverse" : "row",
                        gap: 1,
                        py: 1,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          background:
                            msg.sender === "user"
                              ? "linear-gradient(135deg, #2ed573, #7bed9f)"
                              : "linear-gradient(135deg, #ff4757, #ff6b81)",
                        }}
                      >
                        {msg.sender === "user" ? (msg.isAI ? "AI" : "U") : "S"}
                      </Avatar>
                      <Paper
                        sx={{
                          p: 1.5,
                          maxWidth: "80%",
                          background:
                            msg.sender === "user"
                              ? "rgba(46, 213, 115, 0.15)"
                              : "rgba(255, 71, 87, 0.15)",
                          border: `1px solid ${msg.sender === "user" ? "rgba(46, 213, 115, 0.3)" : "rgba(255, 71, 87, 0.3)"}`,
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {msg.sender === "user"
                            ? msg.isAI
                              ? "🤖 AI Agent"
                              : "You"
                            : "⚠️ Scammer"}
                        </Typography>
                        <Typography variant="body2">{msg.text}</Typography>
                      </Paper>
                      <Tooltip title="Copy">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(msg.text)}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  ))}
                </List>
              </GlassCard>
            )}

            {/* Analysis Result */}
            {isAnalyzing ? (
              <GlassCard hover={false}>
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <CircularProgress
                    size={60}
                    sx={{ color: "primary.main", mb: 3 }}
                  />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Analyzing Message...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Our AI is detecting scam patterns and generating response
                  </Typography>
                </Box>
              </GlassCard>
            ) : result ? (
              <ResultCard result={result} />
            ) : (
              <GlassCard hover={false}>
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <VolumeUpIcon
                    sx={{
                      fontSize: 60,
                      color: "text.secondary",
                      mb: 2,
                      opacity: 0.5,
                    }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    No Analysis Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Record or type a message to analyze for scam patterns
                  </Typography>
                </Box>
              </GlassCard>
            )}

            {/* Session Controls */}
            {conversationHistory.length > 0 && (
              <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={resetSession}
                  sx={{
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    color: "white",
                    "&:hover": {
                      borderColor: "primary.main",
                      background: "rgba(255, 107, 53, 0.1)",
                    },
                  }}
                >
                  New Session
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={exportSession}
                  sx={{
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    color: "white",
                    "&:hover": {
                      borderColor: "primary.main",
                      background: "rgba(255, 107, 53, 0.1)",
                    },
                  }}
                >
                  Export
                </Button>
                {result?.scamDetected && (
                  <Button
                    variant="contained"
                    onClick={submitFinalReport}
                    sx={{
                      background: "linear-gradient(135deg, #2ed573, #7bed9f)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #26de81, #20bf6b)",
                      },
                    }}
                  >
                    Submit Report
                  </Button>
                )}
              </Box>
            )}

            {/* Session Info */}
            <Alert
              severity="info"
              sx={{
                mt: 3,
                background: "rgba(112, 161, 255, 0.1)",
                border: "1px solid rgba(112, 161, 255, 0.3)",
              }}
            >
              <Typography variant="body2">
                <strong>Session ID:</strong> {sessionId?.slice(0, 20)}...
                <br />
                <strong>Messages:</strong> {conversationHistory.length} |
                <strong> Status:</strong>{" "}
                {result?.scamDetected
                  ? "Scam Detected"
                  : result
                    ? "Analyzed"
                    : "Waiting"}
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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

export default VoiceCheck;
