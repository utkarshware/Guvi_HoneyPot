// Session Dashboard - View, manage, and submit sessions to GUVI
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Divider,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import { useSession } from "../context/SessionContext";

const GlassCard = styled(Paper)(({ theme }) => ({
  background:
    "linear-gradient(145deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: 16,
  padding: theme.spacing(3),
}));

const SessionDashboard = () => {
  const {
    sessions,
    currentSessionId,
    isSubmitting,
    submissionStatus,
    submitSession,
    deleteSession,
    clearAllSessions,
    refreshSessions,
    getPayloadPreview,
    isReadyForSubmission,
    exportData,
    retryPendingSubmissions,
  } = useSession();

  const [selectedSession, setSelectedSession] = useState(null);
  const [payloadDialog, setPayloadDialog] = useState({
    open: false,
    payload: null,
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    sessionId: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Get session status color
  const getStatusColor = (session) => {
    if (session.status === "submitted") return "success";
    if (session.scamDetected) return "error";
    if (session.status === "completed") return "warning";
    return "info";
  };

  // Get status label
  const getStatusLabel = (session) => {
    if (session.status === "submitted") return "Submitted ✅";
    if (session.status === "completed") return "Ready to Submit";
    if (session.scamDetected) return "Scam Detected";
    return "Active";
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  // Handle submit session
  const handleSubmit = async (sessionId) => {
    const result = await submitSession(sessionId);
    setSnackbar({
      open: true,
      message: result.success
        ? "✅ Successfully submitted to GUVI!"
        : `❌ Submission failed: ${result.message}`,
      severity: result.success ? "success" : "error",
    });
  };

  // Handle view payload
  const handleViewPayload = (sessionId) => {
    const payload = getPayloadPreview(sessionId);
    setPayloadDialog({ open: true, payload });
  };

  // Handle copy payload
  const handleCopyPayload = (payload) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setSnackbar({
      open: true,
      message: "Payload copied to clipboard!",
      severity: "success",
    });
  };

  // Handle export all data
  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `honeypot_sessions_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSnackbar({
      open: true,
      message: "Data exported successfully!",
      severity: "success",
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (confirmDialog.action === "delete") {
      deleteSession(confirmDialog.sessionId);
      setSnackbar({ open: true, message: "Session deleted", severity: "info" });
    } else if (confirmDialog.action === "clearAll") {
      clearAllSessions();
      setSnackbar({
        open: true,
        message: "All sessions cleared",
        severity: "info",
      });
    }
    setConfirmDialog({ open: false, action: null, sessionId: null });
  };

  // Count sessions by status
  const submittedCount = sessions.filter(
    (s) => s.status === "submitted",
  ).length;
  const readyCount = sessions.filter((s) =>
    isReadyForSubmission(s.sessionId),
  ).length;
  const activeCount = sessions.filter((s) => s.status === "active").length;

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          📊 Session Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage sessions and submit results to GUVI evaluation endpoint
        </Typography>
      </Box>

      {/* GUVI Callback Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>GUVI Evaluation Endpoint</AlertTitle>
        <Typography variant="body2">
          <strong>POST</strong>{" "}
          https://hackathon.guvi.in/api/updateHoneyPotFinalResult
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Submit results after scam detection is confirmed and intelligence
          extraction is complete.
        </Typography>
      </Alert>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Card
            sx={{ background: "rgba(46, 213, 115, 0.1)", textAlign: "center" }}
          >
            <CardContent>
              <Typography variant="h3" sx={{ color: "#2ed573" }}>
                {submittedCount}
              </Typography>
              <Typography variant="body2">Submitted</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{ background: "rgba(255, 165, 2, 0.1)", textAlign: "center" }}
          >
            <CardContent>
              <Typography variant="h3" sx={{ color: "#ffa502" }}>
                {readyCount}
              </Typography>
              <Typography variant="body2">Ready to Submit</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{ background: "rgba(112, 161, 255, 0.1)", textAlign: "center" }}
          >
            <CardContent>
              <Typography variant="h3" sx={{ color: "#70a1ff" }}>
                {activeCount}
              </Typography>
              <Typography variant="body2">Active</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{ background: "rgba(255, 107, 53, 0.1)", textAlign: "center" }}
          >
            <CardContent>
              <Typography variant="h3" sx={{ color: "#FF6B35" }}>
                {sessions.length}
              </Typography>
              <Typography variant="body2">Total Sessions</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={refreshSessions}
        >
          Refresh
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportData}
        >
          Export All Data
        </Button>
        <Button
          variant="outlined"
          color="warning"
          startIcon={<UploadIcon />}
          onClick={retryPendingSubmissions}
          disabled={isSubmitting}
        >
          Retry Failed
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() =>
            setConfirmDialog({
              open: true,
              action: "clearAll",
              sessionId: null,
            })
          }
          disabled={sessions.length === 0}
        >
          Clear All
        </Button>
      </Box>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <GlassCard>
          <Box sx={{ textAlign: "center", py: 6 }}>
            <InfoIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No Sessions Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Analyze some content to create sessions that can be submitted to
              GUVI.
            </Typography>
          </Box>
        </GlassCard>
      ) : (
        <Grid container spacing={2}>
          {sessions.map((session) => (
            <Grid item xs={12} key={session.sessionId}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard
                  sx={{
                    borderLeft: `4px solid ${
                      session.status === "submitted"
                        ? "#2ed573"
                        : session.scamDetected
                          ? "#ff4757"
                          : "#70a1ff"
                    }`,
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    {/* Session Info */}
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Session ID
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", wordBreak: "break-all" }}
                      >
                        {session.sessionId}
                      </Typography>
                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          size="small"
                          label={getStatusLabel(session)}
                          color={getStatusColor(session)}
                        />
                        <Chip
                          size="small"
                          label={session.source}
                          variant="outlined"
                        />
                      </Box>
                    </Grid>

                    {/* Stats */}
                    <Grid item xs={12} md={4}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Messages
                          </Typography>
                          <Typography variant="h6">
                            {session.totalMessagesExchanged}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Confidence
                          </Typography>
                          <Typography variant="h6">
                            {Math.round((session.scamConfidence || 0) * 100)}%
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            Started: {formatTime(session.startTime)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Intelligence Preview */}
                    <Grid item xs={12} md={2}>
                      <Typography variant="caption" color="text.secondary">
                        Intelligence
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        {session.extractedIntelligence.phoneNumbers.length >
                          0 && (
                          <Chip
                            size="small"
                            label={`📞 ${session.extractedIntelligence.phoneNumbers.length}`}
                          />
                        )}
                        {session.extractedIntelligence.upiIds.length > 0 && (
                          <Chip
                            size="small"
                            label={`💳 ${session.extractedIntelligence.upiIds.length}`}
                          />
                        )}
                        {session.extractedIntelligence.phishingLinks.length >
                          0 && (
                          <Chip
                            size="small"
                            label={`🔗 ${session.extractedIntelligence.phishingLinks.length}`}
                          />
                        )}
                      </Box>
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12} md={2}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Tooltip title="View Payload">
                          <IconButton
                            size="small"
                            onClick={() => handleViewPayload(session.sessionId)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                action: "delete",
                                sessionId: session.sessionId,
                              })
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={
                            session.status === "submitted" ? (
                              <CheckIcon />
                            ) : (
                              <SendIcon />
                            )
                          }
                          onClick={() => handleSubmit(session.sessionId)}
                          disabled={
                            isSubmitting || session.status === "submitted"
                          }
                          color={
                            session.status === "submitted"
                              ? "success"
                              : "primary"
                          }
                        >
                          {session.status === "submitted" ? "Sent" : "Submit"}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Expanded Intelligence Details */}
                  <Accordion sx={{ mt: 2, background: "rgba(0,0,0,0.2)" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body2">
                        View Intelligence Details
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="primary">
                            Phone Numbers
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace" }}
                          >
                            {session.extractedIntelligence.phoneNumbers.join(
                              ", ",
                            ) || "None"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="primary">
                            UPI IDs
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace" }}
                          >
                            {session.extractedIntelligence.upiIds.join(", ") ||
                              "None"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="primary">
                            Phishing Links
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              wordBreak: "break-all",
                            }}
                          >
                            {session.extractedIntelligence.phishingLinks.join(
                              ", ",
                            ) || "None"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="primary">
                            Suspicious Keywords
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                              mt: 0.5,
                            }}
                          >
                            {session.extractedIntelligence.suspiciousKeywords
                              .slice(0, 20)
                              .map((kw, idx) => (
                                <Chip
                                  key={idx}
                                  label={kw}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                          </Box>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </GlassCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Payload Preview Dialog */}
      <Dialog
        open={payloadDialog.open}
        onClose={() => setPayloadDialog({ open: false, payload: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>📦 GUVI Callback Payload Preview</DialogTitle>
        <DialogContent>
          {payloadDialog.payload && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                This is the exact payload that will be sent to the GUVI
                evaluation endpoint.
              </Alert>
              <Paper
                sx={{
                  p: 2,
                  background: "#1a1a2e",
                  maxHeight: 400,
                  overflow: "auto",
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                }}
              >
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(payloadDialog.payload, null, 2)}
                </pre>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<CopyIcon />}
            onClick={() => handleCopyPayload(payloadDialog.payload)}
          >
            Copy
          </Button>
          <Button
            onClick={() => setPayloadDialog({ open: false, payload: null })}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({ open: false, action: null, sessionId: null })
        }
      >
        <DialogTitle>
          {confirmDialog.action === "clearAll"
            ? "⚠️ Clear All Sessions?"
            : "🗑️ Delete Session?"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.action === "clearAll"
              ? "This will delete all sessions including submitted ones. This action cannot be undone."
              : "Are you sure you want to delete this session? This action cannot be undone."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDialog({ open: false, action: null, sessionId: null })
            }
          >
            Cancel
          </Button>
          <Button color="error" onClick={handleDeleteConfirm}>
            {confirmDialog.action === "clearAll" ? "Clear All" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

      {/* Submission Progress */}
      {isSubmitting && (
        <Box sx={{ position: "fixed", bottom: 20, left: 20, right: 20 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Submitting to GUVI...
            </Typography>
            <LinearProgress />
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default SessionDashboard;
