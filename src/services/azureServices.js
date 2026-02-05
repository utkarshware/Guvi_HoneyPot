// Microsoft Azure Services Integration for HoneyPot Scam Detection
// Services: Translator, Language (Text Analytics), Speech, Computer Vision

class AzureServices {
  constructor() {
    // Azure configuration - Using unified multi-service cognitive key
    const azureKey = import.meta.env.VITE_AZURE_KEY || "";
    const azureRegion = import.meta.env.VITE_AZURE_REGION || "eastus";
    const azureEndpoint =
      import.meta.env.VITE_AZURE_ENDPOINT ||
      "https://eastus.api.cognitive.microsoft.com";

    this.config = {
      // All services use the same key from multi-service account
      translatorKey: azureKey,
      translatorEndpoint:
        import.meta.env.VITE_AZURE_TRANSLATOR_ENDPOINT ||
        "https://api.cognitive.microsofttranslator.com",
      translatorRegion: azureRegion,

      languageKey: azureKey,
      languageEndpoint:
        import.meta.env.VITE_AZURE_LANGUAGE_ENDPOINT || azureEndpoint,

      speechKey: azureKey,
      speechRegion: azureRegion,

      visionKey: azureKey,
      visionEndpoint:
        import.meta.env.VITE_AZURE_VISION_ENDPOINT || azureEndpoint,
    };

    console.log("Azure Services initialized:", {
      hasKey: !!azureKey,
      region: azureRegion,
      visionEndpoint: this.config.visionEndpoint,
    });

    // Supported languages for translation
    this.supportedLanguages = [
      { code: "en", name: "English", nativeName: "English" },
      { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
      { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
      { code: "te", name: "Telugu", nativeName: "తెలుగు" },
      { code: "bn", name: "Bengali", nativeName: "বাংলা" },
      { code: "mr", name: "Marathi", nativeName: "मराठी" },
      { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
      { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
      { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
      { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
      { code: "ur", name: "Urdu", nativeName: "اردو" },
      { code: "es", name: "Spanish", nativeName: "Español" },
      { code: "fr", name: "French", nativeName: "Français" },
      { code: "de", name: "German", nativeName: "Deutsch" },
      {
        code: "zh-Hans",
        name: "Chinese (Simplified)",
        nativeName: "中文(简体)",
      },
      { code: "ar", name: "Arabic", nativeName: "العربية" },
    ];
  }

  // ==================== MICROSOFT TRANSLATOR SERVICE ====================

  /**
   * Translate text using Microsoft Translator
   * @param {string} text - Text to translate
   * @param {string} targetLang - Target language code
   * @param {string} sourceLang - Source language code (optional, auto-detect if not provided)
   */
  async translateText(text, targetLang, sourceLang = null) {
    if (!this.config.translatorKey) {
      // Fallback to mock translation if no API key
      return this.mockTranslate(text, targetLang, sourceLang);
    }

    try {
      const url = `${this.config.translatorEndpoint}/translate?api-version=3.0&to=${targetLang}${sourceLang ? `&from=${sourceLang}` : ""}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": this.config.translatorKey,
          "Ocp-Apim-Subscription-Region": this.config.translatorRegion,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ text }]),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        translatedText: data[0].translations[0].text,
        detectedLanguage: data[0].detectedLanguage?.language || sourceLang,
        confidence: data[0].detectedLanguage?.score || 1.0,
      };
    } catch (error) {
      console.error("Azure Translator error:", error);
      return this.mockTranslate(text, targetLang, sourceLang);
    }
  }

  /**
   * Detect language of text
   */
  async detectLanguage(text) {
    if (!this.config.translatorKey) {
      return this.mockDetectLanguage(text);
    }

    try {
      const url = `${this.config.translatorEndpoint}/detect?api-version=3.0`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": this.config.translatorKey,
          "Ocp-Apim-Subscription-Region": this.config.translatorRegion,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ text }]),
      });

      const data = await response.json();
      return {
        language: data[0].language,
        confidence: data[0].score,
        alternatives: data[0].alternatives || [],
      };
    } catch (error) {
      console.error("Language detection error:", error);
      return this.mockDetectLanguage(text);
    }
  }

  // Mock translation for demo/fallback
  mockTranslate(text, targetLang, sourceLang) {
    // Simple mock that returns original with language indicator
    const langName =
      this.supportedLanguages.find((l) => l.code === targetLang)?.name ||
      targetLang;
    return {
      translatedText: text, // In real implementation, this would be translated
      detectedLanguage: sourceLang || "en",
      confidence: 0.95,
      note: `Demo mode: Would translate to ${langName}. Configure Azure API key for real translation.`,
    };
  }

  mockDetectLanguage(text) {
    // Simple heuristic-based detection for demo
    const hindiChars = /[\u0900-\u097F]/;
    const tamilChars = /[\u0B80-\u0BFF]/;
    const teluguChars = /[\u0C00-\u0C7F]/;
    const bengaliChars = /[\u0980-\u09FF]/;
    const arabicChars = /[\u0600-\u06FF]/;
    const chineseChars = /[\u4E00-\u9FFF]/;

    if (hindiChars.test(text)) return { language: "hi", confidence: 0.9 };
    if (tamilChars.test(text)) return { language: "ta", confidence: 0.9 };
    if (teluguChars.test(text)) return { language: "te", confidence: 0.9 };
    if (bengaliChars.test(text)) return { language: "bn", confidence: 0.9 };
    if (arabicChars.test(text)) return { language: "ar", confidence: 0.9 };
    if (chineseChars.test(text))
      return { language: "zh-Hans", confidence: 0.9 };

    return { language: "en", confidence: 0.85 };
  }

  // ==================== MICROSOFT LANGUAGE SERVICE (TEXT ANALYTICS) ====================

  /**
   * Analyze text for sentiment, key phrases, and entities
   */
  async analyzeText(text, language = "en") {
    if (!this.config.languageKey) {
      return this.mockAnalyzeText(text, language);
    }

    try {
      const documents = [{ id: "1", language, text }];

      // Sentiment Analysis
      const sentimentResponse = await fetch(
        `${this.config.languageEndpoint}/text/analytics/v3.1/sentiment`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": this.config.languageKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documents }),
        },
      );

      // Key Phrases
      const keyPhrasesResponse = await fetch(
        `${this.config.languageEndpoint}/text/analytics/v3.1/keyPhrases`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": this.config.languageKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documents }),
        },
      );

      // Entity Recognition
      const entitiesResponse = await fetch(
        `${this.config.languageEndpoint}/text/analytics/v3.1/entities/recognition/general`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": this.config.languageKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documents }),
        },
      );

      const [sentiment, keyPhrases, entities] = await Promise.all([
        sentimentResponse.json(),
        keyPhrasesResponse.json(),
        entitiesResponse.json(),
      ]);

      return {
        sentiment: sentiment.documents?.[0]?.sentiment,
        confidenceScores: sentiment.documents?.[0]?.confidenceScores,
        keyPhrases: keyPhrases.documents?.[0]?.keyPhrases || [],
        entities: entities.documents?.[0]?.entities || [],
      };
    } catch (error) {
      console.error("Azure Language Service error:", error);
      return this.mockAnalyzeText(text, language);
    }
  }

  mockAnalyzeText(text, language) {
    const lowerText = text.toLowerCase();

    // Detect scam-related keywords
    const scamKeywords = [
      "urgent",
      "immediately",
      "verify",
      "blocked",
      "suspended",
      "winner",
      "lottery",
      "prize",
      "click here",
      "account",
      "bank",
      "kyc",
      "update",
      "password",
      "otp",
      "upi",
      "transfer",
      "payment",
    ];

    const foundKeywords = scamKeywords.filter((kw) => lowerText.includes(kw));
    const isNegative = foundKeywords.length > 2;

    // Extract entities using regex
    const phoneNumbers = text.match(/\+?\d{10,12}/g) || [];
    const urls = text.match(/https?:\/\/[^\s]+|[\w-]+\.[\w.-]+\/[^\s]*/g) || [];
    const emails = text.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];

    return {
      sentiment: isNegative
        ? "negative"
        : foundKeywords.length > 0
          ? "mixed"
          : "neutral",
      confidenceScores: {
        positive: isNegative ? 0.1 : 0.3,
        neutral: isNegative ? 0.2 : 0.5,
        negative: isNegative ? 0.7 : 0.2,
      },
      keyPhrases: foundKeywords,
      entities: [
        ...phoneNumbers.map((p) => ({
          text: p,
          category: "PhoneNumber",
          confidenceScore: 0.95,
        })),
        ...urls.map((u) => ({
          text: u,
          category: "URL",
          confidenceScore: 0.9,
        })),
        ...emails.map((e) => ({
          text: e,
          category: "Email",
          confidenceScore: 0.95,
        })),
      ],
    };
  }

  // ==================== MICROSOFT SPEECH SERVICE ====================

  /**
   * Transcribe audio file using Azure Speech Service
   * @param {File|Blob} audioFile - Audio file (mp3, wav, etc.)
   * @param {string} language - Language code for transcription
   */
  async transcribeAudio(audioFile, language = "en-IN") {
    if (!this.config.speechKey) {
      return this.mockTranscribeAudio(audioFile, language);
    }

    try {
      // Convert to WAV if needed (Azure Speech prefers WAV)
      const audioData = await this.prepareAudioForAzure(audioFile);

      const url = `https://${this.config.speechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${language}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": this.config.speechKey,
          "Content-Type": "audio/wav",
          Accept: "application/json",
        },
        body: audioData,
      });

      if (!response.ok) {
        throw new Error(`Speech recognition failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        text: result.DisplayText || result.NBest?.[0]?.Display || "",
        confidence: result.NBest?.[0]?.Confidence || 0.9,
        duration: result.Duration,
        language: language,
      };
    } catch (error) {
      console.error("Azure Speech Service error:", error);
      return this.mockTranscribeAudio(audioFile, language);
    }
  }

  /**
   * Analyze audio for scam patterns
   */
  async analyzeAudioForScam(audioFile, language = "en-IN") {
    // Step 1: Transcribe audio
    const transcription = await this.transcribeAudio(audioFile, language);

    // Step 2: Analyze transcribed text
    const textAnalysis = await this.analyzeText(
      transcription.text,
      language.split("-")[0],
    );

    // Step 3: Detect language if not specified
    const detectedLang = await this.detectLanguage(transcription.text);

    // Step 4: Perform scam pattern analysis
    const scamAnalysis = this.analyzeForScamPatterns(transcription.text);

    return {
      transcription,
      textAnalysis,
      detectedLanguage: detectedLang,
      scamAnalysis,
      riskScore: this.calculateAudioRiskScore(textAnalysis, scamAnalysis),
    };
  }

  async prepareAudioForAzure(audioFile) {
    // In a real implementation, you would convert to proper format
    // For now, return the file as-is (assuming it's compatible)
    return await audioFile.arrayBuffer();
  }

  mockTranscribeAudio(audioFile, language) {
    // Simulated transcription for demo
    const mockTranscriptions = [
      "Dear customer, your SBI account has been blocked due to suspicious activity. Please call this number immediately to verify your identity and unblock your account.",
      "Congratulations! You have won 25 lakh rupees in our lottery. Please share your UPI ID and bank details to receive the prize money.",
      "This is an urgent message from your bank. Your KYC is pending. Click the link to update your details immediately or your account will be suspended.",
      "Hello sir, I am calling from customer care. Your account shows some pending transactions. Please share your OTP to verify.",
    ];

    return {
      text: mockTranscriptions[
        Math.floor(Math.random() * mockTranscriptions.length)
      ],
      confidence: 0.85 + Math.random() * 0.1,
      duration: 15000 + Math.random() * 30000,
      language: language,
      note: "Demo mode: Configure Azure Speech API key for real transcription.",
    };
  }

  analyzeForScamPatterns(text) {
    const lowerText = text.toLowerCase();

    const patterns = {
      urgencyTactics: [],
      financialRequests: [],
      impersonation: [],
      suspiciousLinks: [],
      dataRequests: [],
    };

    // Urgency patterns
    const urgencyWords = [
      "urgent",
      "immediately",
      "now",
      "quickly",
      "asap",
      "hurry",
      "deadline",
      "expires",
    ];
    urgencyWords.forEach((word) => {
      if (lowerText.includes(word)) patterns.urgencyTactics.push(word);
    });

    // Financial patterns
    const financialWords = [
      "bank",
      "account",
      "upi",
      "transfer",
      "payment",
      "money",
      "rupees",
      "lakh",
      "crore",
      "lottery",
      "prize",
      "winner",
    ];
    financialWords.forEach((word) => {
      if (lowerText.includes(word)) patterns.financialRequests.push(word);
    });

    // Impersonation patterns
    const impersonationWords = [
      "customer care",
      "bank official",
      "government",
      "police",
      "rbi",
      "income tax",
      "sbi",
      "hdfc",
      "icici",
    ];
    impersonationWords.forEach((word) => {
      if (lowerText.includes(word)) patterns.impersonation.push(word);
    });

    // Data request patterns
    const dataWords = [
      "otp",
      "password",
      "pin",
      "cvv",
      "kyc",
      "aadhar",
      "pan",
      "verify",
      "details",
      "share",
    ];
    dataWords.forEach((word) => {
      if (lowerText.includes(word)) patterns.dataRequests.push(word);
    });

    // Extract links
    const urls = text.match(/https?:\/\/[^\s]+|[\w-]+\.[\w.-]+\/[^\s]*/g) || [];
    patterns.suspiciousLinks = urls;

    return patterns;
  }

  calculateAudioRiskScore(textAnalysis, scamAnalysis) {
    let score = 0;

    // Sentiment contribution
    if (textAnalysis.sentiment === "negative") score += 20;
    if (textAnalysis.sentiment === "mixed") score += 10;

    // Pattern contributions
    score += scamAnalysis.urgencyTactics.length * 10;
    score += scamAnalysis.financialRequests.length * 8;
    score += scamAnalysis.impersonation.length * 15;
    score += scamAnalysis.dataRequests.length * 12;
    score += scamAnalysis.suspiciousLinks.length * 20;

    // Entity contributions
    score +=
      textAnalysis.entities.filter((e) => e.category === "PhoneNumber").length *
      5;
    score +=
      textAnalysis.entities.filter((e) => e.category === "URL").length * 15;

    return Math.min(score, 100);
  }

  calculateTextRiskScore(scamPatterns) {
    let score = 0;

    // Pattern contributions
    score += scamPatterns.urgencyTactics.length * 12;
    score += scamPatterns.financialRequests.length * 10;
    score += scamPatterns.impersonation.length * 18;
    score += scamPatterns.dataRequests.length * 15;
    score += scamPatterns.suspiciousLinks.length * 20;

    return Math.min(score, 100);
  }

  // ==================== MICROSOFT COMPUTER VISION SERVICE ====================

  /**
   * Extract text from image using Azure Computer Vision OCR
   */
  async extractTextFromImage(imageFile) {
    if (!this.config.visionKey) {
      return this.mockOCR(imageFile);
    }

    try {
      const imageData = await imageFile.arrayBuffer();

      // Use Read API for better accuracy
      const analyzeUrl = `${this.config.visionEndpoint}/vision/v3.2/read/analyze`;

      const analyzeResponse = await fetch(analyzeUrl, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": this.config.visionKey,
          "Content-Type": "application/octet-stream",
        },
        body: imageData,
      });

      if (!analyzeResponse.ok) {
        throw new Error(`Vision API failed: ${analyzeResponse.statusText}`);
      }

      // Get operation location for async result
      const operationLocation =
        analyzeResponse.headers.get("Operation-Location");

      // Poll for result
      let result = null;
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const resultResponse = await fetch(operationLocation, {
          headers: {
            "Ocp-Apim-Subscription-Key": this.config.visionKey,
          },
        });

        result = await resultResponse.json();
        if (result.status === "succeeded") break;
      }

      if (result?.status !== "succeeded") {
        throw new Error("OCR operation timed out");
      }

      // Extract text from result
      const lines = [];
      result.analyzeResult?.readResults?.forEach((page) => {
        page.lines?.forEach((line) => {
          lines.push(line.text);
        });
      });

      return {
        text: lines.join("\n"),
        lines,
        confidence: 0.95,
      };
    } catch (error) {
      console.error("Azure Computer Vision error:", error);
      return this.mockOCR(imageFile);
    }
  }

  /**
   * Analyze image for scam content
   */
  async analyzeImageForScam(imageFile) {
    // Step 1: Extract text using OCR
    const ocrResult = await this.extractTextFromImage(imageFile);

    // Step 2: Detect language
    const detectedLang = await this.detectLanguage(ocrResult.text);

    // Step 3: Translate to English if needed for analysis
    let textForAnalysis = ocrResult.text;
    let translation = null;

    if (detectedLang.language !== "en" && detectedLang.confidence > 0.7) {
      translation = await this.translateText(
        ocrResult.text,
        "en",
        detectedLang.language,
      );
      textForAnalysis = translation.translatedText;
    }

    // Step 4: Analyze text for scam patterns
    const textAnalysis = await this.analyzeText(textForAnalysis, "en");
    const scamPatterns = this.analyzeForScamPatterns(textForAnalysis);

    // Step 5: Extract intelligence
    const intelligence = this.extractIntelligence(ocrResult.text);

    return {
      ocrResult,
      detectedLanguage: detectedLang,
      translation,
      textAnalysis,
      scamPatterns,
      intelligence,
      riskScore: this.calculateImageRiskScore(
        textAnalysis,
        scamPatterns,
        intelligence,
      ),
    };
  }

  extractIntelligence(text) {
    // Whitelist of legitimate domains that should not be flagged as phishing
    const legitimateDomains = [
      "lenskart.com",
      "lenskart.in",
      "amazon.com",
      "amazon.in",
      "flipkart.com",
      "myntra.com",
      "whatsapp.com",
      "wa.me",
      "google.com",
      "google.co.in",
      "facebook.com",
      "fb.com",
      "instagram.com",
      "twitter.com",
      "x.com",
      "youtube.com",
      "youtu.be",
      "linkedin.com",
      "microsoft.com",
      "apple.com",
      "paytm.com",
      "phonepe.com",
      "gpay.com",
      "pay.google.com",
      "hdfc.com",
      "hdfcbank.com",
      "sbi.co.in",
      "onlinesbi.com",
      "icicibank.com",
      "axisbank.com",
      "kotak.com",
      "zomato.com",
      "swiggy.com",
      "ola.com",
      "olacabs.com",
      "uber.com",
      "makemytrip.com",
      "goibibo.com",
      "cleartrip.com",
      "irctc.co.in",
      "redbus.in",
      "bookmyshow.com",
      "nykaa.com",
      "ajio.com",
      "tatacliq.com",
      "relianceretail.com",
      "jiomart.com",
      "bigbasket.com",
      "grofers.com",
      "blinkit.com",
      "gov.in",
      "nic.in",
      "razorpay.com",
      "cashfree.com",
      "zerodha.com",
      "groww.in",
      "upstox.com",
    ];

    const allLinks =
      text.match(/https?:\/\/[^\s]+|[\w-]+\.[\w.-]+\/[^\s]*/g) || [];

    // Filter out legitimate domains
    const suspiciousLinks = allLinks.filter((link) => {
      const linkLower = link.toLowerCase();
      return !legitimateDomains.some((domain) =>
        linkLower.includes(domain.toLowerCase()),
      );
    });

    return {
      phoneNumbers: text.match(/\+?\d{10,12}/g) || [],
      upiIds: text.match(/[\w.-]+@[\w]+/g) || [],
      phishingLinks: suspiciousLinks,
      bankAccounts: text.match(/\d{9,18}/g) || [],
      emails: text.match(/[\w.-]+@[\w.-]+\.\w+/g) || [],
    };
  }

  calculateImageRiskScore(textAnalysis, scamPatterns, intelligence) {
    let score = 0;

    // Text analysis contribution
    if (textAnalysis.sentiment === "negative") score += 15;
    score += textAnalysis.keyPhrases.length * 5;

    // Pattern contributions
    score += scamPatterns.urgencyTactics.length * 10;
    score += scamPatterns.financialRequests.length * 8;
    score += scamPatterns.impersonation.length * 15;
    score += scamPatterns.dataRequests.length * 12;

    // Intelligence contributions
    score += intelligence.phoneNumbers.length * 10;
    score += intelligence.upiIds.length * 15;
    score += intelligence.phishingLinks.length * 20;
    score += intelligence.bankAccounts.length * 10;

    return Math.min(score, 100);
  }

  mockOCR(imageFile) {
    const mockTexts = [
      "Dear Customer, Your SBI account has been blocked. Click here to verify: bit.ly/sbi-verify. Call: +91-9876543210",
      "URGENT: You have won Rs. 25,00,000 in lottery. Send your UPI ID winner@paytm to claim prize immediately.",
      "Your Amazon order #123456 is on hold. Verify payment: amazon-verify.suspicious.com Password: needed",
      "KYC Update Required - Your bank account will be suspended. Update now: kyc-bank.scam.com",
      "RBI Alert: Your account showing suspicious transactions. Share OTP 4532 to verify. Call: 9988776655",
    ];

    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];

    return {
      text: randomText,
      lines: randomText.split(". "),
      confidence: 0.9,
      note: "Demo mode: Configure Azure Vision API key for real OCR.",
    };
  }

  // ==================== UTILITY METHODS ====================

  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  isConfigured(service) {
    switch (service) {
      case "translator":
        return !!this.config.translatorKey;
      case "language":
        return !!this.config.languageKey;
      case "speech":
        return !!this.config.speechKey;
      case "vision":
        return !!this.config.visionKey;
      default:
        return false;
    }
  }

  getServiceStatus() {
    return {
      translator: this.isConfigured("translator") ? "configured" : "demo",
      language: this.isConfigured("language") ? "configured" : "demo",
      speech: this.isConfigured("speech") ? "configured" : "demo",
      vision: this.isConfigured("vision") ? "configured" : "demo",
    };
  }
}

// Export singleton instance
export const azureServices = new AzureServices();
export default azureServices;
