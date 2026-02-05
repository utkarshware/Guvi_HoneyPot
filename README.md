# 🛡️ HoneyGuard - AI-Powered Scam Detection System

**HoneyGuard** is an agentic honeypot scam detection application built for the **GUVI India AI Buildathon 2026**. It uses Microsoft Azure Cognitive Services to detect, analyze, and extract intelligence from scam attempts.

## 🌟 Features

### 🎙️ Audio Analysis
- **Voice Transcription**: Convert audio files to text using Azure Speech Services
- **Multi-language Support**: 17+ languages including Hindi, Tamil, Telugu, Bengali
- **Real-time Scam Detection**: Analyze transcribed text for scam patterns
- **Risk Scoring**: Get confidence scores for fraud likelihood

### 📸 Screenshot Analysis
- **OCR Text Extraction**: Extract text from images using Azure Computer Vision
- **Pattern Recognition**: Detect phishing links, UPI IDs, phone numbers
- **Intelligent Filtering**: Whitelist for legitimate domains (Lenskart, Amazon, WhatsApp, etc.)
- **Sentiment Analysis**: Understand the emotional context of messages

### ❓ Fraud Q&A
- **Interactive Assessment**: Answer questions about suspicious communications
- **AI-powered Guidance**: Get personalized recommendations
- **Educational Resources**: Learn to identify common scam tactics

### 📊 Session Dashboard
- **Track Analyses**: View history of all scam detection sessions
- **GUVI Integration**: Submit session data for evaluation
- **Export Reports**: Download detailed analysis reports

## 🔧 Tech Stack

- **Frontend**: React 18 + Vite
- **UI Framework**: Material UI 6
- **Animations**: Framer Motion
- **Cloud Services**: Microsoft Azure Cognitive Services
  - Azure Translator (17+ languages)
  - Azure Speech Services (audio transcription)
  - Azure Computer Vision (OCR)
  - Azure Language Service (text analytics)
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Azure Cognitive Services subscription

### Installation

```bash
# Clone the repository
git clone https://github.com/utkarshware/Guvi_HoneyPot.git
cd Guvi_HoneyPot

# Install dependencies
npm install

# Create .env file with Azure credentials
cp .env.example .env
# Edit .env with your Azure keys

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_AZURE_KEY=your_azure_key
VITE_AZURE_REGION=eastus
VITE_AZURE_ENDPOINT=https://eastus.api.cognitive.microsoft.com
VITE_AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com
VITE_AZURE_LANGUAGE_ENDPOINT=https://eastus.api.cognitive.microsoft.com
VITE_AZURE_VISION_ENDPOINT=https://eastus.api.cognitive.microsoft.com
```

## 📡 API Endpoints

### Honeypot API
```
POST https://buildathon-honeyguard.vercel.app/api/honeypot
Header: x-api-key: <your-api-key>
```

### Voice Detection API
```
POST https://buildathon-honeyguard.vercel.app/api/voice-detection
Header: x-api-key: <your-api-key>
```

#### Request Body
```json
{
  "text": "Your transcribed text or suspicious message",
  "language": "en-IN"
}
```

#### Response
```json
{
  "success": true,
  "analysis": {
    "isScam": true,
    "confidence": 85.5,
    "riskLevel": "High",
    "riskScore": 72,
    "sentiment": "negative",
    "patterns": {
      "urgencyTactics": ["immediately", "blocked"],
      "financialRequests": ["bank", "account"],
      "impersonation": ["customer care"],
      "dataRequests": ["otp", "verify"]
    },
    "extractedIntelligence": {
      "phoneNumbers": [],
      "upiIds": [],
      "links": []
    },
    "recommendations": [
      "HIGH RISK: This is very likely a SCAM",
      "Do NOT share any OTPs or banking details"
    ]
  }
}
```

## 🎯 Scam Detection Patterns

HoneyGuard detects the following scam patterns:

| Category | Examples |
|----------|----------|
| **Urgency Tactics** | urgent, immediately, blocked, expires |
| **Financial Requests** | bank, account, UPI, transfer, lottery |
| **Impersonation** | customer care, RBI, SBI, police |
| **Data Requests** | OTP, password, PIN, CVV, KYC |

## 🔒 Security Features

- **API Key Authentication**: All API endpoints require valid API keys
- **CORS Protection**: Cross-origin request handling
- **Environment Variables**: Sensitive keys stored securely
- **Legitimate Domain Whitelist**: Reduces false positives for trusted brands

## 📱 Demo Credentials

```
Email: demo@honeyguard.ai
Password: HoneyGuard2026!
```

## 🏆 GUVI India AI Buildathon 2026

This project was built for the GUVI India AI Buildathon, showcasing:
- Integration with Azure Cognitive Services
- Real-world scam detection capabilities
- Multi-language support for Indian languages
- Agentic AI concepts for fraud prevention

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 👥 Team

Built with ❤️ by the HoneyGuard Team

---

**Live Demo**: [https://buildathon-honeyguard.vercel.app](https://buildathon-honeyguard.vercel.app)
