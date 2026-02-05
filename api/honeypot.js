// Vercel Serverless API Endpoint for GUVI HoneyPot Evaluation
// POST /api/honeypot

// API Key for authentication (MUST be set in Vercel Environment Variables)
const API_KEY = (process.env.HONEYPOT_API_KEY || "").trim();

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
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch (e) {
          // If it's not valid JSON, treat it as plain text
          body = { text: body };
        }
      }

      // Ensure body is an object
      body = body || {};

      // Extract text content - handle GUVI's nested message format
      const {
        text,
        message,
        content,
        input,
        query,
        data,
        sessionId,
        conversationHistory,
        metadata,
      } = body;

      // Handle nested message object from GUVI format: {message: {sender, text, timestamp}}
      let textToAnalyze = "";
      if (typeof message === "object" && message !== null && message.text) {
        textToAnalyze = message.text;
      } else if (typeof message === "string") {
        textToAnalyze = message;
      } else if (typeof text === "string") {
        textToAnalyze = text;
      } else if (typeof content === "string") {
        textToAnalyze = content;
      } else if (typeof input === "string") {
        textToAnalyze = input;
      } else if (typeof query === "string") {
        textToAnalyze = query;
      } else if (typeof data === "string") {
        textToAnalyze = data;
      }

      // If no text provided, return a valid response
      if (!textToAnalyze) {
        return res.status(200).json({
          status: "success",
          reply: "Hello, I'm here. What would you like to discuss?",
          sessionId: sessionId || generateSessionId(),
          timestamp: new Date().toISOString(),
        });
      }

      // Perform scam analysis
      const analysisResult = analyzeForScam(textToAnalyze);

      // Generate honeypot reply that engages the scammer
      const honeypotReply = generateHoneypotReply(
        textToAnalyze,
        analysisResult,
        conversationHistory || [],
      );

      // Build response in GUVI expected format: {status, reply}
      const response = {
        status: "success",
        reply: honeypotReply,
        // Include additional analysis data
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

// Generate honeypot reply to engage scammer and extract intelligence
function generateHoneypotReply(scammerMessage, analysis, conversationHistory) {
  const lowerMessage = scammerMessage.toLowerCase();
  const historyLength = conversationHistory ? conversationHistory.length : 0;
  
  // Track the turn number (how many honeypot responses so far)
  let turnNumber = 0;
  const previousReplies = new Set();
  
  if (conversationHistory && Array.isArray(conversationHistory)) {
    conversationHistory.forEach(msg => {
      if (msg.sender === 'honeypot' || msg.sender === 'victim' || msg.sender === 'user') {
        turnNumber++;
        const replyText = (msg.text || msg.message || '').toLowerCase().trim();
        if (replyText) previousReplies.add(replyText);
      }
    });
  }
  
  // All unique responses, organized by progression
  const allResponses = [
    // Turn 0-1: Initial shock and confusion
    "What?! My account is having issues? This is very concerning!",
    "Oh no! Which account are you talking about? I have multiple accounts with different banks.",
    
    // Turn 2-3: Seeking more information
    "Can you please tell me your name and employee ID for my records?",
    "I'm worried now. What kind of suspicious activity did you detect exactly?",
    
    // Turn 4-5: Starting to appear compliant
    "Okay, I want to help resolve this. What do you need me to do first?",
    "I'm ready to cooperate. But can you give me a callback number in case we get disconnected?",
    
    // Turn 6-7: Appearing to comply while asking questions
    "I'm looking at my phone now. The OTP message says not to share it with anyone. Are you sure this is safe?",
    "Before I share anything, which branch are you calling from? I want to verify with my local branch.",
    
    // Turn 8-9: Extracting scammer information
    "I'll share the details, but first tell me your supervisor's name so I can verify this call is legitimate.",
    "My bank app is open. What's your official employee ID? I want to note it down for my records.",
    
    // Turn 10-11: More extraction
    "I'm trying to find the OTP. Can you give me your direct phone number to call you back?",
    "Wait, the message shows a different number. What's the official bank helpline I should call?",
    
    // Turn 12-13: Stalling and gathering info
    "I need a moment. Can you spell out your full name for me? I'm writing this down.",
    "Which department exactly handles these fraud cases? I want to report this properly.",
    
    // Turn 14-15: Continuing to stall
    "My family member is calling me. Can you hold for 2 minutes? Don't hang up!",
    "I'm just checking something on my computer. What website should I visit for verification?",
    
    // Turn 16+: Extended responses
    "Sorry, my phone is slow. While I wait, can you tell me how many cases like mine you handle daily?",
    "The app is loading. Just curious - how long have you been working at the bank?",
    "Almost there! By the way, what's the address of your branch office?",
    "I want to be careful. Can you give me your manager's contact number?",
  ];
  
  // Add context-specific responses based on what scammer mentions
  const contextResponses = [];
  
  if (lowerMessage.includes('otp')) {
    contextResponses.push(
      "I see several OTP messages. Which one are you referring to? The one from 5 minutes ago?",
      "The OTP I received shows it's from SBI but you mentioned a different bank earlier.",
      "My OTP message says 'Never share this code'. Is there another way to verify?"
    );
  }
  
  if (lowerMessage.includes('upi') || lowerMessage.includes('pin')) {
    contextResponses.push(
      "My UPI PIN? My bank told me to never share that. Can your manager confirm this?",
      "Which UPI app are you referring to? I use multiple ones.",
      "For UPI verification, shouldn't I just visit the bank branch instead?"
    );
  }
  
  if (lowerMessage.includes('minute') || lowerMessage.includes('hour') || lowerMessage.includes('block')) {
    contextResponses.push(
      "Please don't hang up! I'm getting my documents right now. What's your extension number?",
      "I'm panicking! Can you extend the deadline while I find my account details?",
      "Such urgency! This must be serious. What's the case reference number?"
    );
  }
  
  if (lowerMessage.includes('email') || lowerMessage.match(/[\w.-]+@[\w.-]+/)) {
    contextResponses.push(
      "That email address looks unusual. What's the official bank domain I should look for?",
      "I'll send it to that email. But first, can you send me a verification email from your official ID?",
      "Is that email on the bank's official domain? Let me check the bank website first."
    );
  }
  
  // Combine all responses, with context-specific ones taking priority for later turns
  let combinedResponses = [...allResponses];
  if (turnNumber >= 3 && contextResponses.length > 0) {
    // Insert context responses after the natural progression point
    combinedResponses = [
      ...allResponses.slice(0, Math.min(turnNumber + 2, 8)),
      ...contextResponses,
      ...allResponses.slice(8)
    ];
  }
  
  // Filter out any response that was already used
  const availableResponses = combinedResponses.filter(r => 
    !previousReplies.has(r.toLowerCase().trim())
  );
  
  // Select response based on turn number for consistency
  if (availableResponses.length > 0) {
    // Use turn number to select, cycling through available responses
    const index = turnNumber % availableResponses.length;
    return availableResponses[index];
  }
  
  // Fallback: generate a dynamic response
  const fallbackResponses = [
    `I'm still looking for the ${lowerMessage.includes('otp') ? 'OTP' : 'information'} you requested. Please wait.`,
    "My phone is running slow today. Can you tell me your employee details while I wait?",
    "I want to help but I'm having trouble. What's your direct number to call you back?",
    "Just a moment, I'm almost ready. Which bank branch should I visit if this call drops?",
    "I'm cooperating as fast as I can. Can you give me a reference number for this case?",
  ];
  
  return fallbackResponses[turnNumber % fallbackResponses.length];
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
