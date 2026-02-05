// GUVI HoneyPot Evaluation Callback Service
// Mandatory final result submission for hackathon evaluation

const GUVI_CALLBACK_URL =
  "https://hackathon.guvi.in/api/updateHoneyPotFinalResult";

class GuviCallbackService {
  constructor() {
    this.sessions = new Map();
    this.pendingSubmissions = [];
  }

  // Generate unique session ID
  generateSessionId() {
    return `honeypot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize a new session
  initSession(sessionId = null) {
    const sid = sessionId || this.generateSessionId();

    const session = {
      sessionId: sid,
      startTime: Date.now(),
      lastActivity: Date.now(),
      totalMessagesExchanged: 0,
      scamDetected: false,
      scamConfidence: 0,
      extractedIntelligence: {
        bankAccounts: [],
        upiIds: [],
        phishingLinks: [],
        phoneNumbers: [],
        suspiciousKeywords: [],
      },
      conversationHistory: [],
      analysisResults: [],
      agentNotes: [],
      status: "active", // active, completed, submitted
      source: "unknown", // audio, screenshot, questionnaire, text
    };

    this.sessions.set(sid, session);
    this.saveToLocalStorage();

    return session;
  }

  // Get or create session
  getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      return this.initSession(sessionId);
    }
    return this.sessions.get(sessionId);
  }

  // Get all active sessions
  getAllSessions() {
    return Array.from(this.sessions.values());
  }

  // Update session with analysis results
  updateSession(sessionId, updates) {
    const session = this.getSession(sessionId);

    // Update basic fields
    if (updates.scamDetected !== undefined) {
      session.scamDetected = updates.scamDetected;
    }
    if (updates.scamConfidence !== undefined) {
      session.scamConfidence = updates.scamConfidence;
    }
    if (updates.source) {
      session.source = updates.source;
    }

    // Increment message count
    if (updates.messageCount) {
      session.totalMessagesExchanged += updates.messageCount;
    }

    // Merge extracted intelligence
    if (updates.extractedIntelligence) {
      this.mergeIntelligence(
        session.extractedIntelligence,
        updates.extractedIntelligence,
      );
    }

    // Add to conversation history
    if (updates.message) {
      session.conversationHistory.push({
        ...updates.message,
        timestamp: Date.now(),
      });
      session.totalMessagesExchanged++;
    }

    // Add analysis result
    if (updates.analysisResult) {
      session.analysisResults.push({
        ...updates.analysisResult,
        timestamp: Date.now(),
      });
    }

    // Add agent notes
    if (updates.agentNote) {
      session.agentNotes.push(updates.agentNote);
    }

    session.lastActivity = Date.now();
    this.saveToLocalStorage();

    return session;
  }

  // Merge intelligence data (deduplicate)
  mergeIntelligence(target, source) {
    if (!source) return;

    Object.keys(target).forEach((key) => {
      if (Array.isArray(source[key]) && source[key].length > 0) {
        target[key] = [...new Set([...target[key], ...source[key]])];
      }
    });
  }

  // Mark session as completed (ready for submission)
  completeSession(sessionId) {
    const session = this.getSession(sessionId);
    session.status = "completed";
    session.completedTime = Date.now();
    this.saveToLocalStorage();
    return session;
  }

  // Generate comprehensive agent notes
  generateAgentNotes(session) {
    const notes = [];
    const intelligence = session.extractedIntelligence;

    // Source info
    notes.push(`Analysis source: ${session.source}`);

    // Scam detection status
    if (session.scamDetected) {
      notes.push(
        `Scam confirmed with ${Math.round(session.scamConfidence * 100)}% confidence`,
      );
    }

    // Intelligence summary
    if (intelligence.phoneNumbers.length > 0) {
      notes.push(
        `Extracted ${intelligence.phoneNumbers.length} phone number(s): ${intelligence.phoneNumbers.slice(0, 3).join(", ")}`,
      );
    }
    if (intelligence.upiIds.length > 0) {
      notes.push(
        `Detected ${intelligence.upiIds.length} UPI ID(s): ${intelligence.upiIds.slice(0, 3).join(", ")}`,
      );
    }
    if (intelligence.phishingLinks.length > 0) {
      notes.push(
        `Found ${intelligence.phishingLinks.length} suspicious link(s)`,
      );
    }
    if (intelligence.bankAccounts.length > 0) {
      notes.push(
        `Identified ${intelligence.bankAccounts.length} potential bank account number(s)`,
      );
    }
    if (intelligence.suspiciousKeywords.length > 0) {
      notes.push(
        `Suspicious keywords: ${intelligence.suspiciousKeywords.slice(0, 10).join(", ")}`,
      );
    }

    // Session stats
    notes.push(`Total messages analyzed: ${session.totalMessagesExchanged}`);
    notes.push(
      `Session duration: ${Math.round((Date.now() - session.startTime) / 1000)}s`,
    );

    // Add any custom notes
    if (session.agentNotes.length > 0) {
      notes.push(...session.agentNotes);
    }

    return notes.join(". ");
  }

  // Build the final payload for GUVI submission
  buildPayload(sessionId) {
    const session = this.getSession(sessionId);

    return {
      sessionId: session.sessionId,
      scamDetected: session.scamDetected,
      totalMessagesExchanged: session.totalMessagesExchanged,
      extractedIntelligence: {
        bankAccounts: session.extractedIntelligence.bankAccounts,
        upiIds: session.extractedIntelligence.upiIds,
        phishingLinks: session.extractedIntelligence.phishingLinks,
        phoneNumbers: session.extractedIntelligence.phoneNumbers,
        suspiciousKeywords: session.extractedIntelligence.suspiciousKeywords,
      },
      agentNotes: this.generateAgentNotes(session),
    };
  }

  // Submit final result to GUVI endpoint (MANDATORY)
  async submitFinalResult(sessionId) {
    const session = this.getSession(sessionId);

    // Validation checks
    if (!session.scamDetected) {
      console.warn(
        "Warning: Submitting result without confirmed scam detection",
      );
    }

    const payload = this.buildPayload(sessionId);

    console.log("📤 Submitting to GUVI callback:", payload);

    try {
      const response = await fetch(GUVI_CALLBACK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response
        .json()
        .catch(() => ({ status: response.status }));

      if (response.ok) {
        session.status = "submitted";
        session.submittedTime = Date.now();
        session.submissionResponse = responseData;
        this.saveToLocalStorage();

        console.log("✅ GUVI callback successful:", responseData);

        return {
          success: true,
          message: "Results submitted successfully to GUVI",
          payload,
          response: responseData,
        };
      } else {
        console.error(
          "❌ GUVI callback failed:",
          response.status,
          responseData,
        );

        // Store for retry
        this.pendingSubmissions.push({
          sessionId,
          payload,
          attemptTime: Date.now(),
          error: responseData,
        });
        this.saveToLocalStorage();

        return {
          success: false,
          message: `Submission failed: ${response.status}`,
          payload,
          error: responseData,
        };
      }
    } catch (error) {
      console.error("❌ GUVI callback error:", error);

      // Store for retry
      this.pendingSubmissions.push({
        sessionId,
        payload,
        attemptTime: Date.now(),
        error: error.message,
      });
      this.saveToLocalStorage();

      return {
        success: false,
        message: `Network error: ${error.message}`,
        payload,
        error: error.message,
      };
    }
  }

  // Retry pending submissions
  async retryPendingSubmissions() {
    const results = [];

    for (const pending of [...this.pendingSubmissions]) {
      try {
        const result = await this.submitFinalResult(pending.sessionId);
        if (result.success) {
          this.pendingSubmissions = this.pendingSubmissions.filter(
            (p) => p.sessionId !== pending.sessionId,
          );
        }
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          sessionId: pending.sessionId,
          error: error.message,
        });
      }
    }

    this.saveToLocalStorage();
    return results;
  }

  // Check if session is ready for submission
  isReadyForSubmission(sessionId) {
    const session = this.getSession(sessionId);
    return (
      session.scamDetected === true &&
      session.totalMessagesExchanged > 0 &&
      session.status !== "submitted"
    );
  }

  // Get submission status
  getSubmissionStatus(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      sessionId,
      status: session.status,
      scamDetected: session.scamDetected,
      totalMessages: session.totalMessagesExchanged,
      isReadyForSubmission: this.isReadyForSubmission(sessionId),
      submittedTime: session.submittedTime,
      submissionResponse: session.submissionResponse,
    };
  }

  // Save to localStorage for persistence
  saveToLocalStorage() {
    try {
      const data = {
        sessions: Array.from(this.sessions.entries()),
        pendingSubmissions: this.pendingSubmissions,
      };
      localStorage.setItem("guvi_honeypot_sessions", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  // Load from localStorage
  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem("guvi_honeypot_sessions");
      if (data) {
        const parsed = JSON.parse(data);
        this.sessions = new Map(parsed.sessions || []);
        this.pendingSubmissions = parsed.pendingSubmissions || [];
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
    }
  }

  // Clear all sessions
  clearAllSessions() {
    this.sessions.clear();
    this.pendingSubmissions = [];
    localStorage.removeItem("guvi_honeypot_sessions");
  }

  // Delete specific session
  deleteSession(sessionId) {
    this.sessions.delete(sessionId);
    this.pendingSubmissions = this.pendingSubmissions.filter(
      (p) => p.sessionId !== sessionId,
    );
    this.saveToLocalStorage();
  }

  // Export all data for debugging
  exportData() {
    return {
      sessions: Array.from(this.sessions.entries()).map(([id, session]) => ({
        ...session,
        payload: this.buildPayload(id),
      })),
      pendingSubmissions: this.pendingSubmissions,
      timestamp: Date.now(),
    };
  }
}

// Create singleton instance
const guviCallback = new GuviCallbackService();

// Load persisted data on initialization
guviCallback.loadFromLocalStorage();

export { guviCallback, GuviCallbackService };
export default guviCallback;
