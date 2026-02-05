// API Service for HoneyGuard Scam Detection
// Integrates with Microsoft Azure Cognitive Services
import { azureServices } from "./azureServices";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.honeyguard.ai";
const CALLBACK_URL = "https://hackathon.guvi.in/api/updateHoneyPotFinalResult";

class HoneyGuardAPI {
  constructor() {
    this.apiKey = localStorage.getItem("honeyguard_api_key") || "";
    this.sessions = new Map();
    this.azure = azureServices;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  getHeaders() {
    return {
      "x-api-key": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  // Get supported languages for translation
  getSupportedLanguages() {
    return this.azure.getSupportedLanguages();
  }

  // Get Azure service status
  getServiceStatus() {
    return this.azure.getServiceStatus();
  }

  // Translate text using Azure Translator
  async translateText(text, targetLang, sourceLang = null) {
    return await this.azure.translateText(text, targetLang, sourceLang);
  }

  // Detect language using Azure
  async detectLanguage(text) {
    return await this.azure.detectLanguage(text);
  }

  // Generate unique session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize or get session
  getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        id: sessionId,
        history: [],
        intelligence: {
          bankAccounts: [],
          upiIds: [],
          phishingLinks: [],
          phoneNumbers: [],
          suspiciousKeywords: [],
        },
        scamDetected: false,
        startTime: Date.now(),
      });
    }
    return this.sessions.get(sessionId);
  }

  // Analyze text message for scam detection with Azure Language Service
  async analyzeMessage(text, sessionId = null, metadata = {}) {
    const sid = sessionId || this.generateSessionId();
    const session = this.getSession(sid);

    const message = {
      sender: "scammer",
      text: text.trim(),
      timestamp: Date.now(),
    };

    // Build request payload
    const payload = {
      sessionId: sid,
      message,
      conversationHistory: session.history,
      metadata: {
        channel: metadata.channel || "Web",
        language: metadata.language || "English",
        locale: metadata.locale || "IN",
        ...metadata,
      },
    };

    try {
      // Detect language using Azure
      const detectedLang = await this.azure.detectLanguage(text);

      // Translate to English if needed for analysis
      let textForAnalysis = text;
      let translation = null;

      if (detectedLang.language !== "en" && detectedLang.confidence > 0.7) {
        translation = await this.azure.translateText(
          text,
          "en",
          detectedLang.language,
        );
        textForAnalysis = translation.translatedText;
      }

      // Use Azure Language Service for text analysis
      const azureTextAnalysis = await this.azure.analyzeText(
        textForAnalysis,
        "en",
      );

      // Perform comprehensive scam analysis
      const result = await this.performLocalAnalysis(
        textForAnalysis,
        session,
        azureTextAnalysis,
      );

      // Update session history
      session.history.push(message);
      session.history.push({
        sender: "user",
        text: result.reply,
        timestamp: Date.now(),
      });

      // Update intelligence
      this.mergeIntelligence(
        session.intelligence,
        result.extractedIntelligence,
      );
      session.scamDetected = session.scamDetected || result.scamDetected;

      return {
        ...result,
        sessionId: sid,
        totalMessages: session.history.length,
        detectedLanguage: detectedLang,
        translation,
        azureAnalysis: azureTextAnalysis,
      };
    } catch (error) {
      console.error("Analysis error:", error);
      throw error;
    }
  }

  // Analyze screenshot/image using Azure Computer Vision
  async analyzeScreenshot(imageFile, sessionId = null) {
    const sid = sessionId || this.generateSessionId();
    const session = this.getSession(sid);

    try {
      // Use Azure Computer Vision for OCR and scam analysis
      const azureResult = await this.azure.analyzeImageForScam(imageFile);

      // Perform additional local analysis
      const localAnalysis = await this.performLocalAnalysis(
        azureResult.ocrResult.text,
        session,
        azureResult.textAnalysis,
      );

      // Merge intelligence
      this.mergeIntelligence(
        session.intelligence,
        localAnalysis.extractedIntelligence,
      );
      this.mergeIntelligence(session.intelligence, azureResult.intelligence);
      session.scamDetected = session.scamDetected || localAnalysis.scamDetected;

      return {
        ...localAnalysis,
        sessionId: sid,
        extractedText: azureResult.ocrResult.text,
        imageName: imageFile.name,
        detectedLanguage: azureResult.detectedLanguage,
        translation: azureResult.translation,
        azureAnalysis: azureResult,
        ocrConfidence: azureResult.ocrResult.confidence,
      };
    } catch (error) {
      console.error("Screenshot analysis error:", error);
      throw error;
    }
  }

  // Analyze audio file using Azure Speech Service
  async analyzeAudio(audioFile, language = "en-IN", sessionId = null) {
    const sid = sessionId || this.generateSessionId();
    const session = this.getSession(sid);

    try {
      // Use Azure Speech Service for full audio analysis
      const azureResult = await this.azure.analyzeAudioForScam(
        audioFile,
        language,
      );

      // Perform additional local analysis on transcribed text
      const localAnalysis = await this.performLocalAnalysis(
        azureResult.transcription.text,
        session,
        azureResult.textAnalysis,
      );

      // Update session
      session.history.push({
        sender: "scammer",
        text: azureResult.transcription.text,
        timestamp: Date.now(),
        source: "audio",
        audioFile: audioFile.name,
      });

      session.history.push({
        sender: "user",
        text: localAnalysis.reply,
        timestamp: Date.now(),
      });

      // Merge intelligence
      this.mergeIntelligence(
        session.intelligence,
        localAnalysis.extractedIntelligence,
      );
      session.scamDetected = session.scamDetected || localAnalysis.scamDetected;

      return {
        ...localAnalysis,
        sessionId: sid,
        transcription: azureResult.transcription,
        audioFileName: audioFile.name,
        detectedLanguage: azureResult.detectedLanguage,
        scamPatterns: azureResult.scamAnalysis,
        azureRiskScore: azureResult.riskScore,
        totalMessages: session.history.length,
      };
    } catch (error) {
      console.error("Audio analysis error:", error);
      throw error;
    }
  }

  // Simulate OCR extraction (fallback)
  async simulateOCR(imageFile) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const scamTemplates = [
      "Dear Customer, Your SBI account has been blocked due to incomplete KYC. Click here to verify: bit.ly/sbi-verify. Call: +91-9876543210 immediately.",
      "URGENT: You have won Rs. 25,00,000 in lottery. Send your UPI ID winner@paytm to claim prize. Contact: +91-8765432109",
      "Your Amazon order #123456 is on hold. Verify payment at: amazon-verify.suspicious.com. Enter your password to continue.",
      "KYC Update Required - Your bank account will be suspended in 24 hours. Update now: kyc-bank.scam.com OTP: 123456",
      "Congratulations! Your mobile number won iPhone 15. Pay delivery charges Rs. 499 to upi@fraud. Limited time offer!",
    ];

    return scamTemplates[Math.floor(Math.random() * scamTemplates.length)];
  }

  // Perform local scam analysis enhanced with Azure insights
  async performLocalAnalysis(text, session, azureTextAnalysis = null) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const lowerText = text.toLowerCase();

    // Scam pattern detection
    const patterns = {
      urgency: /urgent|immediately|now|today|hours?|limited|expire/gi,
      financial:
        /bank|account|upi|payment|transfer|money|rs\.?|rupees?|₹|\$|prize|lottery|won/gi,
      action: /click|verify|update|confirm|call|send|share|enter/gi,
      threat: /block|suspend|deactivate|cancel|freeze|unauthorized/gi,
      credentials: /password|otp|pin|cvv|card|kyc|aadhar|pan/gi,
    };

    const detectedPatterns = {};
    let riskScore = 0;

    Object.entries(patterns).forEach(([category, regex]) => {
      const matches = text.match(regex) || [];
      if (matches.length > 0) {
        detectedPatterns[category] = [
          ...new Set(matches.map((m) => m.toLowerCase())),
        ];
        riskScore += matches.length * 10;
      }
    });

    // Enhance with Azure sentiment analysis
    if (azureTextAnalysis) {
      if (azureTextAnalysis.sentiment === "negative") riskScore += 15;
      if (azureTextAnalysis.sentiment === "mixed") riskScore += 8;

      // Add Azure key phrases to patterns
      if (azureTextAnalysis.keyPhrases?.length > 0) {
        detectedPatterns.keyPhrases = azureTextAnalysis.keyPhrases;
        riskScore += azureTextAnalysis.keyPhrases.length * 3;
      }

      // Add Azure entities
      if (azureTextAnalysis.entities?.length > 0) {
        riskScore +=
          azureTextAnalysis.entities.filter((e) =>
            ["PhoneNumber", "URL", "Email"].includes(e.category),
          ).length * 10;
      }
    }

    // Extract intelligence
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
      suspiciousKeywords: Object.values(detectedPatterns).flat(),
    };

    // Calculate final risk score
    riskScore += extractedIntelligence.phoneNumbers.length * 15;
    riskScore += extractedIntelligence.upiIds.length * 20;
    riskScore += extractedIntelligence.phishingLinks.length * 25;
    riskScore = Math.min(Math.round(riskScore + Math.random() * 5), 100);

    const scamDetected = riskScore > 50;

    // Generate AI agent response
    const reply = this.generateAgentResponse(
      scamDetected,
      detectedPatterns,
      session.history.length,
    );

    return {
      status: scamDetected
        ? "SCAM DETECTED"
        : riskScore > 30
          ? "Suspicious"
          : "Safe",
      scamDetected,
      riskScore,
      confidence: (riskScore / 100).toFixed(2),
      patterns: Object.entries(detectedPatterns).map(
        ([k, v]) => `${k}: ${v.join(", ")}`,
      ),
      extractedIntelligence,
      reply,
      summary: this.generateSummary(scamDetected, riskScore, detectedPatterns),
      timestamp: Date.now(),
    };
  }

  // Generate believable AI agent responses
  generateAgentResponse(isScam, patterns, messageCount) {
    if (!isScam) {
      return "Thank you for the information. Could you provide more details about this?";
    }

    const responses = {
      initial: [
        "Oh no! Why would my account be blocked? I haven't done anything wrong.",
        "This is concerning. What exactly do I need to verify?",
        "I don't understand. Which account are you referring to?",
        "Wait, what? Can you explain what's happening?",
      ],
      followUp: [
        "Okay, but how do I know this is really from the bank?",
        "Should I visit the branch instead? This seems unusual.",
        "My family member handles my banking. Should I ask them first?",
        "I'm not very tech-savvy. Can you guide me step by step?",
        "What information exactly do you need from me?",
      ],
      extended: [
        "I tried the link but it's not working. Is there another way?",
        "My phone is running low on battery. Can I do this later?",
        "I need to find my documents first. Where did I keep them...",
        "Let me write this down. What was that number again?",
        "This is taking a while. Is there a simpler process?",
      ],
    };

    if (messageCount === 0) {
      return responses.initial[
        Math.floor(Math.random() * responses.initial.length)
      ];
    } else if (messageCount < 4) {
      return responses.followUp[
        Math.floor(Math.random() * responses.followUp.length)
      ];
    } else {
      return responses.extended[
        Math.floor(Math.random() * responses.extended.length)
      ];
    }
  }

  // Generate analysis summary
  generateSummary(isScam, riskScore, patterns) {
    if (isScam) {
      const tactics = [];
      if (patterns.urgency) tactics.push("urgency tactics");
      if (patterns.threat) tactics.push("threatening language");
      if (patterns.credentials) tactics.push("credential harvesting");
      if (patterns.financial) tactics.push("financial manipulation");

      return `High-risk scam detected (${riskScore}% confidence). The message employs ${tactics.join(", ")}. Recommended action: Do not respond and report to authorities.`;
    } else if (riskScore > 30) {
      return `Moderate risk detected. Some suspicious patterns found but not conclusive. Continue monitoring the conversation.`;
    }
    return `Message appears safe. No significant scam indicators detected.`;
  }

  // Merge intelligence data
  mergeIntelligence(target, source) {
    Object.keys(source).forEach((key) => {
      if (Array.isArray(source[key])) {
        target[key] = [...new Set([...target[key], ...source[key]])];
      }
    });
  }

  // Submit final results to callback endpoint
  async submitFinalResult(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const payload = {
      sessionId,
      scamDetected: session.scamDetected,
      totalMessagesExchanged: session.history.length,
      extractedIntelligence: session.intelligence,
      agentNotes: this.generateAgentNotes(session),
    };

    try {
      // In production, uncomment this:
      // const response = await fetch(CALLBACK_URL, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      //   timeout: 5000,
      // });
      // return await response.json();

      // Simulated response
      console.log("Final result payload:", payload);
      return {
        status: "success",
        message: "Results submitted successfully",
        payload,
      };
    } catch (error) {
      console.error("Callback submission error:", error);
      throw error;
    }
  }

  // Generate agent notes
  generateAgentNotes(session) {
    const notes = [];

    if (session.intelligence.phoneNumbers.length > 0) {
      notes.push(
        `Extracted ${session.intelligence.phoneNumbers.length} phone number(s)`,
      );
    }
    if (session.intelligence.upiIds.length > 0) {
      notes.push(`Detected ${session.intelligence.upiIds.length} UPI ID(s)`);
    }
    if (session.intelligence.phishingLinks.length > 0) {
      notes.push(
        `Found ${session.intelligence.phishingLinks.length} suspicious link(s)`,
      );
    }

    notes.push(`Total conversation turns: ${session.history.length}`);
    notes.push(
      `Session duration: ${Math.round((Date.now() - session.startTime) / 1000)}s`,
    );

    return notes.join(". ");
  }

  // Get session summary
  getSessionSummary(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      sessionId,
      totalMessages: session.history.length,
      scamDetected: session.scamDetected,
      intelligence: session.intelligence,
      duration: Date.now() - session.startTime,
      history: session.history,
    };
  }

  // Clear session
  clearSession(sessionId) {
    this.sessions.delete(sessionId);
  }
}

// Export singleton instance
export const honeyGuardAPI = new HoneyGuardAPI();
export default HoneyGuardAPI;
