import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

class ZivaService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn(
        "WARNING: GEMINI_API_KEY not set. Ziva will use rule-based responses."
      );
      this.genAI = null;
      this.model = null;
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
  }

  /**
   * Process user message and generate Ziva's response
   * @param {Object} params - Conversation parameters
   * @returns {Promise<Object>} - Ziva's response with actions
   */
  async processMessage(params) {
    const {
      userMessage,
      userProfile,
      conversationHistory = [],
      context = {},
    } = params;

    // If Gemini is not available, use rule-based responses
    if (!this.model) {
      return this.fallbackResponse(userMessage, userProfile, context);
    }

    try {
      const prompt = this.buildZivaPrompt(
        userMessage,
        userProfile,
        conversationHistory,
        context
      );

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiResponse = JSON.parse(jsonMatch[0]);
        return {
          message: aiResponse.message,
          action: aiResponse.action || null,
          data: aiResponse.data || null,
          emotion: aiResponse.emotion || "neutral",
          suggestions: aiResponse.suggestions || [],
        };
      }

      // If parsing fails, use fallback
      return this.fallbackResponse(userMessage, userProfile, context);
    } catch (error) {
      console.error("Ziva AI error:", error.message);
      return this.fallbackResponse(userMessage, userProfile, context);
    }
  }

  /**
   * Build contextual prompt for Ziva
   */
  buildZivaPrompt(userMessage, userProfile, conversationHistory, context) {
    const {
      disabilities = [],
      language = "en",
      interactionMode = "voice",
      cognitiveScore = 5,
      name = "there",
    } = userProfile || {};

    const {
      balance = 0,
      recentTransactions = [],
      emotionalState = "neutral",
    } = context;

    return `You are Ziva, an empathetic AI banking assistant for 4All Inclusive Banking.

USER PROFILE:
- Name: ${name}
- Language: ${language}
- Disabilities: ${disabilities.join(", ") || "none"}
- Cognitive Score: ${cognitiveScore}/10
- Interaction Mode: ${interactionMode}
- Emotional State: ${emotionalState}

CONTEXT:
- Account Balance: ₦${balance.toLocaleString()}
- Recent Activity: ${recentTransactions.length} transactions

CONVERSATION HISTORY:
${conversationHistory
  .slice(-3)
  .map((msg) => `${msg.role}: ${msg.content}`)
  .join("\n")}

USER MESSAGE: "${userMessage}"

INSTRUCTIONS:
1. Be warm, empathetic, and supportive
2. Adapt tone to user's emotional state and cognitive profile
3. Use simple language if cognitive score < 5
4. Be concise for voice mode, detailed for text mode
5. Detect user intent (check balance, transfer, pay bills, get advice, emotional support)
6. Provide actionable suggestions when appropriate
7. Show financial empathy - never judge spending or financial struggles

Respond ONLY with JSON (no markdown):
{
  "message": "Your empathetic response here",
  "action": "check_balance" | "transfer" | "pay_bill" | "view_transactions" | "financial_advice" | "emotional_support" | null,
  "data": { /* relevant data for action */ },
  "emotion": "supportive" | "encouraging" | "calm" | "celebratory" | "concerned",
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;
  }

  /**
   * Fallback rule-based responses
   */
  fallbackResponse(userMessage, userProfile, context) {
    const message = userMessage.toLowerCase();
    const name = userProfile?.name || "there";
    const balance = context?.balance || 0;
    const dashboardData = context?.dashboardData || {};

    // Dashboard-specific queries
    if (
      message.includes("dashboard") ||
      message.includes("insight") ||
      message.includes("overview")
    ) {
      return {
        message: `Based on the current dashboard data:\n\n- **Total Users**: ${
          dashboardData.totalUsers || "N/A"
        }\n- **Engagement Rate**: ${
          dashboardData.engagementRate || "N/A"
        }\n- **Trust Score**: ${
          dashboardData.trustScore || "N/A"
        }\n- **Inclusivity Score**: ${
          dashboardData.inclusivityScore || "N/A"
        }\n\nThe platform is performing well with strong user engagement and trust metrics. Would you like me to explain any specific metric?`,
        action: "dashboard_overview",
        data: dashboardData,
        emotion: "supportive",
        suggestions: [
          "Explain engagement rate",
          "Show user segments",
          "Accessibility metrics",
          "Campaign performance",
        ],
      };
    }

    // User support queries
    if (
      message.includes("support") ||
      message.includes("frustrated") ||
      message.includes("need help")
    ) {
      const frustrated = dashboardData.frustratedUsers || "0";
      const stressed = dashboardData.stressedUsers || "0";
      return {
        message: `Currently, we have **${frustrated} frustrated users** and **${stressed} stressed users** who may need support. I recommend:\n\n1. Prioritize users with multiple failed transactions\n2. Reach out proactively with personalized assistance\n3. Review accessibility settings for these users\n\nWould you like to see the detailed list of users needing support?`,
        action: "user_support",
        data: { frustrated, stressed },
        emotion: "concerned",
        suggestions: [
          "View frustrated users",
          "Send support message",
          "Check accessibility issues",
        ],
      };
    }

    // Accessibility queries
    if (
      message.includes("accessibility") ||
      message.includes("disability") ||
      message.includes("inclusive")
    ) {
      const accessibilityUsers = dashboardData.accessibilityUsers || "0";
      const featureAdoption = dashboardData.featureAdoption || "0%";
      const voiceUsage = dashboardData.voiceUsage || "0%";
      return {
        message: `**Accessibility Metrics:**\n\n- Users with disabilities: **${accessibilityUsers}**\n- Feature adoption rate: **${featureAdoption}**\n- Voice-first usage: **${voiceUsage}**\n\nOur accessibility features are being well-adopted. Consider promoting voice features more to increase adoption among users with visual impairments.`,
        action: "accessibility_metrics",
        data: { accessibilityUsers, featureAdoption, voiceUsage },
        emotion: "supportive",
        suggestions: [
          "Improve voice features",
          "Target accessibility campaigns",
          "User feedback analysis",
        ],
      };
    }

    // Campaign queries
    if (
      message.includes("campaign") ||
      message.includes("promotion") ||
      message.includes("marketing")
    ) {
      return {
        message: `For effective campaigns, I recommend:\n\n1. **Segment-specific offers**: Target users based on disability type and cognitive profile\n2. **Accessibility-first design**: Ensure all campaigns are accessible via voice and text\n3. **Emotional context**: Avoid campaigns for stressed/frustrated users\n4. **A/B testing**: Test different message formats for different cognitive levels\n\nWould you like me to suggest a specific campaign?`,
        action: "campaign_suggestion",
        data: null,
        emotion: "supportive",
        suggestions: [
          "Suggest campaign for visual users",
          "Create savings promotion",
          "Accessibility awareness campaign",
        ],
      };
    }

    // Transaction/Banking queries
    if (
      message.includes("transaction") ||
      message.includes("banking") ||
      message.includes("deposit") ||
      message.includes("withdrawal")
    ) {
      const deposits = dashboardData.depositsToday || "0";
      const withdrawals = dashboardData.withdrawalsToday || "0";
      const transfers = dashboardData.transfersToday || "0";
      const failed = dashboardData.failedTransactions || "0";
      return {
        message: `**Today's Banking Activity:**\n\n- Deposits: **${deposits}**\n- Withdrawals: **${withdrawals}**\n- Transfers: **${transfers}**\n- Failed transactions: **${failed}**\n\n${
          failed !== "0"
            ? "Note: There are failed transactions that may need attention."
            : "All transactions are processing smoothly."
        }`,
        action: "banking_activity",
        data: { deposits, withdrawals, transfers, failed },
        emotion: "supportive",
        suggestions: [
          "View failed transactions",
          "Transaction trends",
          "SME activity",
        ],
      };
    }

    // Balance check (for regular users)
    if (message.includes("balance") || message.includes("how much")) {
      return {
        message: `Hi ${name}, your current balance is ₦${balance.toLocaleString()}. Would you like to see your recent transactions?`,
        action: "check_balance",
        data: { balance },
        emotion: "supportive",
        suggestions: ["View transactions", "Transfer money", "Pay bills"],
      };
    }

    // Transfer intent
    if (message.includes("send") || message.includes("transfer")) {
      return {
        message: `I can help you transfer money. Who would you like to send money to?`,
        action: "transfer",
        data: null,
        emotion: "supportive",
        suggestions: ["Send to saved contact", "New recipient"],
      };
    }

    // Bill payment
    if (message.includes("bill") || message.includes("pay")) {
      return {
        message: `I can help you pay your bills. Which bill would you like to pay?`,
        action: "pay_bill",
        data: null,
        emotion: "supportive",
        suggestions: ["Electricity", "Water", "Internet", "Phone"],
      };
    }

    // Emotional support
    if (
      message.includes("stress") ||
      message.includes("worried") ||
      message.includes("help")
    ) {
      return {
        message: `I understand this can be stressful. I'm here to help make banking easier for you. What would you like assistance with?`,
        action: "emotional_support",
        data: null,
        emotion: "concerned",
        suggestions: [
          "Check my finances",
          "Get budgeting advice",
          "Talk to support",
        ],
      };
    }

    // Default greeting
    return {
      message: `Hello ${name}! I'm Ziva, your AI assistant for the 4All Dashboard. I can help you with dashboard insights, user analytics, accessibility metrics, campaign recommendations, and operational alerts. What would you like to know?`,
      action: null,
      data: null,
      emotion: "supportive",
      suggestions: [
        "Dashboard overview",
        "Users needing support",
        "Accessibility metrics",
        "Campaign ideas",
      ],
    };
  }
}

// Export singleton instance
const zivaService = new ZivaService();
export default zivaService;
