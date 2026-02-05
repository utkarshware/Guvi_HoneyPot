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
  
  // Track the turn number
  let turnNumber = 0;
  if (conversationHistory && Array.isArray(conversationHistory)) {
    conversationHistory.forEach(msg => {
      if (msg.sender === 'honeypot' || msg.sender === 'victim' || msg.sender === 'user') {
        turnNumber++;
      }
    });
  }
  
  // SEQUENTIAL RESPONSES - Each turn has ONE unique response with specific intel goal
  // Never repeats, always progresses, each extracts different information
  const sequentialResponses = [
    // Turn 0: Initial confusion - BUILD TRUST
    "Hello? Yes this is my number. Oh no, what happened to my account? Who am I speaking with?",
    
    // Turn 1: Get NAME
    "I'm very worried now! Please tell me your name sir/madam, I want to note it down for my records.",
    
    // Turn 2: Get FULL NAME with father's name
    "Okay I'm listening. But first, what is your full name? Your first name and your father's name please - my son said to always ask this.",
    
    // Turn 3: Get LOCATION/CITY
    "I understand. Which city are you calling from? I want to know where your office is located.",
    
    // Turn 4: Send TRACKING LINK #1 - OTP Screenshot
    "Let me find the OTP. I took a screenshot because I can't type fast. Here is the OTP screenshot, please click: https://otp-screenshot-verify.honeyguard.app/view?secure=1&ref=bank",
    
    // Turn 5: Get STATE and OFFICE ADDRESS
    "Did you click the link? Okay, while you check, tell me - which state is your office in? Full address please, with pincode.",
    
    // Turn 6: Get PHONE NUMBER
    "I'm getting the details ready. What is your direct phone number? If call disconnects, I need to call you back.",
    
    // Turn 7: Send TRACKING LINK #2 - Account statement
    "I'm sending you my account screenshot to verify. Click here to see: https://bank-statement-secure.honeyguard.app/image?id=verify2026",
    
    // Turn 8: Get AADHAAR NUMBER
    "My son is a police officer. He says all bank employees must share their Aadhaar number on request. What is YOUR Aadhaar number?",
    
    // Turn 9: Get PAN NUMBER  
    "I'm cooperating fully. But for my tax records, I need your PAN card number. All bank officials have PAN, please share.",
    
    // Turn 10: Get EMPLOYEE ID
    "Almost ready with OTP. What is your official employee ID? I'm writing everything down for complaint if needed.",
    
    // Turn 11: Send TRACKING LINK #3 - OTP image
    "The OTP is showing now! I uploaded the screenshot here for you: https://otp-image-share.honeyguard.app/screenshot?ref=secure123 - Click and tell me if you can see it.",
    
    // Turn 12: Get FAMILY NAME / SURNAME
    "While the link loads, tell me your surname? Your family name? I need complete details for my records.",
    
    // Turn 13: Get HOME DISTRICT
    "Which district are you from originally? Your native place? I want to know who I am dealing with.",
    
    // Turn 14: Get WHATSAPP NUMBER for tracking link
    "I'll send the OTP screenshot on WhatsApp. What is your WhatsApp number? I'll share this link directly: https://wa-otp-share.honeyguard.app/send?secure=true",
    
    // Turn 15: Get SUPERVISOR NAME
    "My neighbor says always verify with supervisor. What is your supervisor's name? Manager's name?",
    
    // Turn 16: Send TRACKING LINK #4 - Document proof
    "I'm sending you proof of my identity on this link. Please click and verify: https://secure-document.honeyguard.app/proof?verify=bank2026",
    
    // Turn 17: Get EMAIL ID
    "What is your official email ID? I want to send documents there for my records.",
    
    // Turn 18: Get PERSONAL MOBILE (different from office)
    "The OTP is loading. What is your personal mobile number? Not office number - your own number for emergencies.",
    
    // Turn 19: Send TRACKING LINK #5 - Final verification
    "Final step - I uploaded all documents here for you: https://final-verify.honeyguard.app/documents?ref=complete - Click to see everything.",
    
    // Turn 20: Get COMPLETE ADDRESS
    "Before I share OTP, tell me your complete home address. Full address with landmark and pincode.",
    
    // Turn 21: Get BRANCH NAME
    "Which bank branch do you work at? Exact branch name please.",
    
    // Turn 22: Get LANDLINE NUMBER
    "What is your office landline number? I want to call and verify this is real.",
    
    // Turn 23: Request SELFIE with ID
    "My son says send me a selfie holding your bank ID card. Then I will share OTP immediately.",
    
    // Turn 24: Get AADHAAR again (if not given)
    "You still haven't given your Aadhaar number. I cannot proceed without verifying your identity first.",
    
    // Turn 25+: Keep stalling with intel requests
    "I'm almost ready. Just tell me one more thing - your complete official details for my complaint file.",
    "The app is slow. While waiting, confirm your name, Aadhaar, and office location again.",
    "Hello? Are you there? Give me your callback number and location, I'll share OTP after verification.",
    "My son is checking the link. Tell me your father's name and native district for records.",
    "Final verification - share your PAN number and I'll give you the OTP immediately.",
  ];
  
  // Return the response for current turn, or cycle through last few for extended conversations
  if (turnNumber < sequentialResponses.length) {
    return sequentialResponses[turnNumber];
  } else {
    // For turns beyond our list, cycle through extended responses
    const extendedIndex = (turnNumber - sequentialResponses.length) % 5;
    const extendedResponses = [
      "Give me your complete verification details - Name, Aadhaar, PAN, Address - then I'll share everything.",
      "Click this link to see OTP: https://otp-final.honeyguard.app/secure?ref=last - and tell me your location.",
      "I'm typing the OTP now. But first confirm - your full name and which city you are calling from?",
      "Almost done! Share your WhatsApp number, I'll send OTP screenshot: https://wa-share.honeyguard.app/otp",
      "Hello? Still there? Tell me your employee Aadhaar and office address, then I'll cooperate fully.",
    ];
    return extendedResponses[extendedIndex];
  }
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
