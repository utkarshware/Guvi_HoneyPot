import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Chip,
  Snackbar,
} from "@mui/material";
import {
  QuestionAnswer as QnAIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Shield as ShieldIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Refresh as RestartIcon,
  Psychology as PsychologyIcon,
  Phone as PhoneIcon,
  Sms as SmsIcon,
  Email as EmailIcon,
  Language as WebIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { styled } from "@mui/material/styles";
import { useSession } from "../context/SessionContext";

// 100 HoneyPot-Specific Fraud Detection Questions (India-focused)
const FRAUD_QUESTIONS = [
  // Phone Call Scams (1-20)
  {
    id: 1,
    question:
      "Did you receive an unexpected phone call claiming to be from your bank?",
    weight: 4,
    category: "phone",
  },
  {
    id: 2,
    question:
      "Did the caller ask you to press buttons on your phone (IVR scam)?",
    weight: 4,
    category: "phone",
  },
  {
    id: 3,
    question: "Did someone call claiming your account/card has been blocked?",
    weight: 5,
    category: "phone",
  },
  {
    id: 4,
    question: "Did the caller claim to be from RBI, Income Tax, or Police?",
    weight: 5,
    category: "phone",
  },
  {
    id: 5,
    question:
      "Did they ask you to download any app like AnyDesk, TeamViewer, or QuickSupport?",
    weight: 5,
    category: "phone",
  },
  {
    id: 6,
    question:
      "Did the caller threaten arrest or legal action if you don't comply?",
    weight: 5,
    category: "phone",
  },
  {
    id: 7,
    question: "Did they ask you to stay on the line and not call anyone else?",
    weight: 5,
    category: "phone",
  },
  {
    id: 8,
    question:
      "Did the caller know some of your personal details (partial info scam)?",
    weight: 3,
    category: "phone",
  },
  {
    id: 9,
    question: "Did they ask you to transfer money to a 'safe account'?",
    weight: 5,
    category: "phone",
  },
  {
    id: 10,
    question:
      "Did someone call about a parcel stuck at customs requiring payment?",
    weight: 5,
    category: "phone",
  },
  {
    id: 11,
    question:
      "Did a 'customer care' representative ask for your card CVV number?",
    weight: 5,
    category: "phone",
  },
  {
    id: 12,
    question:
      "Did the caller claim you're eligible for a refund but need to pay processing fee?",
    weight: 5,
    category: "phone",
  },
  {
    id: 13,
    question:
      "Did someone offer you a loan/credit card without checking your credit score?",
    weight: 4,
    category: "phone",
  },
  {
    id: 14,
    question:
      "Did the caller refuse to give you time to verify their identity?",
    weight: 4,
    category: "phone",
  },
  {
    id: 15,
    question:
      "Did they call from a mobile number claiming to be from a company/bank?",
    weight: 3,
    category: "phone",
  },
  {
    id: 16,
    question:
      "Did someone claim your Aadhaar/PAN is linked to suspicious activities?",
    weight: 5,
    category: "phone",
  },
  {
    id: 17,
    question:
      "Did the caller ask you to share OTP for 'verification purposes'?",
    weight: 5,
    category: "phone",
  },
  {
    id: 18,
    question:
      "Did they claim your electricity/phone bill payment failed and service will stop?",
    weight: 4,
    category: "phone",
  },
  {
    id: 19,
    question:
      "Did someone offer you a job requiring you to pay registration fee?",
    weight: 5,
    category: "phone",
  },
  {
    id: 20,
    question:
      "Did a caller claim to be tech support saying your computer has virus?",
    weight: 5,
    category: "phone",
  },

  // SMS/WhatsApp Scams (21-40)
  {
    id: 21,
    question:
      "Did you receive an SMS with a link claiming account verification needed?",
    weight: 5,
    category: "sms",
  },
  {
    id: 22,
    question:
      "Did the message contain a shortened/suspicious link (bit.ly, etc.)?",
    weight: 4,
    category: "sms",
  },
  {
    id: 23,
    question:
      "Did you get a message saying you won a lottery/prize you didn't enter?",
    weight: 5,
    category: "sms",
  },
  {
    id: 24,
    question: "Did an SMS claim your KYC needs immediate update?",
    weight: 5,
    category: "sms",
  },
  {
    id: 25,
    question: "Did you receive a message about a UPI payment you didn't make?",
    weight: 4,
    category: "sms",
  },
  {
    id: 26,
    question: "Did someone send you a QR code to 'receive' money?",
    weight: 5,
    category: "sms",
  },
  {
    id: 27,
    question:
      "Did the message create urgency (expires in 24 hours, act now, etc.)?",
    weight: 4,
    category: "sms",
  },
  {
    id: 28,
    question:
      "Did you get an SMS about cashback/reward requiring you to click a link?",
    weight: 4,
    category: "sms",
  },
  {
    id: 29,
    question:
      "Did someone send you a 'payment request' on UPI you weren't expecting?",
    weight: 4,
    category: "sms",
  },
  {
    id: 30,
    question: "Did the message have spelling mistakes or unusual formatting?",
    weight: 3,
    category: "sms",
  },
  {
    id: 31,
    question:
      "Did you receive a WhatsApp message from unknown number claiming to be family?",
    weight: 4,
    category: "sms",
  },
  {
    id: 32,
    question:
      "Did someone on WhatsApp ask for money claiming to be in emergency?",
    weight: 5,
    category: "sms",
  },
  {
    id: 33,
    question: "Did you get a message about suspicious login to your account?",
    weight: 4,
    category: "sms",
  },
  {
    id: 34,
    question:
      "Did the SMS come from a random mobile number instead of company sender ID?",
    weight: 3,
    category: "sms",
  },
  {
    id: 35,
    question:
      "Did someone share an APK file or ask you to install an app via link?",
    weight: 5,
    category: "sms",
  },
  {
    id: 36,
    question: "Did you receive OTP without requesting any transaction?",
    weight: 4,
    category: "sms",
  },
  {
    id: 37,
    question: "Did someone claim to be delivering a package and need payment?",
    weight: 4,
    category: "sms",
  },
  {
    id: 38,
    question: "Did the message ask you to call a number for 'verification'?",
    weight: 4,
    category: "sms",
  },
  {
    id: 39,
    question: "Did you get a fake bank SMS asking to update PAN/Aadhaar?",
    weight: 5,
    category: "sms",
  },
  {
    id: 40,
    question:
      "Did someone send you a Google Pay/PhonePe request instead of payment?",
    weight: 5,
    category: "sms",
  },

  // Email/Phishing Scams (41-60)
  {
    id: 41,
    question:
      "Did you receive an email claiming your account will be suspended?",
    weight: 5,
    category: "email",
  },
  {
    id: 42,
    question:
      "Does the email sender address look suspicious (misspelled domain)?",
    weight: 4,
    category: "email",
  },
  {
    id: 43,
    question: "Did the email contain an attachment you weren't expecting?",
    weight: 4,
    category: "email",
  },
  {
    id: 44,
    question: "Did the email ask you to login through a link in the email?",
    weight: 4,
    category: "email",
  },
  {
    id: 45,
    question:
      "Did you receive a job offer email from a company you didn't apply to?",
    weight: 4,
    category: "email",
  },
  {
    id: 46,
    question: "Did the email claim you inherited money from unknown relative?",
    weight: 5,
    category: "email",
  },
  {
    id: 47,
    question:
      "Did someone email claiming to be Nigerian prince or foreign official?",
    weight: 5,
    category: "email",
  },
  {
    id: 48,
    question:
      "Did the email have poor grammar or generic greeting like 'Dear Sir/Madam'?",
    weight: 3,
    category: "email",
  },
  {
    id: 49,
    question:
      "Did the email ask for sensitive information like password or bank details?",
    weight: 5,
    category: "email",
  },
  {
    id: 50,
    question: "Did you get a fake invoice or payment receipt email?",
    weight: 4,
    category: "email",
  },
  {
    id: 51,
    question: "Did the email threaten account deletion if you don't verify?",
    weight: 5,
    category: "email",
  },
  {
    id: 52,
    question:
      "Did someone offer cryptocurrency/investment opportunity via email?",
    weight: 4,
    category: "email",
  },
  {
    id: 53,
    question:
      "Did the email logo look slightly different from official company logo?",
    weight: 3,
    category: "email",
  },
  {
    id: 54,
    question:
      "Did you receive an email about tax refund requiring immediate action?",
    weight: 5,
    category: "email",
  },
  {
    id: 55,
    question:
      "Did the email link redirect to a different website than expected?",
    weight: 5,
    category: "email",
  },
  {
    id: 56,
    question: "Did someone claim to have compromising photos/videos of you?",
    weight: 5,
    category: "email",
  },
  {
    id: 57,
    question: "Did the email ask you to enable macros or disable security?",
    weight: 5,
    category: "email",
  },
  {
    id: 58,
    question: "Did you get an email about order/delivery you didn't place?",
    weight: 4,
    category: "email",
  },
  {
    id: 59,
    question: "Did the email create fake urgency with countdown timers?",
    weight: 4,
    category: "email",
  },
  {
    id: 60,
    question:
      "Did the email come from a free email service (gmail/yahoo) claiming to be a business?",
    weight: 4,
    category: "email",
  },

  // Online/Website Scams (61-80)
  {
    id: 61,
    question: "Did you find a deal online that seems too good to be true?",
    weight: 4,
    category: "web",
  },
  {
    id: 62,
    question: "Does the website lack HTTPS (secure connection)?",
    weight: 4,
    category: "web",
  },
  {
    id: 63,
    question:
      "Did the website ask for payment via gift cards or cryptocurrency?",
    weight: 5,
    category: "web",
  },
  {
    id: 64,
    question:
      "Did a popup claim your computer is infected and to call a number?",
    weight: 5,
    category: "web",
  },
  {
    id: 65,
    question: "Did someone on matrimonial/dating site ask for money?",
    weight: 5,
    category: "web",
  },
  {
    id: 66,
    question:
      "Did you find an online seller asking for advance payment with no reviews?",
    weight: 4,
    category: "web",
  },
  {
    id: 67,
    question:
      "Did someone offer work-from-home job requiring initial investment?",
    weight: 5,
    category: "web",
  },
  {
    id: 68,
    question: "Did the website URL have misspellings of famous brands?",
    weight: 5,
    category: "web",
  },
  {
    id: 69,
    question: "Did you encounter fake customer care numbers on Google search?",
    weight: 4,
    category: "web",
  },
  {
    id: 70,
    question:
      "Did someone offer guaranteed returns on trading/crypto platform?",
    weight: 5,
    category: "web",
  },
  {
    id: 71,
    question:
      "Did you find a rental property requiring advance without site visit?",
    weight: 5,
    category: "web",
  },
  {
    id: 72,
    question: "Did the website have only positive reviews that look fake?",
    weight: 3,
    category: "web",
  },
  {
    id: 73,
    question:
      "Did someone offer to help with visa/immigration for upfront fee?",
    weight: 4,
    category: "web",
  },
  {
    id: 74,
    question: "Did you encounter a survey promising expensive rewards?",
    weight: 4,
    category: "web",
  },
  {
    id: 75,
    question: "Did the website lack contact information or physical address?",
    weight: 4,
    category: "web",
  },
  {
    id: 76,
    question:
      "Did someone sell products at prices significantly below market rate?",
    weight: 4,
    category: "web",
  },
  {
    id: 77,
    question:
      "Did you find a charity website after disaster asking for crypto donations?",
    weight: 4,
    category: "web",
  },
  {
    id: 78,
    question: "Did someone offer exam answers/certificates for sale online?",
    weight: 4,
    category: "web",
  },
  {
    id: 79,
    question:
      "Did the website payment page look different from the rest of the site?",
    weight: 5,
    category: "web",
  },
  {
    id: 80,
    question:
      "Did you encounter a fake government scheme website (PM schemes, etc.)?",
    weight: 5,
    category: "web",
  },

  // Verification Check Questions (81-100) - Negative weight means 'Yes' is GOOD
  {
    id: 81,
    question:
      "Did you independently verify the organization through official website?",
    weight: -4,
    category: "verify",
  },
  {
    id: 82,
    question:
      "Did you call the bank/company on the number from their official website/card?",
    weight: -4,
    category: "verify",
  },
  {
    id: 83,
    question: "Did you take time to research before making any decision?",
    weight: -3,
    category: "verify",
  },
  {
    id: 84,
    question: "Did you consult with family members or friends about this?",
    weight: -3,
    category: "verify",
  },
  {
    id: 85,
    question:
      "Did you verify the sender's email domain matches the official one?",
    weight: -3,
    category: "verify",
  },
  {
    id: 86,
    question:
      "Did you check if the website has proper security certificate (padlock)?",
    weight: -3,
    category: "verify",
  },
  {
    id: 87,
    question:
      "Did you search for reviews or complaints about this company/offer?",
    weight: -3,
    category: "verify",
  },
  {
    id: 88,
    question:
      "Did the organization give you adequate time to think and verify?",
    weight: -4,
    category: "verify",
  },
  {
    id: 89,
    question:
      "Did you verify the person's identity through video call or in-person?",
    weight: -4,
    category: "verify",
  },
  {
    id: 90,
    question: "Did you check cybercrime portal for similar scam reports?",
    weight: -3,
    category: "verify",
  },
  {
    id: 91,
    question:
      "Did you use official app from Play Store/App Store instead of downloaded APK?",
    weight: -4,
    category: "verify",
  },
  {
    id: 92,
    question:
      "Did you type the website URL directly instead of clicking email links?",
    weight: -3,
    category: "verify",
  },
  {
    id: 93,
    question: "Did you verify UPI ID belongs to the intended recipient?",
    weight: -3,
    category: "verify",
  },
  {
    id: 94,
    question:
      "Did you confirm the job offer through the company's official HR?",
    weight: -4,
    category: "verify",
  },
  {
    id: 95,
    question: "Did you refuse to share OTP/password despite pressure?",
    weight: -5,
    category: "verify",
  },
  {
    id: 96,
    question: "Did you end the call when asked to download remote access apps?",
    weight: -5,
    category: "verify",
  },
  {
    id: 97,
    question: "Did you verify prize/lottery claims through official sources?",
    weight: -4,
    category: "verify",
  },
  {
    id: 98,
    question:
      "Did you report the suspicious contact to appropriate authorities?",
    weight: -3,
    category: "verify",
  },
  {
    id: 99,
    question:
      "Did you check if similar scam is listed on bank's official scam alert page?",
    weight: -3,
    category: "verify",
  },
  {
    id: 100,
    question: "Did you enable two-factor authentication on your accounts?",
    weight: -3,
    category: "verify",
  },
];

// Styled Components
const GlassCard = styled(Paper)(({ theme, glow }) => ({
  background:
    "linear-gradient(145deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)",
  backdropFilter: "blur(20px)",
  border: `1px solid ${glow ? "rgba(255, 107, 53, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
  borderRadius: 16,
  padding: theme.spacing(3),
  boxShadow: glow
    ? "0 0 40px rgba(255, 107, 53, 0.15)"
    : "0 8px 32px rgba(0, 0, 0, 0.3)",
}));

const AnimatedButton = styled(motion.button)(({ theme, variant }) => ({
  background:
    variant === "secondary"
      ? "transparent"
      : "linear-gradient(135deg, #FF6B35 0%, #F7C815 100%)",
  border:
    variant === "secondary" ? "2px solid rgba(255, 107, 53, 0.5)" : "none",
  borderRadius: 12,
  padding: "12px 24px",
  color: "white",
  fontSize: "1rem",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow:
      variant === "secondary" ? "none" : "0 10px 30px rgba(255, 107, 53, 0.4)",
  },
  "&:disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
    transform: "none",
  },
}));

const QuestionCard = styled(Paper)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: 12,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
}));

const FraudQuestionnaire = () => {
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Session management hooks
  const {
    startSession,
    updateCurrentSession,
    recordScamDetection,
    submitCurrentSession,
  } = useSession();

  const QUESTIONS_TO_ASK = 25;

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case "phone":
        return <PhoneIcon fontSize="small" />;
      case "sms":
        return <SmsIcon fontSize="small" />;
      case "email":
        return <EmailIcon fontSize="small" />;
      case "web":
        return <WebIcon fontSize="small" />;
      case "verify":
        return <ShieldIcon fontSize="small" />;
      default:
        return <QnAIcon fontSize="small" />;
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case "phone":
        return "Phone Scam";
      case "sms":
        return "SMS/WhatsApp Scam";
      case "email":
        return "Email/Phishing";
      case "web":
        return "Online Scam";
      case "verify":
        return "Verification";
      default:
        return "General";
    }
  };

  // Select questions ensuring mix from all categories
  const startQuestionnaire = () => {
    const categories = ["phone", "sms", "email", "web", "verify"];
    const selected = [];

    // Get questions from each category (5 from each = 25 total)
    categories.forEach((cat) => {
      const catQuestions = FRAUD_QUESTIONS.filter((q) => q.category === cat);
      const shuffled = catQuestions.sort(() => Math.random() - 0.5);
      selected.push(...shuffled.slice(0, 5));
    });

    // Shuffle final selection
    const finalSelection = selected.sort(() => Math.random() - 0.5);

    setSelectedQuestions(finalSelection);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setCompleted(false);
    setResult(null);
    setStarted(true);
  };

  const handleAnswer = (value) => {
    const questionId = selectedQuestions[currentQuestionIndex].id;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const goToNext = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      calculateResult();
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const calculateResult = () => {
    let totalScore = 0;
    let maxPossibleScore = 0;
    let yesCount = 0;
    let noCount = 0;
    let maybeCount = 0;
    const categoryScores = {};
    const redFlags = [];

    selectedQuestions.forEach((q) => {
      const answer = answers[q.id];
      const absWeight = Math.abs(q.weight);
      maxPossibleScore += absWeight;

      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { score: 0, max: 0, flags: [] };
      }
      categoryScores[q.category].max += absWeight;

      if (answer === "yes") {
        yesCount++;
        if (q.weight > 0) {
          // Positive weight = scam indicator, yes is bad
          totalScore += q.weight;
          categoryScores[q.category].score += q.weight;
          if (q.weight >= 4) {
            redFlags.push({ question: q.question, category: q.category });
          }
        }
        // Negative weight = verification, yes is good (no score added)
      } else if (answer === "no") {
        noCount++;
        if (q.weight < 0) {
          // For verification questions, "no" means didn't verify = risky
          totalScore += Math.abs(q.weight);
          categoryScores[q.category].score += Math.abs(q.weight);
        }
      } else if (answer === "maybe") {
        maybeCount++;
        if (q.weight > 0) {
          totalScore += q.weight * 0.5;
          categoryScores[q.category].score += q.weight * 0.5;
        } else {
          totalScore += Math.abs(q.weight) * 0.3;
        }
      }
    });

    // Calculate risk percentage
    const riskPercentage = Math.min(
      100,
      Math.max(0, Math.round((totalScore / maxPossibleScore) * 100)),
    );

    // Determine risk level and verdict
    let riskLevel, verdict, description;
    if (riskPercentage >= 70) {
      riskLevel = "High";
      verdict = "🚨 HIGH RISK - This is very likely a SCAM!";
      description =
        "Multiple strong indicators of fraud detected. Do NOT proceed with any requests.";
    } else if (riskPercentage >= 45) {
      riskLevel = "Medium";
      verdict = "⚠️ MEDIUM RISK - Exercise extreme caution!";
      description =
        "Several suspicious elements detected. Verify thoroughly before taking any action.";
    } else if (riskPercentage >= 25) {
      riskLevel = "Low";
      verdict = "🟡 LOW RISK - Some suspicious signs present.";
      description =
        "Minor red flags detected. Proceed carefully and verify if unsure.";
    } else {
      riskLevel = "Minimal";
      verdict = "✅ MINIMAL RISK - Appears relatively safe.";
      description = "Few or no scam indicators found. Still remain vigilant.";
    }

    // Generate recommendations based on category scores
    const recommendations = [];

    if (riskPercentage >= 45) {
      recommendations.push(
        "🚫 Do NOT send any money, gift cards, or cryptocurrency.",
      );
      recommendations.push(
        "🚫 Do NOT share OTP, PIN, CVV, or passwords with anyone.",
      );
      recommendations.push(
        "📞 Call 1930 (India Cyber Crime Helpline) to report.",
      );
      recommendations.push("🌐 File complaint at cybercrime.gov.in");
    }

    if (categoryScores.phone?.score > 10) {
      recommendations.push(
        "📵 Legitimate banks NEVER call asking for OTP or remote access.",
      );
    }
    if (categoryScores.sms?.score > 10) {
      recommendations.push(
        "🔗 Never click links in SMS. Type URLs directly in browser.",
      );
    }
    if (categoryScores.email?.score > 10) {
      recommendations.push(
        "📧 Check sender's actual email domain, not just display name.",
      );
    }
    if (categoryScores.web?.score > 10) {
      recommendations.push(
        "🔒 Only use official apps from Play Store/App Store.",
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ Continue practicing safe online habits.");
      recommendations.push(
        "🔐 Enable 2-factor authentication on all accounts.",
      );
      recommendations.push("📚 Stay updated on new scam techniques.");
    }

    const finalResult = {
      riskPercentage,
      riskLevel,
      verdict,
      description,
      redFlags,
      recommendations,
      stats: { yesCount, noCount, maybeCount },
      categoryScores,
    };

    setResult(finalResult);
    setCompleted(true);

    // Start session and record results for GUVI callback
    const isScam = riskPercentage >= 45;
    const sessionId = startSession("questionnaire");

    // Build suspicious keywords from red flags and category results
    const suspiciousKeywords = redFlags
      .map((f) => f.question.split(" ").slice(0, 4).join(" "))
      .slice(0, 10);

    // Update session with questionnaire results
    updateCurrentSession({
      totalMessagesExchanged: selectedQuestions.length, // Number of Q&A interactions
      extractedIntelligence: {
        bankAccounts: [],
        upiIds: [],
        phishingLinks: [],
        phoneNumbers: [],
        suspiciousKeywords,
      },
      agentNotes: `Questionnaire Analysis: Risk Level ${riskLevel} (${riskPercentage}%). ${redFlags.length} red flags detected. Categories: Phone=${categoryScores.phone?.score || 0}, SMS=${categoryScores.sms?.score || 0}, Email=${categoryScores.email?.score || 0}, Web=${categoryScores.web?.score || 0}. Responses: ${yesCount} Yes, ${noCount} No, ${maybeCount} Maybe.`,
    });

    // Record scam detection result
    recordScamDetection(isScam);

    setSnackbar({
      open: true,
      message: `Assessment complete! Session ${sessionId.slice(0, 8)}... created for GUVI submission.`,
      severity: isScam ? "warning" : "success",
    });
  };

  const restartQuestionnaire = () => {
    setStarted(false);
    setCompleted(false);
    setResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  // Submit current session to GUVI callback endpoint
  const handleSubmitToGuvi = async () => {
    try {
      const submitResult = await submitCurrentSession();
      if (submitResult.success) {
        setSnackbar({
          open: true,
          message: `Successfully submitted to GUVI! Session: ${submitResult.sessionId?.slice(0, 8)}...`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: `Submission failed: ${submitResult.error}`,
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error submitting to GUVI: ${err.message}`,
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "High":
        return "#ff4757";
      case "Medium":
        return "#ffa502";
      case "Low":
        return "#f7c815";
      case "Minimal":
        return "#2ed573";
      default:
        return "#70a1ff";
    }
  };

  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const progress =
    selectedQuestions.length > 0
      ? ((currentQuestionIndex + 1) / selectedQuestions.length) * 100
      : 0;

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              p: 2,
              borderRadius: 3,
              background: "rgba(255, 107, 53, 0.1)",
            }}
          >
            <ShieldIcon sx={{ fontSize: 40, color: "primary.main" }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              HoneyPot Scam Detector
            </Typography>
          </Box>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Answer {QUESTIONS_TO_ASK} questions about suspicious calls,
            messages, or online interactions. Our AI will assess the fraud risk
            based on common scam patterns in India.
          </Typography>
        </motion.div>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8}>
          <AnimatePresence mode="wait">
            {!started ? (
              /* Start Screen */
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassCard glow>
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <ShieldIcon
                      sx={{ fontSize: 80, color: "primary.main", mb: 3 }}
                    />
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                      Suspicious Contact? Let's Check!
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 4, maxWidth: 500, mx: "auto" }}
                    >
                      Answer questions about any suspicious call, message,
                      email, or website you encountered. We'll analyze it
                      against 100+ known scam patterns.
                    </Typography>

                    <Grid
                      container
                      spacing={2}
                      sx={{ mb: 4, maxWidth: 600, mx: "auto" }}
                    >
                      {[
                        {
                          label: "Phone Call Scams",
                          icon: <PhoneIcon />,
                          desc: "Fake bank calls, tech support",
                        },
                        {
                          label: "SMS/WhatsApp Scams",
                          icon: <SmsIcon />,
                          desc: "KYC fraud, lottery scams",
                        },
                        {
                          label: "Email Phishing",
                          icon: <EmailIcon />,
                          desc: "Account suspension, fake invoices",
                        },
                        {
                          label: "Online Scams",
                          icon: <WebIcon />,
                          desc: "Fake websites, job frauds",
                        },
                      ].map((cat) => (
                        <Grid item xs={6} key={cat.label}>
                          <Card
                            sx={{
                              background: "rgba(255, 255, 255, 0.05)",
                              p: 2,
                              height: "100%",
                            }}
                          >
                            <Box sx={{ color: "primary.main", mb: 1 }}>
                              {cat.icon}
                            </Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              {cat.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {cat.desc}
                            </Typography>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    <Alert
                      severity="info"
                      sx={{
                        mb: 3,
                        background: "rgba(112, 161, 255, 0.1)",
                        textAlign: "left",
                      }}
                    >
                      <Typography variant="body2">
                        <strong>Remember:</strong> Banks, government agencies,
                        and legitimate companies will NEVER ask for OTP, PIN, or
                        passwords over phone/SMS/email.
                      </Typography>
                    </Alert>

                    <AnimatedButton
                      onClick={startQuestionnaire}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ margin: "0 auto", padding: "16px 48px" }}
                    >
                      <PsychologyIcon />
                      Start Scam Check
                    </AnimatedButton>
                  </Box>
                </GlassCard>
              </motion.div>
            ) : completed ? (
              /* Results Screen */
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassCard
                  glow
                  sx={{ borderColor: getRiskColor(result.riskLevel) }}
                >
                  {/* Risk Header */}
                  <Box sx={{ textAlign: "center", mb: 4 }}>
                    {result.riskLevel === "High" ? (
                      <ErrorIcon
                        sx={{ fontSize: 80, color: "#ff4757", mb: 2 }}
                      />
                    ) : result.riskLevel === "Medium" ? (
                      <WarningIcon
                        sx={{ fontSize: 80, color: "#ffa502", mb: 2 }}
                      />
                    ) : (
                      <CheckIcon
                        sx={{ fontSize: 80, color: "#2ed573", mb: 2 }}
                      />
                    )}
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {result.verdict}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {result.description}
                    </Typography>
                    <Chip
                      label={`Risk Level: ${result.riskLevel}`}
                      sx={{
                        backgroundColor: `${getRiskColor(result.riskLevel)}20`,
                        color: getRiskColor(result.riskLevel),
                        fontWeight: 600,
                        fontSize: "1rem",
                        py: 2,
                      }}
                    />
                  </Box>

                  {/* Risk Score */}
                  <Box sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1">Fraud Risk Score</Typography>
                      <Typography
                        variant="h6"
                        sx={{ color: getRiskColor(result.riskLevel) }}
                      >
                        {result.riskPercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={result.riskPercentage}
                      sx={{
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: getRiskColor(result.riskLevel),
                          borderRadius: 8,
                        },
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Answer Stats */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={4}>
                      <Card
                        sx={{
                          background: "rgba(255, 71, 87, 0.1)",
                          textAlign: "center",
                          p: 2,
                        }}
                      >
                        <Typography variant="h4" sx={{ color: "#ff4757" }}>
                          {result.stats.yesCount}
                        </Typography>
                        <Typography variant="body2">Yes</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card
                        sx={{
                          background: "rgba(46, 213, 115, 0.1)",
                          textAlign: "center",
                          p: 2,
                        }}
                      >
                        <Typography variant="h4" sx={{ color: "#2ed573" }}>
                          {result.stats.noCount}
                        </Typography>
                        <Typography variant="body2">No</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card
                        sx={{
                          background: "rgba(255, 165, 2, 0.1)",
                          textAlign: "center",
                          p: 2,
                        }}
                      >
                        <Typography variant="h4" sx={{ color: "#ffa502" }}>
                          {result.stats.maybeCount}
                        </Typography>
                        <Typography variant="body2">Maybe</Typography>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Red Flags */}
                  {result.redFlags.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <WarningIcon color="warning" />
                        Major Red Flags ({result.redFlags.length})
                      </Typography>
                      <Paper
                        sx={{
                          p: 2,
                          background: "rgba(255, 71, 87, 0.1)",
                          borderRadius: 2,
                        }}
                      >
                        {result.redFlags.map((flag, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1,
                              mb: 1.5,
                            }}
                          >
                            <ErrorIcon
                              fontSize="small"
                              color="error"
                              sx={{ mt: 0.3 }}
                            />
                            <Box>
                              <Chip
                                size="small"
                                label={getCategoryLabel(flag.category)}
                                icon={getCategoryIcon(flag.category)}
                                sx={{ mb: 0.5, height: 24 }}
                              />
                              <Typography variant="body2">
                                {flag.question}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Paper>
                    </Box>
                  )}

                  {/* Recommendations */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <ShieldIcon color="success" />
                      What You Should Do
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        background: "rgba(46, 213, 115, 0.1)",
                        borderRadius: 2,
                      }}
                    >
                      {result.recommendations.map((rec, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <CheckIcon
                            fontSize="small"
                            color="success"
                            sx={{ mt: 0.3 }}
                          />
                          <Typography variant="body2">{rec}</Typography>
                        </Box>
                      ))}
                    </Paper>
                  </Box>

                  {/* Emergency Notice */}
                  {result.riskPercentage >= 45 && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        <strong>
                          Already shared information or sent money?
                        </strong>
                        <br />
                        1. Call your bank IMMEDIATELY to block cards/accounts
                        <br />
                        2. Change passwords for affected accounts
                        <br />
                        3. Call 1930 (Cyber Crime Helpline) within 24 hours
                        <br />
                        4. File FIR at cybercrime.gov.in
                      </Typography>
                    </Alert>
                  )}

                  {/* GUVI Submission Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleSubmitToGuvi}
                    sx={{
                      mb: 2,
                      py: 1.5,
                      background: "linear-gradient(135deg, #FF6B35, #F7C815)",
                      fontWeight: 600,
                      "&:hover": {
                        background: "linear-gradient(135deg, #e55a2b, #d9b012)",
                      },
                    }}
                  >
                    Submit to GUVI Evaluation
                  </Button>

                  <AnimatedButton
                    onClick={restartQuestionnaire}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RestartIcon />
                    Check Another Incident
                  </AnimatedButton>
                </GlassCard>
              </motion.div>
            ) : (
              /* Question Screen */
              <motion.div
                key="question"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard glow>
                  {/* Progress */}
                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Question {currentQuestionIndex + 1} of{" "}
                        {selectedQuestions.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(progress)}% Complete
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(255, 107, 53, 0.2)",
                        "& .MuiLinearProgress-bar": {
                          background:
                            "linear-gradient(90deg, #FF6B35, #F7C815)",
                        },
                      }}
                    />
                  </Box>

                  {/* Category Badge */}
                  {currentQuestion && (
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        icon={getCategoryIcon(currentQuestion.category)}
                        label={getCategoryLabel(currentQuestion.category)}
                        size="small"
                        sx={{
                          background: "rgba(255, 107, 53, 0.2)",
                          color: "primary.main",
                        }}
                      />
                    </Box>
                  )}

                  {/* Question */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestionIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <QuestionCard>
                        <Typography
                          variant="h6"
                          sx={{ mb: 3, lineHeight: 1.6 }}
                        >
                          {currentQuestion?.question}
                        </Typography>

                        <FormControl
                          component="fieldset"
                          sx={{ width: "100%" }}
                        >
                          <RadioGroup
                            value={currentAnswer || ""}
                            onChange={(e) => handleAnswer(e.target.value)}
                          >
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={4}>
                                <Paper
                                  sx={{
                                    p: 2,
                                    textAlign: "center",
                                    cursor: "pointer",
                                    border:
                                      currentAnswer === "yes"
                                        ? "2px solid #ff4757"
                                        : "2px solid transparent",
                                    background:
                                      currentAnswer === "yes"
                                        ? "rgba(255, 71, 87, 0.1)"
                                        : "rgba(255, 255, 255, 0.03)",
                                    borderRadius: 2,
                                    transition: "all 0.2s",
                                    "&:hover": {
                                      background: "rgba(255, 71, 87, 0.1)",
                                    },
                                  }}
                                  onClick={() => handleAnswer("yes")}
                                >
                                  <FormControlLabel
                                    value="yes"
                                    control={<Radio sx={{ display: "none" }} />}
                                    label={
                                      <Box>
                                        <Typography variant="h5">✅</Typography>
                                        <Typography
                                          variant="body1"
                                          sx={{ fontWeight: 600 }}
                                        >
                                          Yes
                                        </Typography>
                                      </Box>
                                    }
                                    sx={{ m: 0 }}
                                  />
                                </Paper>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Paper
                                  sx={{
                                    p: 2,
                                    textAlign: "center",
                                    cursor: "pointer",
                                    border:
                                      currentAnswer === "maybe"
                                        ? "2px solid #ffa502"
                                        : "2px solid transparent",
                                    background:
                                      currentAnswer === "maybe"
                                        ? "rgba(255, 165, 2, 0.1)"
                                        : "rgba(255, 255, 255, 0.03)",
                                    borderRadius: 2,
                                    transition: "all 0.2s",
                                    "&:hover": {
                                      background: "rgba(255, 165, 2, 0.1)",
                                    },
                                  }}
                                  onClick={() => handleAnswer("maybe")}
                                >
                                  <FormControlLabel
                                    value="maybe"
                                    control={<Radio sx={{ display: "none" }} />}
                                    label={
                                      <Box>
                                        <Typography variant="h5">🤔</Typography>
                                        <Typography
                                          variant="body1"
                                          sx={{ fontWeight: 600 }}
                                        >
                                          Maybe
                                        </Typography>
                                      </Box>
                                    }
                                    sx={{ m: 0 }}
                                  />
                                </Paper>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Paper
                                  sx={{
                                    p: 2,
                                    textAlign: "center",
                                    cursor: "pointer",
                                    border:
                                      currentAnswer === "no"
                                        ? "2px solid #2ed573"
                                        : "2px solid transparent",
                                    background:
                                      currentAnswer === "no"
                                        ? "rgba(46, 213, 115, 0.1)"
                                        : "rgba(255, 255, 255, 0.03)",
                                    borderRadius: 2,
                                    transition: "all 0.2s",
                                    "&:hover": {
                                      background: "rgba(46, 213, 115, 0.1)",
                                    },
                                  }}
                                  onClick={() => handleAnswer("no")}
                                >
                                  <FormControlLabel
                                    value="no"
                                    control={<Radio sx={{ display: "none" }} />}
                                    label={
                                      <Box>
                                        <Typography variant="h5">👎</Typography>
                                        <Typography
                                          variant="body1"
                                          sx={{ fontWeight: 600 }}
                                        >
                                          No
                                        </Typography>
                                      </Box>
                                    }
                                    sx={{ m: 0 }}
                                  />
                                </Paper>
                              </Grid>
                            </Grid>
                          </RadioGroup>
                        </FormControl>
                      </QuestionCard>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 3,
                    }}
                  >
                    <AnimatedButton
                      variant="secondary"
                      onClick={goToPrevious}
                      disabled={currentQuestionIndex === 0}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <BackIcon />
                      Previous
                    </AnimatedButton>

                    <AnimatedButton
                      onClick={goToNext}
                      disabled={!currentAnswer}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {currentQuestionIndex === selectedQuestions.length - 1 ? (
                        <>
                          <PsychologyIcon />
                          Get Results
                        </>
                      ) : (
                        <>
                          Next
                          <NextIcon />
                        </>
                      )}
                    </AnimatedButton>
                  </Box>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FraudQuestionnaire;
