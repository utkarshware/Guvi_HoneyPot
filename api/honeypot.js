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
  
  // All unique responses - AGGRESSIVE intelligence extraction while sounding like victim
  const allResponses = [
    // Turn 0-1: Initial shock and confusion - build trust
    "What?! My account is having issues? This is very concerning! Who am I speaking with please?",
    "Oh no! Which account? I'm so worried! Sir/Madam, what is your good name? I want to note it down.",
    
    // Turn 2-3: Get their name and identity
    "Before we proceed, I need to verify YOU are legitimate. Please tell me your FULL NAME - first name and surname - for my records.",
    "My son told me to always note down caller details. Please spell your complete name - your first name and your father's name also.",
    
    // Turn 4-5: Get location and branch info
    "I'm getting my documents ready. Which city are you calling from? I want to visit your office in person tomorrow.",
    "Sir, I'm an old person, I don't trust phone calls. Tell me YOUR office address - full address with pincode - so my son can verify.",
    
    // Turn 6-7: Pretend to share OTP but send tracking link
    "Okay okay, I understand it's urgent! I took a screenshot of the OTP message. I'll send it to you - give me your WhatsApp number and I'll send this link: https://otp-verify-secure.honeyguard.app/screenshot?ref=bank_verify",
    "The OTP is hard to read on my phone. I uploaded the screenshot here, please check: https://secure-otp-view.honeyguard.app/view?verify=true - Can you confirm you received it?",
    
    // Turn 8-9: Ask for THEIR Aadhaar/PAN for "verification"
    "Wait, my bank always verifies the CALLER's identity first. What is YOUR Aadhaar number? I need to verify you work at the bank.",
    "Before I share my details, you share yours first. Please tell me your PAN card number - all bank employees have PAN for verification.",
    
    // Turn 10-11: Get employee details and family info
    "My neighbor said fraudsters target us. To prove you're real, tell me - what is your father's name? Your full family name?",
    "I'll cooperate, but first tell me your employee Aadhaar - all government bank employees must share on request. Also your home district please.",
    
    // Turn 12-13: Location extraction through concern
    "Sir, I'm very scared. If something goes wrong, where can I meet you in person? Tell me your office location and your residence area.",
    "I want to file a complaint with good details. Which state are you in? Which district? Your local police station name?",
    
    // Turn 14-15: Send more tracking links disguised as help
    "I'm sending you my account screenshot on this secure link for you to check: https://account-verify.honeyguard.app/statement?secure=true - please click and tell me if you see the transaction.",
    "My phone is showing error. I uploaded the OTP screenshot here: https://otp-secure-share.honeyguard.app/image?id=OTP2026 - Click it and confirm you can see the 6 digits.",
    
    // Turn 16-17: ID document request
    "My son is a police officer. He said to ask for your official ID. Send me photo of your bank ID card and PAN card to verify you.",
    "I will share everything! But first, show me YOUR ID proof - take a selfie with your Aadhaar card and send. This is for my safety.",
    
    // Turn 18-19: Deep personal info extraction
    "I'm typing the OTP now. But sir, tell me about yourself - your full name, your father's name, which village/city you are from originally?",
    "The app is loading. Meanwhile, share your complete official details - Name, Employee ID, Aadhaar number, and office landline number.",
    
    // Turn 20+: Maximum pressure for info
    "Before I give my OTP, you give me: Your full name, your PAN number, your office address, and your direct mobile number. Fair exchange only!",
    "I recorded this call. Give me your complete identity details now - Name, Aadhaar, PAN, and home address - or I'm calling cyber police.",
  ];
  
  // Add context-specific responses based on what scammer mentions
  const contextResponses = [];
  
  if (lowerMessage.includes('otp')) {
    contextResponses.push(
      "I have the OTP! But my son said verify caller first. Tell me your Aadhaar number and I'll share immediately.",
      "OTP is ready! I took a screenshot. Click this link to see it: https://otp-screenshot.honeyguard.app/view?secure=1 - What is your name so I know you received it?",
      "I see the OTP! But first, which city is your call center located? I need to know your exact location for my records.",
      "The OTP came! Before I read it, tell me your full name - first name, middle name, surname, and your native place."
    );
  }
  
  if (lowerMessage.includes('upi') || lowerMessage.includes('pin')) {
    contextResponses.push(
      "You want my UPI PIN? Then you share YOUR PAN number first - fair exchange for security verification.",
      "I'll share UPI details after you share your Aadhaar number and office address. My son who is in police said to always verify.",
      "UPI is sensitive. First tell me your exact location - which building, which floor, which city? I'll share after that."
    );
  }
  
  if (lowerMessage.includes('minute') || lowerMessage.includes('hour') || lowerMessage.includes('block') || lowerMessage.includes('urgent')) {
    contextResponses.push(
      "Don't block it! I'm getting OTP now. While I search, tell me your full name and employee Aadhaar for my complaint record!",
      "So urgent! I'm panicking! Give me your personal mobile number and home address - if call drops I'll come meet you directly!",
      "Okay okay! I'm opening app. Tell me your complete address - city, area, landmark - so I can verify your office exists!"
    );
  }
  
  if (lowerMessage.includes('email') || lowerMessage.match(/[\w.-]+@[\w.-]+/)) {
    contextResponses.push(
      "I'll email you the screenshot of my OTP from this link: https://email-otp-verify.honeyguard.app/send - but first give me your official ID and PAN.",
      "Email? Give me your personal email ID. Also tell me your Aadhaar number to verify you're really from bank."
    );
  }
  
  if (lowerMessage.includes('money') || lowerMessage.includes('transfer') || lowerMessage.includes('payment')) {
    contextResponses.push(
      "For money transfer, I need proper documentation. Send me your PAN card photo and Aadhaar card photo for my records.",
      "I'll transfer! But my auditor needs: Your full name, father's name, residential address, and PAN number. Share now please."
    );
  }
  
  if (lowerMessage.includes('bank') || lowerMessage.includes('account')) {
    contextResponses.push(
      "Which bank exactly? I have many accounts. Also tell me YOUR bank branch location and your employee Aadhaar.",
      "For account verification, I need your official identity too. Share your complete name and PAN card number please."
    );
  }
  
  // Tracking link responses - always try to get them to click
  const trackingLinkResponses = [
    "I uploaded my account screenshot here for you: https://bank-verify.honeyguard.app/screenshot?id=secure123 - Click and confirm you can see it. Also tell me your name.",
    "See the OTP image I captured: https://otp-share-secure.honeyguard.app/image?ref=bank2026 - Please click. What is your office location?",
    "I'm sending you proof on this link: https://secure-document.honeyguard.app/proof?verify=true - Click it. And give me your Aadhaar number for my records.",
  ];
  
  // Add tracking link response at turns 5, 8, 12 if not already used
  if (turnNumber === 5 || turnNumber === 8 || turnNumber === 12) {
    const trackingResponse = trackingLinkResponses[turnNumber % trackingLinkResponses.length];
    if (!previousReplies.has(trackingResponse.toLowerCase().trim())) {
      contextResponses.push(trackingResponse);
    }
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
  
  // Fallback: generate a dynamic response with aggressive info extraction
  const fallbackResponses = [
    `I'm searching for the ${lowerMessage.includes('otp') ? 'OTP' : 'details'}. Meanwhile tell me your FULL NAME and AADHAAR NUMBER for verification.`,
    "My phone is loading. Give me your complete identity - Name, PAN, Address - so I can verify you're legitimate.",
    "Almost found it! Share your employee Aadhaar and office location while I get the OTP ready.",
    "System is slow. Check this OTP screenshot: https://verify-otp.honeyguard.app/view?s=1 - and tell me your father's name.",
    "I'll share in a moment! But first: your full name, your district, and your personal mobile number please.",
    "Click this link to see my OTP screenshot: https://otp-image.honeyguard.app/secure?ref=bank - What's your Aadhaar number?",
    "Loading... Tell me your complete permanent address - I want to file everything in case of fraud.",
    "I need to verify YOU first. Give me: Your name, PAN number, home city, and a callback number.",
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
