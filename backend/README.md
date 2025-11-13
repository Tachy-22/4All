# 4All Inclusive Banking - Backend API

> Node.js REST API with Express, MongoDB, and Google Gemini AI Integration

## 🚀 Features

- ✅ **Ziva AI Assistant** - Conversational banking with emotional intelligence powered by Gemini AI
- ✅ **AI-Powered Profile Detection** - Uses Google Gemini AI to generate adaptive accessibility profiles
- ✅ **Proactive Financial Guidance** - AI-driven spending alerts and savings recommendations
- ✅ **Emotional Analytics** - Track user frustration, engagement, and satisfaction
- ✅ **Life Event Detection** - Identify house hunting, weddings, business startups from behavior
- ✅ **Bank Dashboard** - Comprehensive insights for user segmentation and inclusion metrics
- ✅ **Real-time Transaction Processing** - Handle transfers and bill payments
- ✅ **Analytics & Insights** - Track user behavior and accessibility metrics
- ✅ **MongoDB Integration** - Persistent data storage with Mongoose ODM
- ✅ **CORS Enabled** - Ready for frontend integration
- ✅ **Error Handling** - Comprehensive error handling and validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Google Gemini API Key (optional - falls back to rule-based logic)

## 🛠️ Installation

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your configuration:**
   ```env
   PORT=3001
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/4all_db
   CORS_ORIGIN=http://localhost:3000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## 🎯 Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

**Note:** If you don't have a Gemini API key, the system will automatically use rule-based fallback logic.

## 🏃 Running the Server

### Development Mode (with auto-reload):

```bash
npm run dev
```

### Production Mode:

```bash
npm start
```

The server will start on `http://localhost:3001`

## 📡 API Endpoints

### Profile Management

#### POST /api/profile/detect

Generate adaptive profile using Gemini AI

```bash
curl -X POST http://localhost:3001/api/profile/detect \
  -H "Content-Type: application/json" \
  -d '{
    "language": "en",
    "disabilities": ["visual"],
    "cognitiveScore": 6,
    "interactionMode": "voice"
  }'
```

#### POST /api/profile

Save user profile

```bash
curl -X POST http://localhost:3001/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "p_1234567890",
    "name": "Ada Okafor",
    "phone": "+2348012345678",
    "language": "en",
    "interactionMode": "voice",
    "disabilities": ["visual"],
    "cognitiveScore": 4,
    "uiComplexity": "simplified",
    "accessibilityPreferences": {
      "fontSize": 20,
      "contrast": "high",
      "ttsSpeed": 1.0,
      "largeTargets": true,
      "captions": false,
      "font": "inter"
    },
    "confirmMode": "voice",
    "isOnboardingComplete": true
  }'
```

#### GET /api/profile/:profileId

Retrieve user profile

```bash
curl http://localhost:3001/api/profile/p_1234567890
```

### Transactions

#### GET /api/transactions

Get transaction history

```bash
curl "http://localhost:3001/api/transactions?limit=10&offset=0&status=completed"
```

#### POST /api/transactions

Create new transaction

```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "transfer",
    "amount": 5000,
    "recipient": "Ada Okafor",
    "recipientAccount": "2051234567",
    "account": "savings",
    "description": "Rent payment"
  }'
```

### Bill Payments

#### POST /api/bills

Process bill payment

```bash
curl -X POST http://localhost:3001/api/bills \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "electricity_provider_001",
    "accountNumber": "1234567890",
    "amount": 5000,
    "saveForLater": true,
    "nickname": "Home Electricity"
  }'
```

### Analytics

#### POST /api/analytics

Send analytics events

```bash
curl -X POST http://localhost:3001/api/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "type": "page_view",
        "page": "/dashboard",
        "timestamp": 1704902400000
      }
    ],
    "sessionId": "session_123"
  }'
```

#### GET /api/analytics

Get aggregated analytics

```bash
curl http://localhost:3001/api/analytics
```

### Ziva AI Assistant

#### POST /api/ziva

Chat with Ziva AI assistant

```bash
curl -X POST http://localhost:3001/api/ziva \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is my balance?",
    "profileId": "p_1234567890",
    "emotionalState": "neutral"
  }'
```

#### POST /api/ziva/guidance

Get proactive financial guidance

```bash
curl -X POST http://localhost:3001/api/ziva/guidance \
  -H "Content-Type: application/json" \
  -d '{"profileId": "p_1234567890"}'
```

### Bank Dashboard

#### GET /api/dashboard/overview

Get comprehensive dashboard overview

```bash
curl http://localhost:3001/api/dashboard/overview?timeRange=30d
```

#### GET /api/dashboard/user-segments

Get user segmentation analysis

```bash
curl http://localhost:3001/api/dashboard/user-segments
```

#### GET /api/dashboard/recommendations

Get AI-driven operational recommendations

```bash
curl http://localhost:3001/api/dashboard/recommendations
```

## 🗄️ Database Models

- **User** - User profiles with accessibility preferences
- **Transaction** - Financial transactions
- **BillPayment** - Bill payment records
- **AnalyticsEvent** - User interaction events

## 🤖 Gemini AI Integration

The backend uses Google Gemini AI for:

1. **Adaptive Profile Detection** - Analyzes user disabilities and cognitive scores to recommend optimal UI settings
2. **Ziva AI Assistant** - Conversational banking with emotional intelligence and context awareness
3. **Proactive Guidance** - Analyzes spending patterns and provides personalized financial recommendations
4. **Intelligent Recommendations** - Provides reasoning for accessibility adaptations

### How it works:

1. User submits onboarding data
2. Backend sends contextual prompt to Gemini AI
3. Gemini analyzes and returns JSON recommendations
4. Backend merges AI recommendations with profile data
5. If Gemini fails, falls back to rule-based logic

## 🔧 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── profileController.js  # Profile logic
│   │   ├── transactionController.js
│   │   ├── billsController.js
│   │   └── analyticsController.js
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Transaction.js
│   │   ├── BillPayment.js
│   │   └── Analytics.js
│   ├── routes/
│   │   ├── profileRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── billsRoutes.js
│   │   └── analyticsRoutes.js
│   ├── services/
│   │   └── geminiService.js     # Gemini AI integration
│   └── server.js                # Main server file
├── .env                         # Environment variables
├── .env.example                 # Example env file
├── package.json
└── README.md
```

## 🧪 Testing

Test the profile detection endpoint:

```bash
# Visual impairment user
curl -X POST http://localhost:3001/api/profile/detect \
  -H "Content-Type: application/json" \
  -d '{"language":"en","disabilities":["visual"],"cognitiveScore":6,"interactionMode":"voice"}'

# Expected: fontSize >= 20, contrast: "high", largeTargets: true
```

## 🚨 Troubleshooting

### MongoDB Connection Issues

```bash
# Make sure MongoDB is running
mongod --version

# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Start MongoDB (Linux)
sudo systemctl start mongod
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

## 📝 License

ISC
