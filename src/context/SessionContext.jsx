// Session Context for HoneyPot Scam Detection
// Manages sessions across the application and handles GUVI callback submissions

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import guviCallback from "../services/guviCallback";

const SessionContext = createContext(null);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load sessions on mount
  useEffect(() => {
    refreshSessions();
  }, []);

  // Refresh sessions list
  const refreshSessions = useCallback(() => {
    const allSessions = guviCallback.getAllSessions();
    setSessions(allSessions);
  }, []);

  // Start a new session
  const startSession = useCallback(
    (source = "unknown") => {
      const session = guviCallback.initSession();
      session.source = source;
      setCurrentSessionId(session.sessionId);
      refreshSessions();
      return session;
    },
    [refreshSessions],
  );

  // Get current session
  const getCurrentSession = useCallback(() => {
    if (!currentSessionId) return null;
    return guviCallback.getSession(currentSessionId);
  }, [currentSessionId]);

  // Update current session with analysis results
  const updateCurrentSession = useCallback(
    (updates) => {
      if (!currentSessionId) {
        // Auto-create session if none exists
        const session = startSession(updates.source || "unknown");
        return guviCallback.updateSession(session.sessionId, updates);
      }
      const updated = guviCallback.updateSession(currentSessionId, updates);
      refreshSessions();
      return updated;
    },
    [currentSessionId, startSession, refreshSessions],
  );

  // Record scam detection result
  const recordScamDetection = useCallback(
    (result) => {
      const updates = {
        scamDetected: result.scamDetected,
        scamConfidence: result.confidence || result.riskScore / 100,
        extractedIntelligence: result.extractedIntelligence,
        messageCount: 1,
        analysisResult: result,
        agentNote: result.summary || result.status,
      };
      return updateCurrentSession(updates);
    },
    [updateCurrentSession],
  );

  // Complete current session (mark ready for submission)
  const completeCurrentSession = useCallback(() => {
    if (!currentSessionId) return null;
    const session = guviCallback.completeSession(currentSessionId);
    refreshSessions();
    return session;
  }, [currentSessionId, refreshSessions]);

  // Submit current session to GUVI
  const submitCurrentSession = useCallback(async () => {
    if (!currentSessionId) {
      return { success: false, message: "No active session" };
    }

    setIsSubmitting(true);
    setSubmissionStatus({ status: "submitting", sessionId: currentSessionId });

    try {
      const result = await guviCallback.submitFinalResult(currentSessionId);

      setSubmissionStatus({
        status: result.success ? "success" : "error",
        sessionId: currentSessionId,
        ...result,
      });

      refreshSessions();
      return result;
    } catch (error) {
      const errorResult = { success: false, message: error.message };
      setSubmissionStatus({
        status: "error",
        sessionId: currentSessionId,
        ...errorResult,
      });
      return errorResult;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentSessionId, refreshSessions]);

  // Submit specific session
  const submitSession = useCallback(
    async (sessionId) => {
      setIsSubmitting(true);
      setSubmissionStatus({ status: "submitting", sessionId });

      try {
        const result = await guviCallback.submitFinalResult(sessionId);

        setSubmissionStatus({
          status: result.success ? "success" : "error",
          sessionId,
          ...result,
        });

        refreshSessions();
        return result;
      } catch (error) {
        const errorResult = { success: false, message: error.message };
        setSubmissionStatus({
          status: "error",
          sessionId,
          ...errorResult,
        });
        return errorResult;
      } finally {
        setIsSubmitting(false);
      }
    },
    [refreshSessions],
  );

  // Check if session is ready for submission
  const isReadyForSubmission = useCallback(
    (sessionId = currentSessionId) => {
      if (!sessionId) return false;
      return guviCallback.isReadyForSubmission(sessionId);
    },
    [currentSessionId],
  );

  // Get payload preview for session
  const getPayloadPreview = useCallback(
    (sessionId = currentSessionId) => {
      if (!sessionId) return null;
      return guviCallback.buildPayload(sessionId);
    },
    [currentSessionId],
  );

  // Switch to a different session
  const switchSession = useCallback((sessionId) => {
    setCurrentSessionId(sessionId);
  }, []);

  // Delete a session
  const deleteSession = useCallback(
    (sessionId) => {
      guviCallback.deleteSession(sessionId);
      if (sessionId === currentSessionId) {
        setCurrentSessionId(null);
      }
      refreshSessions();
    },
    [currentSessionId, refreshSessions],
  );

  // Clear all sessions
  const clearAllSessions = useCallback(() => {
    guviCallback.clearAllSessions();
    setCurrentSessionId(null);
    setSessions([]);
  }, []);

  // Export all data
  const exportData = useCallback(() => {
    return guviCallback.exportData();
  }, []);

  // Retry pending submissions
  const retryPendingSubmissions = useCallback(async () => {
    const results = await guviCallback.retryPendingSubmissions();
    refreshSessions();
    return results;
  }, [refreshSessions]);

  const value = {
    // State
    currentSessionId,
    currentSession: getCurrentSession(),
    sessions,
    submissionStatus,
    isSubmitting,

    // Session management
    startSession,
    getCurrentSession,
    updateCurrentSession,
    recordScamDetection,
    completeCurrentSession,
    switchSession,
    deleteSession,
    clearAllSessions,
    refreshSessions,

    // GUVI submission
    submitCurrentSession,
    submitSession,
    isReadyForSubmission,
    getPayloadPreview,
    retryPendingSubmissions,

    // Utilities
    exportData,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export default SessionContext;
