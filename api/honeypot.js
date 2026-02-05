// Vercel Serverless API Endpoint for GUVI HoneyPot Evaluation
// POST /api/honeypot

// API Key for authentication (MUST be set in Vercel Environment Variables)
const API_KEY = process.env.HONEYPOT_API_KEY;

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, x-api-key, Authorization",
    );
    return res.status(200).end();
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Check if API key is configured
  if (!API_KEY) {
    return res.status(500).json({
      success: false,
      error: "Server configuration error",
      message: "API key not configured. Contact administrator.",
    });
  }

  // Validate API key
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "Missing x-api-key header",
      message: "Authentication required. Please provide x-api-key header.",
    });
  }

  if (apiKey !== API_KEY) {
    return res.status(403).json({
      success: false,
      error: "Invalid API key",
      message: "The provided API key is not valid.",
    });
  }

  // Handle different HTTP methods
  if (req.method === "GET") {
    // Health check endpoint
    return res.status(200).json({
      success: true,
      message: "HoneyGuard API is active and ready",
      service: "HoneyGuard Scam Detection",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        analyze: "POST /api/honeypot",
        health: "GET /api/honeypot",
      },
    });
  }

  if (req.method === "POST") {
    try {
      // Handle various body formats
      let body = req.body;
      
      // If body is a string, try to parse it
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          // If it's not valid JSON, treat it as plain text
          body = { text: body };
        }
      }
      
      // Ensure body is an object
      body = body || {};

      // Extract text content from request - support multiple field names
      const { text, message, content, input, query, data, sessionId } = body;
      const textToAnalyze = text || message || content || input || query || (typeof data === 'string' ? data : '') || "";

      // If no text provided, return a valid response with minimal analysis
      if (!textToAnalyze) {
        return res.status(200).json({
          success: true,
          sessionId: sessionId || generateSessionId(),
          timestamp: new Date().toISOString(),
          analysis: {
            scamDetected: false,
            confidence: 0,
            riskLevel: "Unknown",
            riskScore: 0,
          },
          message: "No text content provided for analysis",
          extractedIntelligence: {
            bankAccounts: [],
            upiIds: [],
            phishingLinks: [],
            phoneNumbers: [],
            suspiciousKeywords: [],
          },
          patterns: [],
          recommendations: ["Please provide text content for scam analysis"],
          agentNotes: "Empty or missing content field",
        });
      }

      // Perform scam analysis
      const analysisResult = analyzeForScam(textToAnalyze);

      // Build response in GUVI expected format
      const response = {
        success: true,
        sessionId: sessionId || generateSessionId(),
        timestamp: new Date().toISOString(),
        analysis: {
          scamDetected: analysisResult.isScam,
          confidence: analysisResult.confidence,
          riskLevel: analysisResult.riskLevel,
          riskScore: analysisResult.riskScore,
        },
        extractedIntelligence: analysisResult.intelligence,
        patterns: analysisResult.patterns,
        recommendations: analysisResult.recommendations,
        agentNotes: analysisResult.notes,
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error("Analysis error:", error);
      return res.status(500).json({
        success: false,
        error: "Analysis failed",
        message: error.message || "An error occurred during analysis",
      });
    }
  }

  // Method not allowed
  return res.status(405).json({
    success: false,
    error: "Method not allowed",
    message: `HTTP method ${req.method} is not supported. Use GET or POST.`,
  });
}

// Generate unique session ID
function generateSessionId() {
  return `hp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Scam analysis function
function analyzeForScam(text) {
  const lowerText = text.toLowerCase();

  // Scam pattern detection
  const patterns = {
    urgency: [],
    financial: [],
    impersonation: [],
    dataRequests: [],
    threats: [],
  };

  // Urgency patterns
  const urgencyKeywords = [
    "urgent",
    "immediately",
    "act now",
    "expires",
    "limited time",
    "within 24 hours",
    "last chance",
    "don't delay",
    "hurry",
    "तुरंत",
    "जल्दी",
    "अभी", // Hindi urgency words
  ];
  urgencyKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) patterns.urgency.push(kw);
  });

  // Financial patterns
  const financialKeywords = [
    "transfer money",
    "send payment",
    "bank account",
    "upi",
    "paytm",
    "google pay",
    "phonepe",
    "credit card",
    "debit card",
    "cvv",
    "otp",
    "pin",
    "refund",
    "prize",
    "lottery",
    "winner",
    "cash",
    "rupees",
    "rs.",
    "₹",
    "lakh",
    "crore",
  ];
  financialKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) patterns.financial.push(kw);
  });

  // Impersonation patterns
  const impersonationKeywords = [
    "bank manager",
    "rbi",
    "income tax",
    "police",
    "cbi",
    "customs",
    "amazon",
    "flipkart",
    "microsoft",
    "google",
    "apple",
    "sbi",
    "hdfc",
    "icici",
    "axis",
    "customer care",
    "executive",
    "officer",
  ];
  impersonationKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) patterns.impersonation.push(kw);
  });

  // Data request patterns
  const dataKeywords = [
    "share otp",
    "tell me otp",
    "provide otp",
    "verify account",
    "confirm details",
    "update kyc",
    "aadhaar",
    "pan card",
    "password",
    "enter pin",
    "card number",
    "cvv number",
    "expiry date",
  ];
  dataKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) patterns.dataRequests.push(kw);
  });

  // Threat patterns
  const threatKeywords = [
    "arrest",
    "legal action",
    "police case",
    "fir",
    "court",
    "blocked",
    "suspended",
    "terminated",
    "penalty",
    "fine",
    "warrant",
    "jail",
    "prosecution",
  ];
  threatKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) patterns.threats.push(kw);
  });

  // Extract intelligence
  const intelligence = {
    bankAccounts: extractBankAccounts(text),
    upiIds: extractUPIIds(text),
    phishingLinks: extractLinks(text),
    phoneNumbers: extractPhoneNumbers(text),
    suspiciousKeywords: [
      ...patterns.urgency,
      ...patterns.financial,
      ...patterns.threats,
    ].slice(0, 10),
  };

  // Calculate risk score
  let riskScore = 0;
  riskScore += patterns.urgency.length * 8;
  riskScore += patterns.financial.length * 10;
  riskScore += patterns.impersonation.length * 12;
  riskScore += patterns.dataRequests.length * 15;
  riskScore += patterns.threats.length * 12;
  riskScore += intelligence.phishingLinks.length * 15;
  riskScore += intelligence.upiIds.length * 8;
  riskScore = Math.min(100, riskScore);

  // Determine risk level
  let riskLevel;
  if (riskScore >= 70) riskLevel = "High";
  else if (riskScore >= 40) riskLevel = "Medium";
  else if (riskScore >= 20) riskLevel = "Low";
  else riskLevel = "Minimal";

  const isScam = riskScore >= 40;
  const confidence = Math.min(95, 50 + riskScore * 0.45);

  // Generate recommendations
  const recommendations = [];
  if (isScam) {
    recommendations.push("Do NOT share OTP, PIN, or passwords");
    recommendations.push("Do NOT transfer money to unknown accounts");
    recommendations.push("Verify caller identity through official channels");
    recommendations.push("Report to cybercrime.gov.in or call 1930");
  } else {
    recommendations.push("Message appears relatively safe");
    recommendations.push("Always verify unexpected requests independently");
  }

  // Generate agent notes
  const totalPatterns = Object.values(patterns).flat().length;
  const notes =
    `Analyzed ${text.length} characters. Found ${totalPatterns} suspicious patterns. ` +
    `Categories: Urgency(${patterns.urgency.length}), Financial(${patterns.financial.length}), ` +
    `Impersonation(${patterns.impersonation.length}), Data Requests(${patterns.dataRequests.length}), ` +
    `Threats(${patterns.threats.length}). Intelligence extracted: ${intelligence.phoneNumbers.length} phone numbers, ` +
    `${intelligence.upiIds.length} UPI IDs, ${intelligence.phishingLinks.length} links.`;

  return {
    isScam,
    confidence,
    riskLevel,
    riskScore,
    patterns: Object.entries(patterns)
      .filter(([_, v]) => v.length > 0)
      .map(([k, v]) => `${k}: ${v.join(", ")}`),
    intelligence,
    recommendations,
    notes,
  };
}

// Helper: Extract bank account numbers
function extractBankAccounts(text) {
  const patterns = [
    /\b\d{9,18}\b/g, // Generic account numbers
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Card numbers
  ];
  const accounts = [];
  patterns.forEach((pattern) => {
    const matches = text.match(pattern) || [];
    accounts.push(...matches);
  });
  return [...new Set(accounts)].slice(0, 5);
}

// Helper: Extract UPI IDs
function extractUPIIds(text) {
  const upiPattern = /[\w.-]+@[\w]+/gi;
  const matches = text.match(upiPattern) || [];
  return matches
    .filter(
      (m) =>
        m.includes("@") &&
        !m.includes(".com") &&
        !m.includes(".in") &&
        !m.includes(".org"),
    )
    .slice(0, 5);
}

// Helper: Extract suspicious links
function extractLinks(text) {
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const matches = text.match(urlPattern) || [];
  return matches
    .filter((url) => {
      const suspicious = [
        "bit.ly",
        "tinyurl",
        "shorturl",
        "t.co",
        "goo.gl",
        "click",
        "verify",
        "secure",
        "update",
        "login",
      ];
      return suspicious.some((s) => url.toLowerCase().includes(s));
    })
    .slice(0, 5);
}

// Helper: Extract phone numbers
function extractPhoneNumbers(text) {
  const phonePattern = /(?:\+91[\s-]?)?[6-9]\d{9}/g;
  const matches = text.match(phonePattern) || [];
  return [...new Set(matches)].slice(0, 5);
}
