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
      version: "2.0.0-aggressive",
      buildTime: "2026-02-05T23:40:00Z",
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
  
  // PHASE-BASED RESPONSES - Each phase has different goals and tone
  // Phase 1 (Turn 0-2): Confusion and Fear - Build trust
  // Phase 2 (Turn 3-5): Asking clarifying questions about the "problem"
  // Phase 3 (Turn 6-9): Stalling with excuses while extracting info
  // Phase 4 (Turn 10-14): Appearing to comply, sending tracking links
  // Phase 5 (Turn 15+): Demanding scammer verification before proceeding
  
  const phase1_confusion = [
    "Hello? Yes, this is my number. What happened to my account?",
    "Oh my god! What kind of problem? I just checked yesterday and everything was fine!",
    "Wait wait, I don't understand. Can you explain slowly? I'm very worried now.",
  ];
  
  const phase2_questions = [
    "When did this suspicious activity happen? What transaction are you talking about?",
    "How much money is at risk? Is my salary safe? I just got paid last week!",
    "Which branch detected this? I opened my account at the main branch only.",
    "Can you see my account balance from your system? How much is showing?",
  ];
  
  const phase3_stalling = [
    "Just a minute, I need to find my reading glasses. I can't see the screen properly.",
    "Hold on, my phone is very slow today. The app is still loading...",
    "Wait, someone is at the door. Please don't disconnect, I'll be right back!",
    "One second, I'm looking for the OTP. I get so many messages these days...",
    "My phone battery is low, let me plug in the charger. Stay on the line please!",
    "The network is bad here. Can you hear me? Hello? Let me move to another room.",
  ];
  
  const phase4_trackingLinks = [
    "I found the OTP message! I took a screenshot because I can't type fast. Check here: https://otp-share.honeyguard.app/view?id=verify123",
    "See, I'm sending you proof of my account. Click this link: https://account-screenshot.honeyguard.app/image?ref=bank2026",
    "I uploaded my bank statement screenshot here for you: https://secure-docs.honeyguard.app/statement?verify=true - tell me if you can see it clearly.",
    "The OTP image is here: https://otp-verify-secure.honeyguard.app/screenshot?s=1 - Please confirm you received it.",
  ];
  
  const phase5_verification = [
    "Before I share anything else, what is your employee ID number? I want to note it down.",
    "My son is asking who is calling. What is your full name? He wants to verify with the bank.",
    "I will cooperate fully. But first, which city is your call center in? My nephew works in a bank call center too.",
    "Hold on, I'm writing this down for my records. Your name please? And which department?",
    "My neighbor was cheated last month. Tell me your official bank email ID so I know this is real.",
    "One last thing - what is your direct phone number? If call disconnects, I'll call you back.",
  ];
  
  const phase6_intel = [
    "I'm ready to share. But tell me - what is your Aadhaar number? Bank employees must give this on request.",
    "Which state are you calling from exactly? I want to know the location of your office.",
    "My accountant needs your PAN number for tax records. All bank officials have PAN, right?",
    "What is your father's name? I need to file a proper complaint if something goes wrong.",
    "Tell me your complete office address. If there's a problem, my son will visit directly tomorrow.",
    "What is your personal mobile number? The bank number shows private on my phone.",
  ];
  
  // Determine which phase based on turn number
  let responsePool;
  if (turnNumber <= 2) {
    responsePool = phase1_confusion;
  } else if (turnNumber <= 5) {
    responsePool = phase2_questions;
  } else if (turnNumber <= 9) {
    responsePool = phase3_stalling;
  } else if (turnNumber <= 13) {
    responsePool = phase4_trackingLinks;
  } else if (turnNumber <= 17) {
    responsePool = phase5_verification;
  } else {
    responsePool = phase6_intel;
  }
  
  // Context-aware overrides based on scammer's message
  if (lowerMessage.includes('otp') && turnNumber >= 3) {
    const otpResponses = [
      "I see the OTP! It says... wait, the numbers are small. Give me your WhatsApp, I'll send a screenshot.",
      "The OTP is showing but it says 'Do not share with anyone'. Are you sure this is safe?",
      "I got the OTP. But which account is this for? I have SBI, HDFC and Post Office savings.",
      "Found it! The OTP is... hold on, my daughter is calling me. Don't hang up!",
    ];
    const availableOtp = otpResponses.filter(r => !previousReplies.has(r.toLowerCase().trim()));
    if (availableOtp.length > 0) {
      return availableOtp[turnNumber % availableOtp.length];
    }
  }
  
  if ((lowerMessage.includes('urgent') || lowerMessage.includes('block') || lowerMessage.includes('immediate')) && turnNumber >= 2) {
    const urgentResponses = [
      "Please don't block my account! I'm an old person, this is my pension account!",
      "So urgent?! My hands are shaking. Can you give me 5 minutes to find my documents?",
      "I'm very scared now. What will happen if I don't do this? Will I lose all my money?",
      "Okay okay, I'm trying my best! My phone is just very slow, please have patience.",
    ];
    const availableUrgent = urgentResponses.filter(r => !previousReplies.has(r.toLowerCase().trim()));
    if (availableUrgent.length > 0) {
      return availableUrgent[turnNumber % availableUrgent.length];
    }
  }
  
  if ((lowerMessage.includes('rupee') || lowerMessage.includes('lakh') || lowerMessage.includes('money') || lowerMessage.includes('₹')) && turnNumber >= 2) {
    const moneyResponses = [
      "That much money!? I don't have that much in my account. There must be some mistake.",
      "Lakhs?! I only have pension savings. Please check again, this can't be my account.",
      "Where did this money come from? I never made such a big transaction!",
    ];
    const availableMoney = moneyResponses.filter(r => !previousReplies.has(r.toLowerCase().trim()));
    if (availableMoney.length > 0) {
      return availableMoney[turnNumber % availableMoney.length];
    }
  }
  
  // Filter out already used responses from the pool
  const availableResponses = responsePool.filter(r => !previousReplies.has(r.toLowerCase().trim()));
  
  if (availableResponses.length > 0) {
    // Use modulo to pick response deterministically
    return availableResponses[turnNumber % availableResponses.length];
  }
  
  // Ultimate fallback - unique stalling responses
  const fallbacks = [
    "The app is still loading. What was your name again?",
    "Hold on, let me restart my phone. It's being very slow.",
    "I'm trying to find the message. Which number did the OTP come from?",
    "Almost there, just give me one more minute please.",
    "My eyes are weak, I can't see the small text. Which one is the OTP?",
    "The screen went dark. I need to unlock again. One moment.",
    "I'm doing what you said. But tell me your office location for my records.",
    "Wait, there are too many messages. Can you tell me the exact time the OTP came?",
  ];
  
  const availableFallbacks = fallbacks.filter(r => !previousReplies.has(r.toLowerCase().trim()));
  if (availableFallbacks.length > 0) {
    return availableFallbacks[turnNumber % availableFallbacks.length];
  }
  
  // Last resort - completely generic
  return "Hello? Are you still there? My phone is having problems. Please repeat what you said.";
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
    aadhaarNumbers: extractAadhaarNumbers(text),
    panNumbers: extractPANNumbers(text),
    names: extractNames(text),
    locations: extractLocations(text),
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
    `${intelligence.upiIds.length} UPI IDs, ${intelligence.phishingLinks.length} links, ` +
    `${intelligence.aadhaarNumbers.length} Aadhaar numbers, ${intelligence.panNumbers.length} PAN numbers, ` +
    `${intelligence.names.length} names, ${intelligence.locations.length} locations.`;

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

// Helper: Extract Aadhaar numbers (12 digits, often in groups of 4)
function extractAadhaarNumbers(text) {
  const patterns = [
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // 1234 5678 9012 format
    /\b\d{12}\b/g, // Continuous 12 digits
  ];
  const aadhaarNumbers = [];
  patterns.forEach((pattern) => {
    const matches = text.match(pattern) || [];
    matches.forEach(m => {
      const cleaned = m.replace(/[\s-]/g, '');
      // Basic Aadhaar validation: 12 digits, doesn't start with 0 or 1
      if (cleaned.length === 12 && !cleaned.startsWith('0') && !cleaned.startsWith('1')) {
        aadhaarNumbers.push(cleaned);
      }
    });
  });
  return [...new Set(aadhaarNumbers)].slice(0, 5);
}

// Helper: Extract PAN numbers (ABCDE1234F format)
function extractPANNumbers(text) {
  const panPattern = /\b[A-Z]{5}\d{4}[A-Z]\b/gi;
  const matches = text.match(panPattern) || [];
  return matches.map(m => m.toUpperCase()).slice(0, 5);
}

// Helper: Extract names (common Indian name patterns)
function extractNames(text) {
  // Look for name patterns like "my name is X", "I am X", "this is X speaking"
  const namePatterns = [
    /(?:my name is|i am|this is|i'm|myself)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/gi,
    /(?:mr\.|mrs\.|ms\.|shri|smt\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/gi,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})(?:\s+(?:speaking|here|calling))/gi,
  ];
  const names = [];
  namePatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 2) {
        names.push(match[1].trim());
      }
    }
  });
  return [...new Set(names)].slice(0, 5);
}

// Helper: Extract locations (Indian cities, states, addresses)
function extractLocations(text) {
  const indianCities = [
    'delhi', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'hyderabad',
    'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane',
    'bhopal', 'visakhapatnam', 'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik',
    'faridabad', 'meerut', 'rajkot', 'varanasi', 'srinagar', 'aurangabad', 'dhanbad',
    'amritsar', 'allahabad', 'ranchi', 'howrah', 'coimbatore', 'jabalpur', 'gwalior',
    'vijayawada', 'jodhpur', 'madurai', 'raipur', 'kota', 'chandigarh', 'guwahati',
    'solapur', 'hubli', 'mysore', 'tiruchirappalli', 'bareilly', 'aligarh', 'tiruppur',
    'moradabad', 'jalandhar', 'bhubaneswar', 'salem', 'warangal', 'guntur', 'bhiwandi',
    'noida', 'gurugram', 'gurgaon'
  ];
  
  const indianStates = [
    'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh', 'goa',
    'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka', 'kerala',
    'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram', 'nagaland',
    'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu', 'telangana', 'tripura',
    'uttar pradesh', 'uttarakhand', 'west bengal'
  ];
  
  const lowerText = text.toLowerCase();
  const locations = [];
  
  indianCities.forEach(city => {
    if (lowerText.includes(city)) locations.push(city);
  });
  
  indianStates.forEach(state => {
    if (lowerText.includes(state)) locations.push(state);
  });
  
  // Extract pincode patterns
  const pincodePattern = /\b[1-9]\d{5}\b/g;
  const pincodes = text.match(pincodePattern) || [];
  pincodes.forEach(p => locations.push(`PIN: ${p}`));
  
  return [...new Set(locations)].slice(0, 10);
}
