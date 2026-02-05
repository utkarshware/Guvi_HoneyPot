import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Chip,
  Paper,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  QuestionAnswer as QnAIcon,
  Code as CodeIcon,
  Api as ApiIcon,
  Security as SecurityIcon,
  Psychology as PsychologyIcon,
  CheckCircle as CheckIcon,
  ContentCopy as CopyIcon,
  Warning as WarningIcon,
  Lightbulb as TipIcon,
  Terminal as TerminalIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";

const QnA = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);

  const categories = [
    { label: "General", icon: <QnAIcon /> },
    { label: "API Integration", icon: <ApiIcon /> },
    { label: "AI Agent", icon: <PsychologyIcon /> },
    { label: "Code Examples", icon: <CodeIcon /> },
  ];

  const faqs = {
    general: [
      {
        question: "What is an Agentic Honey-Pot?",
        answer: `An Agentic Honey-Pot is an AI-powered system designed to detect scam intent and autonomously engage with scammers to extract useful intelligence without revealing detection. 

Unlike traditional honeypots that passively collect data, an agentic honeypot actively:
• Detects scam patterns in incoming messages
• Activates an AI agent when scams are detected
• Maintains believable human-like conversations
• Extracts actionable intelligence (phone numbers, UPI IDs, phishing links)
• Returns structured results for analysis`,
        tags: ["concept", "basics"],
      },
      {
        question: "What types of scams can this system detect?",
        answer: `The system is designed to detect various types of online scams including:

🏦 **Bank Fraud**: Fake notifications about blocked accounts, KYC updates
💳 **UPI Fraud**: Requests for UPI IDs, fake payment confirmations
🎣 **Phishing**: Malicious links disguised as legitimate websites
🎁 **Fake Offers**: Lottery wins, prize notifications, too-good-to-be-true deals
📱 **Impersonation**: Messages pretending to be from banks, government, or companies
⚡ **Urgency Scams**: Messages creating artificial urgency to bypass rational thinking`,
        tags: ["detection", "scam-types"],
      },
      {
        question: "How does the AI agent maintain a believable persona?",
        answer: `The AI agent uses several techniques to appear human-like:

1. **Natural Language**: Responds with casual, conversational language
2. **Appropriate Delays**: Doesn't respond instantly (seems more human)
3. **Asking Questions**: Seeks clarification like a real person would
4. **Showing Concern**: Expresses worry about account security
5. **Gradual Information**: Doesn't reveal everything at once
6. **Self-Correction**: Sometimes "misunderstands" and corrects itself

The goal is to keep scammers engaged long enough to extract intelligence without alerting them to detection.`,
        tags: ["ai-agent", "persona"],
      },
      {
        question: "What ethical guidelines does this system follow?",
        answer: `The system follows strict ethical guidelines:

✅ **Responsible Data Handling**: All extracted data is handled securely
✅ **No Real Harm**: System never actually shares real sensitive information
✅ **Privacy Protection**: User data is anonymized and protected

❌ **No Impersonation**: Never impersonates real individuals
❌ **No Illegal Instructions**: Never provides harmful or illegal guidance
❌ **No Harassment**: Engagement is for intelligence gathering only`,
        tags: ["ethics", "guidelines"],
      },
    ],
    api: [
      {
        question: "How do I authenticate API requests?",
        answer: `All API requests must include an API key in the headers:

\`\`\`
x-api-key: YOUR_SECRET_API_KEY
Content-Type: application/json
\`\`\`

Store your API key securely and never expose it in client-side code. Use environment variables in production.`,
        tags: ["authentication", "security"],
        code: `// Example headers
const headers = {
  'x-api-key': process.env.API_KEY,
  'Content-Type': 'application/json'
};`,
      },
      {
        question: "What is the API request format?",
        answer: `Each API request represents one incoming message in a conversation. Here's the structure:`,
        tags: ["request", "format"],
        code: `{
  "sessionId": "unique-session-id",
  "message": {
    "sender": "scammer",
    "text": "Your bank account will be blocked today.",
    "timestamp": 1770005528731
  },
  "conversationHistory": [],
  "metadata": {
    "channel": "SMS",
    "language": "English",
    "locale": "IN"
  }
}`,
      },
      {
        question: "What does the API response look like?",
        answer: `The API returns a structured JSON response with the agent's reply:`,
        tags: ["response", "format"],
        code: `{
  "status": "success",
  "reply": "Why is my account being suspended?",
  "scamDetected": true,
  "confidence": 0.95,
  "extractedIntelligence": {
    "bankAccounts": [],
    "upiIds": ["scammer@upi"],
    "phishingLinks": ["http://malicious-link.com"],
    "phoneNumbers": ["+91XXXXXXXXXX"],
    "suspiciousKeywords": ["urgent", "verify", "blocked"]
  }
}`,
      },
      {
        question: "How do I handle multi-turn conversations?",
        answer: `For follow-up messages, include the conversation history:`,
        tags: ["conversation", "multi-turn"],
        code: `{
  "sessionId": "same-session-id",
  "message": {
    "sender": "scammer",
    "text": "Share your UPI ID to avoid suspension.",
    "timestamp": 1770005528731
  },
  "conversationHistory": [
    {
      "sender": "scammer",
      "text": "Your bank account will be blocked today.",
      "timestamp": 1770005528731
    },
    {
      "sender": "user",
      "text": "Why will my account be blocked?",
      "timestamp": 1770005528731
    }
  ],
  "metadata": {
    "channel": "SMS",
    "language": "English",
    "locale": "IN"
  }
}`,
      },
      {
        question: "How do I submit the final result callback?",
        answer: `After completing the engagement, send extracted intelligence to the evaluation API endpoint:`,
        tags: ["callback", "evaluation", "mandatory"],
        code: `// Mandatory Final Result Callback
const payload = {
  "sessionId": "abc123-session-id",
  "scamDetected": true,
  "totalMessagesExchanged": 18,
  "extractedIntelligence": {
    "bankAccounts": ["XXXX-XXXX-XXXX"],
    "upiIds": ["scammer@upi"],
    "phishingLinks": ["http://malicious-link.example"],
    "phoneNumbers": ["+91XXXXXXXXXX"],
    "suspiciousKeywords": ["urgent", "verify now", "blocked"]
  },
  "agentNotes": "Scammer used urgency tactics and payment redirection"
};

// POST to /api/updateHoneyPotFinalResult
const response = await fetch(
  "/api/updateHoneyPotFinalResult",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }
);`,
      },
    ],
    agent: [
      {
        question: "What behaviors should the AI agent exhibit?",
        answer: `The AI Agent must:

🔄 **Handle Multi-turn Conversations**: Maintain context across multiple messages
🎭 **Adapt Dynamically**: Change responses based on scammer tactics
🙈 **Avoid Detection**: Never reveal that scam detection is active
👤 **Act Human**: Use natural language, occasional typos, thinking pauses
🔧 **Self-Correct**: Occasionally "misunderstand" and correct itself
📊 **Extract Intel**: Gather phone numbers, links, UPI IDs, accounts`,
        tags: ["behavior", "requirements"],
      },
      {
        question: "How should the agent respond to different scam types?",
        answer: `Different scam types require different engagement strategies:

**Bank Fraud:**
- Show concern about the account
- Ask for clarification about which account
- Request official verification methods

**UPI Fraud:**
- Express confusion about the request
- Ask why payment is needed
- Pretend to have technical difficulties

**Phishing:**
- Question the legitimacy of links
- Ask for official website instead
- Express hesitation about clicking

**Lottery/Prize Scams:**
- Show excitement initially
- Ask detailed questions about the prize
- Request official documentation`,
        tags: ["strategies", "scam-types"],
      },
      {
        question: "What intelligence should be extracted?",
        answer: `The agent should extract:

📱 **Phone Numbers**: Scammer contact numbers
💳 **Bank Accounts**: Any account numbers shared
📧 **UPI IDs**: Payment identifiers
🔗 **Phishing Links**: Malicious URLs
🏷️ **Keywords**: Urgency words, scam patterns
📝 **Tactics**: Methods used by the scammer`,
        tags: ["intelligence", "extraction"],
      },
    ],
    code: [
      {
        question: "Python implementation example",
        answer: `Here's a complete Python implementation for the API:`,
        tags: ["python", "implementation"],
        code: `import requests
import json
from typing import Dict, List, Optional

class HoneyPotAgent:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://your-api-endpoint.com"
        self.callback_url = "https://hackathon.guvi.in/api/updateHoneyPotFinalResult"
        
    def analyze_message(self, session_id: str, message: Dict, 
                        history: List[Dict] = None, metadata: Dict = None):
        """Analyze incoming message for scam detection"""
        payload = {
            "sessionId": session_id,
            "message": message,
            "conversationHistory": history or [],
            "metadata": metadata or {"channel": "SMS", "language": "English", "locale": "IN"}
        }
        
        response = requests.post(
            f"{self.base_url}/analyze",
            headers={
                "x-api-key": self.api_key,
                "Content-Type": "application/json"
            },
            json=payload
        )
        return response.json()
    
    def submit_final_result(self, session_id: str, scam_detected: bool,
                            total_messages: int, intelligence: Dict, notes: str):
        """Submit final intelligence to GUVI evaluation endpoint (MANDATORY)"""
        payload = {
            "sessionId": session_id,
            "scamDetected": scam_detected,
            "totalMessagesExchanged": total_messages,
            "extractedIntelligence": intelligence,
            "agentNotes": notes
        }
        
        response = requests.post(
            self.callback_url,
            json=payload,
            timeout=5
        )
        return response.json()

# Usage
agent = HoneyPotAgent(api_key="YOUR_API_KEY")

# Analyze first message
result = agent.analyze_message(
    session_id="session-123",
    message={
        "sender": "scammer",
        "text": "Your bank account will be blocked. Verify now!",
        "timestamp": 1770005528731
    }
)

print(f"Agent Reply: {result['reply']}")
print(f"Scam Detected: {result.get('scamDetected', False)}")`,
      },
      {
        question: "Node.js/JavaScript implementation example",
        answer: `Here's a Node.js implementation for the API:`,
        tags: ["nodejs", "javascript", "implementation"],
        code: `const axios = require('axios');

class HoneyPotAgent {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://your-api-endpoint.com';
    this.callbackUrl = 'https://hackathon.guvi.in/api/updateHoneyPotFinalResult';
  }

  async analyzeMessage(sessionId, message, history = [], metadata = {}) {
    const payload = {
      sessionId,
      message,
      conversationHistory: history,
      metadata: {
        channel: 'SMS',
        language: 'English',
        locale: 'IN',
        ...metadata
      }
    };

    const response = await axios.post(
      \`\${this.baseUrl}/analyze\`,
      payload,
      {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  async submitFinalResult(sessionId, scamDetected, totalMessages, intelligence, notes) {
    const payload = {
      sessionId,
      scamDetected,
      totalMessagesExchanged: totalMessages,
      extractedIntelligence: intelligence,
      agentNotes: notes
    };

    const response = await axios.post(this.callbackUrl, payload, {
      timeout: 5000
    });

    return response.data;
  }
}

// Usage
const agent = new HoneyPotAgent('YOUR_API_KEY');

(async () => {
  const result = await agent.analyzeMessage(
    'session-123',
    {
      sender: 'scammer',
      text: 'Your bank account will be blocked. Verify now!',
      timestamp: Date.now()
    }
  );

  console.log('Agent Reply:', result.reply);
  console.log('Scam Detected:', result.scamDetected);
})();`,
      },
      {
        question: "React frontend integration example",
        answer: `Here's how to integrate the API in a React application:`,
        tags: ["react", "frontend", "implementation"],
        code: `import { useState } from 'react';

const useHoneyPotAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyzeMessage = async (sessionId, message, history = []) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: {
            sender: 'scammer',
            text: message,
            timestamp: Date.now(),
          },
          conversationHistory: history,
          metadata: {
            channel: 'Web',
            language: 'English',
            locale: 'IN',
          },
        }),
      });

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeMessage, loading, result, error };
};

// Component usage
function ScamAnalyzer() {
  const { analyzeMessage, loading, result } = useHoneyPotAnalyzer();
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await analyzeMessage('session-' + Date.now(), message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter suspicious message..."
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      {result && (
        <div>
          <p>Status: {result.status}</p>
          <p>Reply: {result.reply}</p>
        </div>
      )}
    </form>
  );
}`,
      },
    ],
  };

  const getCategoryFaqs = () => {
    switch (activeCategory) {
      case 0:
        return faqs.general;
      case 1:
        return faqs.api;
      case 2:
        return faqs.agent;
      case 3:
        return faqs.code;
      default:
        return faqs.general;
    }
  };

  const filteredFaqs = getCategoryFaqs().filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const copyToClipboard = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ pb: 8 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            <QnAIcon
              sx={{ mr: 2, verticalAlign: "middle", color: "primary.main" }}
            />
            Honey Trap QnA
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Everything you need to know about the Agentic Honey-Pot system, API
            integration, and scam detection techniques.
          </Typography>
        </Box>

        {/* Search */}
        <GlassCard sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search questions, topics, or code examples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                background: "rgba(255, 255, 255, 0.03)",
              },
            }}
          />
        </GlassCard>

        {/* Category Tabs */}
        <Paper
          sx={{
            mb: 4,
            background: "rgba(26, 26, 46, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 3,
          }}
        >
          <Tabs
            value={activeCategory}
            onChange={(e, v) => setActiveCategory(v)}
            variant="fullWidth"
          >
            {categories.map((cat, index) => (
              <Tab
                key={index}
                icon={cat.icon}
                label={cat.label}
                iconPosition="start"
                sx={{
                  minHeight: 64,
                  "&.Mui-selected": {
                    color: "primary.main",
                  },
                }}
              />
            ))}
          </Tabs>
        </Paper>

        <Grid container spacing={4}>
          {/* FAQ Section */}
          <Grid item xs={12} md={8}>
            {filteredFaqs.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Accordion
                      sx={{
                        background:
                          "linear-gradient(145deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "16px !important",
                        "&:before": { display: "none" },
                        "&.Mui-expanded": {
                          margin: 0,
                          border: "1px solid rgba(255, 107, 53, 0.3)",
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <ExpandMoreIcon sx={{ color: "primary.main" }} />
                        }
                        sx={{
                          "& .MuiAccordionSummary-content": {
                            flexDirection: "column",
                          },
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          {faq.question}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {faq.tags?.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{
                                background: "rgba(255, 107, 53, 0.15)",
                                border: "1px solid rgba(255, 107, 53, 0.3)",
                                fontSize: "0.7rem",
                              }}
                            />
                          ))}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: "pre-line",
                            color: "text.secondary",
                            lineHeight: 1.8,
                          }}
                        >
                          {faq.answer}
                        </Typography>

                        {/* Code Block */}
                        {faq.code && (
                          <Box sx={{ mt: 3 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <TerminalIcon
                                  fontSize="small"
                                  color="primary"
                                />
                                <Typography variant="subtitle2" color="primary">
                                  Code Example
                                </Typography>
                              </Box>
                              <Tooltip
                                title={
                                  copiedCode === index ? "Copied!" : "Copy code"
                                }
                              >
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    copyToClipboard(faq.code, index)
                                  }
                                  sx={{
                                    color:
                                      copiedCode === index
                                        ? "success.main"
                                        : "text.secondary",
                                  }}
                                >
                                  {copiedCode === index ? (
                                    <CheckIcon fontSize="small" />
                                  ) : (
                                    <CopyIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </Box>
                            <Paper
                              sx={{
                                p: 2,
                                background: "#0d1117",
                                borderRadius: 2,
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                overflow: "auto",
                              }}
                            >
                              <Typography
                                component="pre"
                                sx={{
                                  fontFamily:
                                    '"Fira Code", "Monaco", monospace',
                                  fontSize: "0.8rem",
                                  lineHeight: 1.6,
                                  color: "#e6edf3",
                                  margin: 0,
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                }}
                              >
                                {faq.code}
                              </Typography>
                            </Paper>
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </motion.div>
                ))}
              </Box>
            ) : (
              <GlassCard hover={false}>
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <SearchIcon
                    sx={{
                      fontSize: 60,
                      color: "text.secondary",
                      mb: 2,
                      opacity: 0.5,
                    }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    No Results Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try different search terms or browse categories
                  </Typography>
                </Box>
              </GlassCard>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Quick Tips */}
            <GlassCard sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <TipIcon color="secondary" />
                Quick Tips
              </Typography>
              <List dense>
                {[
                  "Always validate sessionId consistency",
                  "Include conversation history for multi-turn",
                  "Handle API timeouts gracefully",
                  "Submit final callback for evaluation",
                  "Extract all available intelligence",
                ].map((tip, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={tip}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                ))}
              </List>
            </GlassCard>

            {/* Evaluation Criteria */}
            <GlassCard sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <SecurityIcon color="primary" />
                Evaluation Criteria
              </Typography>
              <List dense>
                {[
                  { label: "Scam Detection Accuracy", value: "30%" },
                  { label: "Agentic Engagement Quality", value: "25%" },
                  { label: "Intelligence Extraction", value: "20%" },
                  { label: "API Stability & Response", value: "15%" },
                  { label: "Ethical Behavior", value: "10%" },
                ].map((criteria, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemText
                      primary={criteria.label}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                    <Chip
                      label={criteria.value}
                      size="small"
                      sx={{
                        background: "rgba(255, 107, 53, 0.15)",
                        border: "1px solid rgba(255, 107, 53, 0.3)",
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </GlassCard>

            {/* Important Notice */}
            <Alert
              severity="warning"
              icon={<WarningIcon />}
              sx={{
                background: "rgba(255, 165, 2, 0.1)",
                border: "1px solid rgba(255, 165, 2, 0.3)",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Mandatory Callback
              </Typography>
              <Typography variant="body2">
                <strong>Remember:</strong> Submit the final result to GUVI's
                evaluation endpoint at{" "}
                <code>
                  https://hackathon.guvi.in/api/updateHoneyPotFinalResult
                </code>
                . Without this callback, your solution cannot be evaluated for
                scoring.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default QnA;
