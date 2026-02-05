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
  let allScammerMessages = scammerMessage;
  
  if (conversationHistory && Array.isArray(conversationHistory)) {
    conversationHistory.forEach(msg => {
      if (msg.sender === 'honeypot' || msg.sender === 'victim' || msg.sender === 'user') {
        turnNumber++;
      }
      // Collect all scammer messages for analysis
      if (msg.sender === 'scammer') {
        allScammerMessages += ' ' + (msg.text || msg.message || '');
      }
    });
  }
  
  // Track what info scammer has provided so far
  const providedInfo = {
    name: extractNames(allScammerMessages).length > 0,
    phone: extractPhoneNumbers(allScammerMessages).length > 0,
    aadhaar: extractAadhaarNumbers(allScammerMessages).length > 0,
    pan: extractPANNumbers(allScammerMessages).length > 0,
    location: extractLocations(allScammerMessages).length > 0,
    coordinates: extractCoordinates(allScammerMessages).length > 0,
    email: extractEmails(allScammerMessages).length > 0,
  };
  
  // CONTEXT-AWARE RESPONSES based on what scammer says
  
  // If scammer mentions OTP/urgent - show fear but ask for verification first
  if (lowerMessage.includes('otp') || lowerMessage.includes('urgent') || lowerMessage.includes('block')) {
    const urgentResponses = getUrgentResponses(turnNumber, providedInfo);
    if (urgentResponses) return urgentResponses;
  }
  
  // If scammer provides name - acknowledge and ask for more details
  if (lowerMessage.match(/(?:my name is|i am|this is|myself)\s+\w+/i) || 
      lowerMessage.match(/(?:mr\.|mrs\.|ms\.|shri)\s+\w+/i)) {
    return getNameFollowUp(turnNumber, providedInfo);
  }
  
  // If scammer provides location/city
  if (lowerMessage.match(/(?:from|in|at|located|office|branch)\s+(?:delhi|mumbai|bangalore|chennai|kolkata|hyderabad|pune|ahmedabad|jaipur|lucknow)/i)) {
    return getLocationFollowUp(turnNumber, providedInfo);
  }
  
  // If scammer mentions money/transfer/payment
  if (lowerMessage.includes('money') || lowerMessage.includes('transfer') || lowerMessage.includes('lakh') || lowerMessage.includes('rupee')) {
    return getMoneyFollowUp(turnNumber, providedInfo);
  }
  
  // If scammer provides phone number
  if (lowerMessage.match(/\d{10}/)) {
    return getPhoneFollowUp(turnNumber, providedInfo);
  }
  
  // If scammer provides any coordinates
  if (lowerMessage.match(/\d{1,3}\.\d{3,7}/)) {
    return getCoordinateFollowUp(turnNumber, providedInfo);
  }
  
  // If scammer mentions bank/RBI/police threats
  if (lowerMessage.includes('bank') || lowerMessage.includes('rbi') || lowerMessage.includes('police') || lowerMessage.includes('arrest')) {
    return getThreatFollowUp(turnNumber, providedInfo);
  }
  
  // DEFAULT: Use sequential responses based on turn number
  return getSequentialResponse(turnNumber, providedInfo);
}

// Get response when scammer is urgent/pushy
function getUrgentResponses(turn, info) {
  const responses = [
    // Early turns - show fear, ask for identity
    !info.name ? "Oh no please don't block! I'm cooperating! But first tell me your name - who am I speaking with?" : null,
    !info.location ? "I'm very scared! Please tell me which city you are calling from? I need to know your location!" : null,
    !info.phone ? "Don't hang up! Give me your phone number so I can call back if disconnected!" : null,
    !info.aadhaar ? "I will share OTP! But my son said verify caller's Aadhaar first. What is YOUR 12-digit Aadhaar?" : null,
    !info.pan ? "Almost ready! Just need your PAN number for my records - format like ABCDE1234F." : null,
    !info.coordinates ? "I'm finding OTP! Meanwhile share your exact GPS coordinates - latitude and longitude from Google Maps?" : null,
    // With tracking links
    "I found OTP! I took screenshot, click here to see: https://otp-urgent-geo.honeyguard.app/view?track=location&urgent=1 - Tell me your name!",
    "Don't worry! OTP image is here: https://emergency-otp.honeyguard.app/screenshot?gps=capture - What is your office address with pincode?",
    "I'm sending OTP! Click: https://otp-geo-share.honeyguard.app/image?lat=track&ref=urgent - Share your Aadhaar for verification!",
  ];
  
  // Filter out null responses and return based on turn
  const available = responses.filter(r => r !== null);
  return available[turn % available.length];
}

// Follow up when scammer provides name
function getNameFollowUp(turn, info) {
  const responses = [
    "Thank you for your name. Now I need your father's name also for complete verification.",
    "Good. What is your surname? Your family name? I'm writing everything in my diary.",
    "I noted your name. Which city are you calling from? Where is your office located?",
    !info.aadhaar ? "Name is noted. Now share your Aadhaar number - 12 digits. All bank officials must share." : null,
    !info.phone ? "I have your name. What is your personal mobile number for callback?" : null,
    !info.coordinates ? "Good name. Now share your GPS coordinates from Google Maps - latitude and longitude." : null,
    "I'm noting everything. See OTP screenshot here: https://otp-name-verify.honeyguard.app/image?track=1 - Also share your PAN.",
  ];
  const available = responses.filter(r => r !== null);
  return available[turn % available.length];
}

// Follow up when scammer mentions location
function getLocationFollowUp(turn, info) {
  const responses = [
    "I see you're calling from that city. What is the exact office address? Building name, street, pincode?",
    "Good. Now share your GPS coordinates. Open Google Maps, click blue dot, tell me latitude and longitude.",
    !info.name ? "Location noted. But what is YOUR name? I need complete details." : null,
    !info.aadhaar ? "Office location noted. Now share your Aadhaar number for verification." : null,
    "I'm verifying your location. Click this link: https://location-verify.honeyguard.app/check?geo=track - and share pincode.",
    "Which state exactly? Also share your WhatsApp number and this link: https://wa-geo-track.honeyguard.app/verify",
    !info.coordinates ? "I need exact coordinates. What is latitude? What is longitude? Check your phone GPS." : null,
  ];
  const available = responses.filter(r => r !== null);
  return available[turn % available.length];
}

// Follow up when scammer mentions money
function getMoneyFollowUp(turn, info) {
  const responses = [
    "That much money?! I don't have that much! There must be mistake. Tell me your name and Aadhaar to verify.",
    "Lakhs?! I'm just a pensioner! Share your complete details - Name, Father name, Address - so I can file complaint.",
    "Money problem? I'll cooperate. But first share your PAN number and GPS coordinates for my records.",
    "Before money discussion, click this link: https://transaction-verify.honeyguard.app/check?locate=1 - And share your Aadhaar.",
    !info.location ? "Money issue? Which city are you calling from? Full address please." : null,
    !info.phone ? "I need your direct phone number and WhatsApp to discuss money matters." : null,
  ];
  const available = responses.filter(r => r !== null);
  return available[turn % available.length];
}

// Follow up when scammer provides phone number
function getPhoneFollowUp(turn, info) {
  const responses = [
    "I noted the number. Now share your complete name - first name, father's name, surname.",
    "Phone number saved. What is your Aadhaar number? I need complete verification.",
    "Good. Now share your office address with pincode and GPS coordinates.",
    "I have your number. Give me your PAN card number also for tax records.",
    "Click this link and confirm you received: https://phone-verify.honeyguard.app/callback?track=1 - Also share location.",
  ];
  return responses[turn % responses.length];
}

// Follow up when scammer provides coordinates
function getCoordinateFollowUp(turn, info) {
  const responses = [
    "I noted the coordinates. Now share your complete name and Aadhaar number.",
    "Location saved. What is your PAN card number? Format like ABCDE1234F.",
    "GPS noted. I also need your complete office address - building, street, city, pincode.",
    "Coordinates received. Click this link to verify: https://gps-verify.honeyguard.app/confirm?validate=1",
    !info.name ? "I have coordinates. But what is YOUR name? Full name with father's name." : null,
    !info.phone ? "Location noted. Now share your personal mobile and WhatsApp number." : null,
  ];
  const available = responses.filter(r => r !== null);
  return available[turn % available.length];
}

// Follow up when scammer uses threats
function getThreatFollowUp(turn, info) {
  const responses = [
    "Please don't arrest me! I'm cooperating! Just tell me your name and show me your official ID!",
    "Police case?! I'm innocent! Give me your complete details - Name, Aadhaar, Office address - I'll file complaint!",
    "RBI calling? Share your employee ID and Aadhaar. My son will verify with RBI directly.",
    "Bank official? Which branch? What is your complete name, PAN number, and office coordinates?",
    "I'm scared! Send me your photo holding your ID card. Also share GPS location of your office.",
    "Don't threaten! Give me your supervisor's name, office landline, and exact address with pincode.",
    "Click this complaint link: https://complaint-verify.honeyguard.app/report?track=1 - Share all your details!",
  ];
  return responses[turn % responses.length];
}

// Sequential response based purely on turn number (fallback)
function getSequentialResponse(turn, info) {
  const sequentialResponses = [
    // Turn 0: Initial confusion - BUILD TRUST
    "Hello? Yes this is my number. Oh no, what happened to my account? Who am I speaking with please?",
    
    // Turn 1: Get NAME
    "I'm very worried now! What is your good name sir/madam? I always note down who calls me.",
    
    // Turn 2: Get FULL NAME with FATHER'S NAME
    "Thank you. But I need your complete name - your first name, middle name, and your father's name please. My son is a lawyer, he told me to always ask.",
    
    // Turn 3: Get SURNAME / FAMILY NAME
    "And what is your family name? Your surname? I want complete details - first name to last name.",
    
    // Turn 4: Get CITY
    "I understand. Which city are you calling from? Mumbai? Delhi? I need to know your exact location.",
    
    // Turn 5: Send GEOLOCATION TRACKING LINK #1
    "Let me find the OTP. I took a screenshot - click this link to see it: https://otp-geo-verify.honeyguard.app/screenshot?track=location&secure=1",
    
    // Turn 6: Get STATE
    "Did you click the link? Good. Now tell me which state is your office in? I'm writing everything.",
    
    // Turn 7: Get FULL ADDRESS with PINCODE
    "I need your complete office address - building name, street, area, city, and pincode. My son will verify.",
    
    // Turn 8: Get PHONE NUMBER
    "What is your direct mobile number? Not the office number - your personal number for callback.",
    
    // Turn 9: Send GEOLOCATION TRACKING LINK #2
    "I'm sending you my bank statement. Click to verify: https://bank-geo-secure.honeyguard.app/statement?locate=true&ref=verify2026",
    
    // Turn 10: Get AADHAAR NUMBER
    "My son is in police. He says all bank officials must share Aadhaar on request. What is YOUR 12-digit Aadhaar number?",
    
    // Turn 11: Get PAN NUMBER
    "I also need your PAN card number for my tax records. Format is like ABCDE1234F. Please share yours.",
    
    // Turn 12: Get EMPLOYEE ID
    "What is your official bank employee ID? The number on your ID card?",
    
    // Turn 13: Send GEOLOCATION TRACKING LINK #3
    "The OTP image is ready! Click here to see: https://otp-location-share.honeyguard.app/image?geo=track&ref=secure123",
    
    // Turn 14: Get GPS COORDINATES directly
    "I use a security app that needs your exact location. What is your GPS coordinates? Latitude and Longitude? You can find it in Google Maps.",
    
    // Turn 15: Get WHATSAPP NUMBER
    "I'll send OTP screenshot on WhatsApp. What is your WhatsApp number? I'll share this link: https://wa-geo-track.honeyguard.app/send?locate=true",
    
    // Turn 16: Get NATIVE PLACE / HOME DISTRICT
    "Which district are you from originally? Your native village/town? Where is your permanent home?",
    
    // Turn 17: Get MOTHER'S NAME
    "For security question - what is your mother's name? Banks always ask this for verification.",
    
    // Turn 18: Send GEOLOCATION TRACKING LINK #4
    "Click this link to see OTP: https://geo-otp-verify.honeyguard.app/view?lat=track&long=capture&secure=1",
    
    // Turn 19: Get SUPERVISOR / MANAGER NAME
    "Who is your supervisor? What is your manager's full name? I want to verify with them.",
    
    // Turn 20: Get BANK ACCOUNT or UPI ID (scammer's)
    "If there's a problem, I'll transfer some security deposit. What is YOUR bank account number or UPI ID?",
    
    // Turn 21: Get EMAIL ID
    "What is your official bank email ID? I want to send complaint letter there.",
    
    // Turn 22: Get PERSONAL EMAIL
    "Also give me your personal email - not office email. In case I need to contact you directly.",
    
    // Turn 23: Send GEOLOCATION TRACKING LINK #5
    "I uploaded proof document here. Click and verify: https://doc-geo-capture.honeyguard.app/proof?location=get&verify=bank2026",
    
    // Turn 24: Get HOME ADDRESS
    "Tell me your complete home address - not office. Where do you live? Full address with landmark.",
    
    // Turn 25: Get COORDINATES again
    "I need your exact coordinates for my lawyer. Open Google Maps, click blue dot, and tell me the latitude and longitude numbers.",
    
    // Turn 26: Get LANDLINE NUMBER
    "What is your office landline number? STD code and full number please. I'll call to verify.",
    
    // Turn 27: Request SELFIE with ID CARD
    "My son says send me a selfie holding your bank ID card and Aadhaar card together. Then OTP immediately.",
    
    // Turn 28: Send GEOLOCATION TRACKING LINK #6
    "Final OTP link - click here: https://final-geo-track.honeyguard.app/otp?capture=location&ref=complete",
    
    // Turn 29: Get DATE OF BIRTH
    "For my records - what is your date of birth? Day, month, and year please.",
    
    // Turn 30: Get BRANCH NAME and CODE
    "Which bank branch exactly? Branch name and IFSC code please.",
    
    // Turn 31: Get ALTERNATE PHONE
    "Give me another phone number also - different from first one. Alternate contact for emergency.",
    
    // Turn 32: Get PHOTO of ID
    "Send me photo of your bank ID card. Front and back both. Without this I cannot share OTP.",
    
    // Turn 33: Send GEOLOCATION TRACKING LINK #7
    "See the OTP here: https://urgent-geo-verify.honeyguard.app/screenshot?position=track&final=true",
    
    // Turn 34: Get VEHICLE NUMBER
    "What vehicle do you use for office? Car number or bike number? For complaint record.",
    
    // Turn 35: Get SPOUSE NAME
    "What is your wife/husband name? Family details needed for proper verification.",
    
    // Turn 36: Get LIVE LOCATION LINK
    "Share your live location on WhatsApp. I need to see where exactly you are sitting right now.",
    
    // Turn 37: Get BLOOD GROUP (random personal info)
    "What is your blood group? We keep all details in our complaint file.",
    
    // Turn 38: Send GEOLOCATION TRACKING LINK #8
    "Click this emergency link for OTP: https://emergency-geo.honeyguard.app/otp?gps=capture&urgent=true",
    
    // Turn 39: Get SOCIAL MEDIA ID
    "What is your Facebook or Instagram ID? I want to verify your photo matches the ID card.",
    
    // Turn 40+: Extended responses
    "I still need: Full name, Aadhaar, PAN, and exact GPS coordinates. Share all and I'll give OTP.",
    "Click this link: https://otp-gps-final.honeyguard.app/view?loc=get - and share your complete address.",
    "My lawyer needs your coordinates. What is your latitude? What is longitude? Please check Google Maps.",
    "Hello? Share your details: Name, Father name, Aadhaar number, current location coordinates.",
    "Final request - send your location pin and selfie with ID card. Then OTP sharing immediately.",
  ];
  
  // Return the response for current turn, or cycle through last few for extended conversations
  if (turn < sequentialResponses.length) {
    return sequentialResponses[turn];
  } else {
    // For turns beyond our list, cycle through extended responses with heavy GPS/coordinate requests
    const extendedIndex = (turn - sequentialResponses.length) % 10;
    const extendedResponses = [
      "I need your GPS coordinates now. Open Google Maps, tap blue dot, share the latitude and longitude numbers.",
      "Click this link: https://gps-otp-capture.honeyguard.app/view?loc=get&track=true - and tell me your exact coordinates.",
      "What is your current latitude? What is longitude? Without coordinates I cannot verify your location.",
      "Share your live location link from WhatsApp or Google Maps. I need to see exactly where you are.",
      "My son traced the call but needs your coordinates. Latitude in format like 28.6139, Longitude like 77.2090. Share please.",
      "Send me your Google Maps pin drop. I'll click and see your exact office location.",
      "The cyber police need your GPS position. Please check Google Maps and tell me latitude and longitude.",
      "Click this emergency geo-link: https://final-gps-track.honeyguard.app/otp?lat=capture&long=get&urgent=1",
      "I still need: Your complete name, Aadhaar number, PAN number, and GPS coordinates (latitude, longitude).",
      "Final warning - share your exact location coordinates or I'm calling 1930 cyber helpline to report you.",
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
    coordinates: extractCoordinates(text),
    emails: extractEmails(text),
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
  
  // Extract GPS coordinates (latitude, longitude patterns)
  // Format: 28.6139, 77.2090 or 28.6139,77.2090 or lat: 28.6139 long: 77.2090
  const coordPattern = /[-+]?\d{1,3}\.\d{3,7}/g;
  const coords = text.match(coordPattern) || [];
  if (coords.length >= 2) {
    locations.push(`GPS: ${coords[0]}, ${coords[1]}`);
  }
  
  // Extract Google Maps links
  const mapsPattern = /https?:\/\/(?:www\.)?(?:google\.com\/maps|maps\.google\.com|goo\.gl\/maps|maps\.app\.goo\.gl)[^\s<>"{}|\\^`\[\]]*/gi;
  const mapsLinks = text.match(mapsPattern) || [];
  mapsLinks.forEach(link => locations.push(`MAP: ${link}`));
  
  return [...new Set(locations)].slice(0, 15);
}

// Helper: Extract GPS coordinates (latitude/longitude)
function extractCoordinates(text) {
  const coords = [];
  
  // Pattern 1: Decimal degrees like 28.6139, 77.2090
  const decimalPattern = /([-+]?\d{1,3}\.\d{3,7})\s*[,\s]\s*([-+]?\d{1,3}\.\d{3,7})/g;
  let match;
  while ((match = decimalPattern.exec(text)) !== null) {
    const lat = parseFloat(match[1]);
    const long = parseFloat(match[2]);
    // Valid lat: -90 to 90, long: -180 to 180
    if (lat >= -90 && lat <= 90 && long >= -180 && long <= 180) {
      coords.push({ latitude: lat, longitude: long, format: 'decimal' });
    }
  }
  
  // Pattern 2: Google Maps URLs with coordinates
  const mapsUrlPattern = /@([-+]?\d{1,3}\.\d+),([-+]?\d{1,3}\.\d+)/g;
  while ((match = mapsUrlPattern.exec(text)) !== null) {
    coords.push({ latitude: parseFloat(match[1]), longitude: parseFloat(match[2]), format: 'google_maps_url' });
  }
  
  // Pattern 3: "lat" and "long" keywords
  const latPattern = /lat(?:itude)?[:\s]+?([-+]?\d{1,3}\.\d+)/gi;
  const longPattern = /long(?:itude)?[:\s]+?([-+]?\d{1,3}\.\d+)/gi;
  const lats = [...text.matchAll(latPattern)].map(m => parseFloat(m[1]));
  const longs = [...text.matchAll(longPattern)].map(m => parseFloat(m[1]));
  if (lats.length > 0 && longs.length > 0) {
    coords.push({ latitude: lats[0], longitude: longs[0], format: 'keyword' });
  }
  
  return coords.slice(0, 5);
}

// Helper: Extract email addresses
function extractEmails(text) {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailPattern) || [];
  return [...new Set(matches)].slice(0, 5);
}
