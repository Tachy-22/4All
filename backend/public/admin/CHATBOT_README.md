# 4All Admin Dashboard - AI Chatbot Interface

## Overview

The AI Chatbot interface provides bank managers with an intelligent assistant powered by Ziva AI to help interpret dashboard data, analyze user metrics, and get actionable insights.

## Features

### 🤖 Intelligent Assistance
- **Dashboard Insights**: Get explanations of key metrics and trends
- **User Analytics**: Query user segmentation and behavior patterns
- **Accessibility Metrics**: Understand accessibility feature adoption and usage
- **Campaign Recommendations**: Get AI-powered campaign suggestions
- **Operational Alerts**: Receive guidance on alerts and suggested actions

### 💬 Conversational Interface
- Natural language processing for intuitive queries
- Context-aware responses based on current dashboard data
- Conversation history maintained during session
- Quick suggestion chips for common queries

### 🎨 Design Features
- **Zenith Bank Design System**: Uses brand colors (Zenith Red #E1251B, Accent Gold #E6B800)
- **Floating Button**: Always accessible from bottom-right corner
- **Smooth Animations**: Professional slide-up and fade effects
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: WCAG compliant with keyboard navigation support

## Usage

### Opening the Chatbot

1. Click the floating robot icon in the bottom-right corner
2. The chat window will slide up with a welcome message
3. Type your question or click a suggestion chip

### Keyboard Shortcuts

- **Enter**: Send message
- **Shift + Enter**: New line in message
- **Escape**: Close chat window

### Example Queries

#### Dashboard Overview
```
"What are the key insights from today's dashboard?"
"Show me the dashboard overview"
"Give me today's insights"
```

#### User Support
```
"Show me users who need support"
"How many frustrated users do we have?"
"Which users need help?"
```

#### Accessibility Metrics
```
"Explain accessibility metrics"
"How are our accessibility features performing?"
"Show disability statistics"
```

#### Campaign Ideas
```
"Suggest a new campaign"
"What campaigns should we run?"
"Campaign ideas for visual users"
```

#### Banking Activity
```
"Show today's transactions"
"How many failed transactions?"
"Banking activity overview"
```

## Technical Implementation

### Files Structure

```
backend/public/admin/
├── index.html              # Chatbot HTML structure
├── css/
│   └── dashboard.css       # Chatbot styles (lines 1999-2557)
└── js/
    └── chatbot.js          # Chatbot functionality
```

### API Integration

The chatbot connects to the Ziva AI backend:

**Endpoint**: `POST /api/ziva`

**Request Format**:
```json
{
  "message": "User's question",
  "conversationHistory": [...],
  "context": {
    "currentSection": "overview",
    "dashboardData": {
      "totalUsers": "8",
      "engagementRate": "87%",
      ...
    }
  },
  "emotionalState": "neutral"
}
```

**Response Format**:
```json
{
  "success": true,
  "response": "AI response message",
  "action": "dashboard_overview",
  "data": {...},
  "emotion": "supportive",
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "timestamp": 1234567890
}
```

### Context Gathering

The chatbot automatically gathers dashboard context including:
- Current active section
- Total users and engagement metrics
- Banking activity (deposits, withdrawals, transfers)
- Emotional analytics (satisfied, frustrated, stressed users)
- Accessibility metrics (users with disabilities, feature adoption)

## Customization

### Changing Colors

Edit `backend/public/admin/css/dashboard.css`:

```css
.chat-toggle-btn {
  background: linear-gradient(135deg, var(--zenith-red) 0%, var(--zenith-red-muted) 100%);
}

.chat-header {
  background: linear-gradient(135deg, var(--zenith-red) 0%, var(--zenith-red-muted) 100%);
}
```

### Adding New Suggestions

Edit `backend/public/admin/index.html`:

```html
<button class="suggestion-chip" data-message="Your custom query">
    🎯 Custom Suggestion
</button>
```

### Extending AI Responses

Edit `backend/src/services/zivaService.js` to add new query patterns:

```javascript
if (message.includes('your-keyword')) {
  return {
    message: 'Your custom response',
    action: 'custom_action',
    suggestions: ['Suggestion 1', 'Suggestion 2']
  };
}
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Accessibility Features

- Keyboard navigation support
- ARIA labels for screen readers
- High contrast mode support
- Reduced motion support for animations
- Focus indicators for all interactive elements

## Troubleshooting

### Chatbot not responding
1. Check browser console for errors
2. Verify backend server is running on port 3001
3. Ensure `/api/ziva` endpoint is accessible

### Styling issues
1. Clear browser cache
2. Verify `dashboard.css` is loaded
3. Check for CSS conflicts with other styles

### Context not being sent
1. Verify dashboard data is loaded
2. Check element IDs match those in `chatbot.js`
3. Review browser console for context gathering errors

## Future Enhancements

- [ ] Voice input/output support
- [ ] Multi-language support
- [ ] Export chat history
- [ ] Suggested actions with one-click execution
- [ ] Integration with notification system
- [ ] Advanced analytics on chatbot usage

