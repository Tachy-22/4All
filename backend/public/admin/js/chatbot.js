/**
 * 4All Admin Dashboard - AI Chatbot Interface
 * Integrates with Ziva AI backend for intelligent dashboard assistance
 */

class AdminChatbot {
  constructor() {
    this.apiUrl = "/api/ziva";
    this.conversationHistory = [];
    this.isOpen = false;
    this.isProcessing = false;

    // DOM Elements
    this.chatToggleBtn = document.getElementById("chat-toggle-btn");
    this.chatWindow = document.getElementById("chat-window");
    this.chatMessages = document.getElementById("chat-messages");
    this.chatInput = document.getElementById("chat-input");
    this.chatSendBtn = document.getElementById("chat-send-btn");
    this.closeChatBtn = document.getElementById("close-chat-btn");
    this.minimizeChatBtn = document.getElementById("minimize-chat-btn");
    this.clearChatBtn = document.getElementById("clear-chat-btn");
    this.typingIndicator = document.getElementById("typing-indicator");
    this.notificationBadge = document.getElementById("chat-notification-badge");

    this.init();
  }

  init() {
    // Event Listeners
    this.chatToggleBtn.addEventListener("click", () => this.toggleChat());
    this.closeChatBtn.addEventListener("click", () => this.closeChat());
    this.minimizeChatBtn.addEventListener("click", () => this.closeChat());
    this.clearChatBtn.addEventListener("click", () => this.clearChat());
    this.chatSendBtn.addEventListener("click", () => this.sendMessage());

    // Input handling
    this.chatInput.addEventListener("keydown", (e) => this.handleKeyPress(e));
    this.chatInput.addEventListener("input", () => this.autoResizeInput());

    // Suggestion chips
    document.querySelectorAll(".suggestion-chip").forEach((chip) => {
      chip.addEventListener("click", (e) => {
        const message = e.target.dataset.message;
        this.chatInput.value = message;
        this.sendMessage();
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.closeChat();
      }
    });
  }

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    this.isOpen = true;
    this.chatWindow.classList.add("active");
    this.chatInput.focus();
    this.notificationBadge.style.display = "none";
    this.scrollToBottom();
  }

  closeChat() {
    this.isOpen = false;
    this.chatWindow.classList.remove("active");
  }

  handleKeyPress(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  autoResizeInput() {
    this.chatInput.style.height = "auto";
    this.chatInput.style.height =
      Math.min(this.chatInput.scrollHeight, 120) + "px";
  }

  async sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message || this.isProcessing) return;

    // Add user message to chat
    this.addMessage(message, "user");
    this.chatInput.value = "";
    this.autoResizeInput();

    // Show typing indicator
    this.showTypingIndicator();
    this.isProcessing = true;

    try {
      // Get dashboard context
      const context = this.getDashboardContext();

      // Send to Ziva AI
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: this.conversationHistory,
          context: context,
          emotionalState: "neutral",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from Ziva AI");
      }

      const data = await response.json();

      // Add conversation to history
      this.conversationHistory.push({
        role: "user",
        content: message,
      });
      this.conversationHistory.push({
        role: "assistant",
        content: data.response,
      });

      // Keep only last 10 messages in history
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      // Hide typing indicator and show response
      this.hideTypingIndicator();
      this.addMessage(data.response, "bot");

      // Handle suggestions if provided
      if (data.suggestions && data.suggestions.length > 0) {
        this.updateSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      this.hideTypingIndicator();
      this.addMessage(
        "I apologize, but I encountered an error processing your request. Please try again.",
        "bot",
        true
      );
    } finally {
      this.isProcessing = false;
    }
  }

  addMessage(text, sender, isError = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${sender}-message ${
      isError ? "error-message" : ""
    }`;

    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    messageDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas fa-${sender === "user" ? "user" : "robot"}"></i>
      </div>
      <div class="message-content">
        <div class="message-bubble">
          ${this.formatMessage(text)}
        </div>
        <span class="message-time">${time}</span>
      </div>
    `;

    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  formatMessage(text) {
    // Convert markdown-style formatting to HTML
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");

    // Convert bullet points
    if (formatted.includes("- ")) {
      const lines = formatted.split("<br>");
      let inList = false;
      formatted = lines
        .map((line) => {
          if (line.trim().startsWith("- ")) {
            if (!inList) {
              inList = true;
              return "<ul><li>" + line.trim().substring(2) + "</li>";
            }
            return "<li>" + line.trim().substring(2) + "</li>";
          } else if (inList && line.trim() === "") {
            inList = false;
            return "</ul>";
          }
          return line;
        })
        .join("");

      if (inList) formatted += "</ul>";
    }

    return formatted;
  }

  showTypingIndicator() {
    this.typingIndicator.style.display = "flex";
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    this.typingIndicator.style.display = "none";
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }, 100);
  }

  clearChat() {
    if (confirm("Are you sure you want to clear the chat history?")) {
      // Keep only the welcome message
      const welcomeMessage = this.chatMessages.querySelector(".bot-message");
      this.chatMessages.innerHTML = "";
      if (welcomeMessage) {
        this.chatMessages.appendChild(welcomeMessage);
      }
      this.conversationHistory = [];
    }
  }

  updateSuggestions(suggestions) {
    const suggestionsContainer = document.getElementById("chat-suggestions");
    suggestionsContainer.innerHTML = "";

    suggestions.slice(0, 4).forEach((suggestion) => {
      const chip = document.createElement("button");
      chip.className = "suggestion-chip";
      chip.dataset.message = suggestion;
      chip.textContent = suggestion;
      chip.addEventListener("click", () => {
        this.chatInput.value = suggestion;
        this.sendMessage();
      });
      suggestionsContainer.appendChild(chip);
    });
  }

  getDashboardContext() {
    // Gather current dashboard data for context
    const context = {
      currentSection:
        document.querySelector(".nav-item.active")?.dataset.section ||
        "overview",
      dashboardData: {},
    };

    // Get key metrics from the dashboard
    try {
      context.dashboardData.totalUsers =
        document.getElementById("total-users")?.textContent || "0";
      context.dashboardData.engagementRate =
        document.getElementById("engagement-rate")?.textContent || "0%";
      context.dashboardData.trustScore =
        document.getElementById("trust-score")?.textContent || "0%";
      context.dashboardData.inclusivityScore =
        document.getElementById("inclusivity-score")?.textContent || "0%";

      // Banking activity
      context.dashboardData.depositsToday =
        document.getElementById("deposits-count")?.textContent || "0";
      context.dashboardData.withdrawalsToday =
        document.getElementById("withdrawals-count")?.textContent || "0";
      context.dashboardData.transfersToday =
        document.getElementById("transfers-count")?.textContent || "0";
      context.dashboardData.failedTransactions =
        document.getElementById("failed-transactions")?.textContent || "0";

      // Emotional analytics
      context.dashboardData.satisfiedUsers =
        document.getElementById("satisfied-users")?.textContent || "0";
      context.dashboardData.frustratedUsers =
        document.getElementById("frustrated-users-count")?.textContent || "0";
      context.dashboardData.stressedUsers =
        document.getElementById("stressed-users")?.textContent || "0";

      // Accessibility
      context.dashboardData.accessibilityUsers =
        document.getElementById("accessibility-users")?.textContent || "0";
      context.dashboardData.featureAdoption =
        document.getElementById("feature-adoption")?.textContent || "0%";
      context.dashboardData.voiceUsage =
        document.getElementById("voice-usage")?.textContent || "0%";
    } catch (error) {
      console.error("Error gathering dashboard context:", error);
    }

    return context;
  }
}

// Initialize chatbot when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.adminChatbot = new AdminChatbot();
});
