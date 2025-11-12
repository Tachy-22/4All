# 4All Backend API Requirements

> **For Backend Developer: Complete Node.js API Implementation Guide**

## Overview

You need to build a **Node.js REST API** that supports the 4All inclusive banking frontend. The frontend is already 100% complete and expects specific API endpoints with exact data structures.

**Tech Stack Requirements:**
- Node.js with Express.js (Vanilla JavaScript)
- Database: MongoDB with Mongoose
- Authentication: JWT tokens
- CORS enabled for frontend communication
- **AI/ML Integration:**
  - Google Gemini API for intelligent profile detection
  - Natural Language Processing for Ziva AI assistant
  - Machine Learning for accessibility adaptation
  - Real-time cognitive assessment algorithms

---

## Critical: Exact Data Structure to Match

The frontend expects this **EXACT** data structure. Do not deviate from these field names or types:

```javascript
// UserProfile object structure
const UserProfile = {
  profileId: String,            // Required for API responses
  userId: String,               // Optional user identifier  
  name: String,                 // Full name from registration
  phone: String,                // Phone number from registration
  language: String,             // REQUIRED: 'en' | 'pcm' | 'yo' | 'ig' | 'ha'
  interactionMode: String,      // REQUIRED: 'voice' | 'text'
  disabilities: Array,          // Array of strings: ['visual', 'hearing', 'motor', 'cognitive', 'speech']
  cognitiveScore: Number,       // 1-10 score from micro-test
  uiComplexity: String,         // REQUIRED: 'simplified' | 'moderate' | 'detailed'
  accessibilityPreferences: {  // REQUIRED nested object
    fontSize: Number,           // 14-24 px
    contrast: String,           // 'normal' | 'high'
    ttsSpeed: Number,           // 0.5-2.0
    largeTargets: Boolean,      // Touch target size preference
    captions: Boolean,          // Video caption preference
    font: String                // 'inter' | 'atkinson'
  },
  confirmMode: String,          // REQUIRED: 'pin' | 'voice' | 'biometric'
  isOnboardingComplete: Boolean // REQUIRED
}
```

---

## Required Endpoints

### 1. **POST /api/profile/detect** 
**Purpose:** Process onboarding data and return adaptive profile settings

#### Request Body:
```json
{
  "language": "en",                    // Required: 'en' | 'pcm' | 'yo' | 'ig' | 'ha'
  "disabilities": ["visual", "motor"], // Array of strings
  "cognitiveScore": 4,                 // Number 1-10
  "interactionMode": "voice",          // 'voice' | 'text'
  "microInteractions": {               // Optional interaction data
    "preferVoice": true,
    "completionTime": 45.2,
    "errorCount": 2
  }
}
```

#### Response (200):
```json
{
  "profileId": "p_1701234567890",
  "language": "en",
  "interactionMode": "voice",
  "disabilities": ["visual", "motor"],
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
  "isOnboardingComplete": false
}
```

#### **CRITICAL: Implement This Exact Logic**
```javascript
function generateProfile(data) {
  const { language, disabilities, cognitiveScore, interactionMode } = data;
  
  // Default values
  let uiComplexity = 'moderate';
  let fontSize = 16;
  let contrast = 'normal';
  let confirmMode = 'pin';
  let largeTargets = false;
  
  // Cognitive-based adaptations
  if (disabilities.includes('cognitive') || cognitiveScore < 4) {
    uiComplexity = 'simplified';
    fontSize = 18;
  } else if (cognitiveScore > 7) {
    uiComplexity = 'detailed';
    fontSize = 14;
  }
  
  // Visual impairment adaptations
  if (disabilities.includes('visual')) {
    fontSize = Math.max(fontSize, 20);
    contrast = 'high';
    largeTargets = true;
  }
  
  // Motor impairment adaptations  
  if (disabilities.includes('motor')) {
    confirmMode = 'voice';
    largeTargets = true;
  }
  
  // Hearing impairment adaptations
  if (disabilities.includes('hearing')) {
    // Keep confirmMode as pin/biometric (not voice)
    if (confirmMode === 'voice') confirmMode = 'pin';
  }
  
  return {
    profileId: `p_${Date.now()}`,
    language,
    interactionMode,
    disabilities,
    cognitiveScore,
    uiComplexity,
    accessibilityPreferences: {
      fontSize,
      contrast,
      ttsSpeed: 1.0,
      largeTargets,
      captions: disabilities.includes('hearing'),
      font: 'inter'
    },
    confirmMode,
    isOnboardingComplete: false
  };
}
```

---

### 2. **POST /api/profile** 
**Purpose:** Save complete user profile after onboarding

#### Request Body:
```json
{
  "profileId": "p_1701234567890",
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
}
```

#### Response (200):
```json
{
  "success": true,
  "profileId": "p_1701234567890",
  "message": "Profile saved successfully"
}
```

---

### 3. **GET /api/profile/:profileId**
**Purpose:** Retrieve existing user profile

#### Response (200):
```json
{
  "profileId": "p_1701234567890",
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
}
```

---

### 4. **GET /api/transactions** 
**Purpose:** Retrieve user transaction history with filtering

#### Query Parameters:
- `limit` (optional): Number of transactions (default: 10)
- `offset` (optional): Pagination offset (default: 0)  
- `status` (optional): Filter by 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
- `type` (optional): Filter by 'transfer' | 'bill_payment' | 'deposit' | 'withdrawal'

#### Response (200):
```json
{
  "transactions": [
    {
      "id": "txn_001", 
      "type": "transfer",
      "status": "completed",
      "amount": 15000,
      "currency": "NGN",
      "recipient": "Ada Okafor",
      "sender": "John Doe",
      "description": "Rent payment",
      "reference": "TRF/2024/001",
      "timestamp": 1704902400000,
      "timeline": [
        {
          "status": "pending",
          "timestamp": 1704902400000,
          "description": "Transaction initiated"
        },
        {
          "status": "completed", 
          "timestamp": 1704902460000,
          "description": "Transfer completed successfully"
        }
      ],
      "metadata": {
        "channel": "mobile_app",
        "location": "Lagos, Nigeria",
        "confirmationMethod": "voice"
      }
    }
  ],
  "total": 25,
  "hasMore": true
}
```

---

### 5. **POST /api/transactions**
**Purpose:** Create new transaction (transfer)

#### Request Body:
```json
{
  "type": "transfer",
  "amount": 5000,
  "recipient": "Ada Okafor", 
  "recipientAccount": "2051234567",
  "account": "savings",
  "description": "Rent payment",
  "narration": "Monthly rent"
}
```

#### Response (200):
```json
{
  "success": true,
  "transaction": {
    "id": "txn_1701234567890",
    "type": "transfer",
    "status": "pending",
    "amount": 5000,
    "currency": "NGN",
    "recipient": "Ada Okafor",
    "sender": "John Doe",
    "description": "Rent payment",
    "reference": "TRF/2024/123",
    "timestamp": 1704902400000,
    "timeline": [
      {
        "status": "pending",
        "timestamp": 1704902400000,
        "description": "Transaction initiated"
      }
    ],
    "metadata": {
      "channel": "mobile_app",
      "confirmationMethod": "voice"
    }
  },
  "message": "Transaction initiated successfully"
}
```

---

### 6. **POST /api/bills**
**Purpose:** Process bill payments

#### Request Body:
```json
{
  "providerId": "electricity_provider_001",
  "accountNumber": "1234567890",
  "amount": 5000,
  "saveForLater": true,
  "nickname": "Home Electricity"
}
```

#### Response (200):
```json
{
  "success": true,
  "payment": {
    "id": "bill_1701234567890",
    "providerId": "electricity_provider_001",
    "accountNumber": "1234567890",
    "amount": 5000,
    "status": "completed",
    "reference": "BP12345678",
    "timestamp": 1704902400000,
    "provider": {
      "name": "Electricity Company",
      "category": "electricity"
    }
  },
  "message": "Bill payment completed successfully"
}
```

#### Response (400 - Failed):
```json
{
  "success": false,
  "error": "Payment failed",
  "details": "Insufficient balance",
  "payment": {
    "id": "bill_1701234567890",
    "status": "failed",
    "reference": "BP12345678"
  }
}
```

---

### 7. **POST /api/analytics**
**Purpose:** Receive frontend analytics data

#### Request Body:
```json
{
  "events": [
    {
      "type": "page_view",
      "page": "/dashboard",
      "timestamp": 1704902400000,
      "metadata": {
        "userAgent": "Mozilla/5.0...",
        "language": "en"
      }
    },
    {
      "type": "voice_command",
      "command": "send 5000 naira to ada",
      "success": true,
      "timestamp": 1704902460000
    }
  ],
  "accessibilityMetrics": {
    "fontSize": 18,
    "contrast": "high",
    "voiceUsage": 0.8,
    "screenReaderUsage": false
  },
  "sessionId": "session_1701234567890"
}
```

#### Response (200):
```json
{
  "success": true,
  "processed": 15,
  "message": "Analytics data received successfully"
}
```

---

### 8. **GET /api/analytics**
**Purpose:** Analytics data for admin dashboard

#### Response (200):
```json
{
  "userStats": {
    "totalUsers": 1250,
    "activeUsers": 980,
    "newUsersToday": 45,
    "voiceUsers": 750,
    "textUsers": 230
  },
  "accessibilityStats": {
    "visualSupport": 320,
    "motorSupport": 150,
    "cognitiveSupport": 200,
    "hearingSupport": 80
  },
  "transactionStats": {
    "totalVolume": 2500000,
    "successRate": 98.5,
    "avgTransactionValue": 12500
  },
  "languageStats": {
    "en": 60,
    "pcm": 25, 
    "yo": 8,
    "ig": 4,
    "ha": 3
  }
}
```

---

## MongoDB Database Schema

### Users Collection (Mongoose Schema)
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  profileId: { type: String, unique: true, required: true },
  userId: { type: String },
  name: { type: String },
  phone: { type: String },
  language: { 
    type: String, 
    required: true, 
    enum: ['en', 'pcm', 'yo', 'ig', 'ha'] 
  },
  interactionMode: { 
    type: String, 
    required: true, 
    enum: ['voice', 'text'] 
  },
  disabilities: [{ 
    type: String, 
    enum: ['visual', 'hearing', 'motor', 'cognitive', 'speech'] 
  }],
  cognitiveScore: { type: Number, min: 1, max: 10 },
  uiComplexity: { 
    type: String, 
    required: true, 
    enum: ['simplified', 'moderate', 'detailed'] 
  },
  accessibilityPreferences: {
    fontSize: { type: Number, min: 14, max: 24 },
    contrast: { type: String, enum: ['normal', 'high'] },
    ttsSpeed: { type: Number, min: 0.5, max: 2.0 },
    largeTargets: { type: Boolean },
    captions: { type: Boolean },
    font: { type: String, enum: ['inter', 'atkinson'] }
  },
  confirmMode: { 
    type: String, 
    required: true, 
    enum: ['pin', 'voice', 'biometric'] 
  },
  isOnboardingComplete: { type: Boolean, default: false }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
```

### Transactions Collection (Mongoose Schema)
```javascript
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, required: true },
  userProfileId: { type: String, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  recipient: { type: String },
  recipientAccount: { type: String },
  account: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  reference: { type: String },
  narration: { type: String }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Transaction', transactionSchema);
```

### Bills Collection (Mongoose Schema)
```javascript
const mongoose = require('mongoose');

const billPaymentSchema = new mongoose.Schema({
  paymentId: { type: String, unique: true, required: true },
  userProfileId: { type: String, ref: 'User', required: true },
  providerId: { type: String, required: true },
  accountNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  reference: { type: String },
  provider: {
    name: { type: String },
    category: { type: String, enum: ['electricity', 'water', 'internet', 'phone', 'tv'] }
  },
  saveForLater: { type: Boolean, default: false },
  nickname: { type: String }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('BillPayment', billPaymentSchema);
```

---

## Implementation Steps

### 1. **Project Setup**
```bash
mkdir 4all-backend
cd 4all-backend
npm init -y

# Install dependencies
npm install express cors helmet morgan dotenv
npm install mongoose
npm install jsonwebtoken bcryptjs
npm install @google-cloud/aiplatform
npm install --save-dev nodemon

# Create folder structure
mkdir src routes models middleware controllers config
```

### 2. **Environment Variables (.env)**
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/4all_db
JWT_SECRET=your_super_secure_jwt_secret_key_here
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Google Gemini AI Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
GEMINI_MODEL_NAME=gemini-1.5-flash
GEMINI_LOCATION=us-central1
```

### 3. **Basic Server Setup (src/app.js)**
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/profile', require('./routes/profile'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = app;
```

### 4. **Profile Route Example (routes/profile.js)**
```javascript
const express = require('express');
const User = require('../models/User');
const router = express.Router();

// POST /api/profile/detect
router.post('/detect', async (req, res) => {
  try {
    const { language, disabilities, cognitiveScore, interactionMode } = req.body;
    
    // Implement the exact logic from above
    const profile = generateProfile(req.body);
    
    // Optionally save to database
    // const savedProfile = await User.create(profile);
    
    res.json(profile);
  } catch (error) {
    console.error('Profile detection error:', error);
    res.status(500).json({ error: 'Profile detection failed' });
  }
});

// POST /api/profile  
router.post('/', async (req, res) => {
  try {
    // Save or update complete profile
    const profile = await User.findOneAndUpdate(
      { profileId: req.body.profileId },
      req.body,
      { upsert: true, new: true }
    );
    
    res.json({ 
      success: true, 
      profileId: req.body.profileId,
      message: 'Profile saved successfully' 
    });
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// GET /api/profile/:profileId
router.get('/:profileId', async (req, res) => {
  try {
    const profile = await User.findOne({ profileId: req.params.profileId });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(404).json({ error: 'Profile not found' });
  }
});

module.exports = router;
```

---

## Testing Requirements

### Test these exact scenarios:

1. **Visual Impairment User:**
   ```bash
   curl -X POST http://localhost:3001/api/profile/detect \
   -H "Content-Type: application/json" \
   -d '{"language":"en","disabilities":["visual"],"cognitiveScore":6,"interactionMode":"voice"}'
   
   # Should return: fontSize >= 20, contrast: "high", largeTargets: true
   ```

2. **Motor Impairment User:**
   ```bash
   curl -X POST http://localhost:3001/api/profile/detect \
   -H "Content-Type: application/json" \
   -d '{"language":"en","disabilities":["motor"],"cognitiveScore":5,"interactionMode":"voice"}'
   
   # Should return: confirmMode: "voice", largeTargets: true
   ```

3. **Cognitive Support User:**
   ```bash
   curl -X POST http://localhost:3001/api/profile/detect \
   -H "Content-Type: application/json" \
   -d '{"language":"pcm","disabilities":["cognitive"],"cognitiveScore":3,"interactionMode":"text"}'
   
   # Should return: uiComplexity: "simplified", fontSize >= 18
   ```

---

## Deployment Notes

- **Port:** Frontend expects backend on `http://localhost:3001`
- **CORS:** Must allow `http://localhost:3000` (frontend)
- **Response Time:** Keep under 200ms for profile detection
- **Error Handling:** Always return JSON, never HTML error pages

---

## Critical Success Criteria

✅ **Field names MUST match the TypeScript interface exactly**  
✅ **POST /api/profile/detect logic MUST implement the exact adaptation rules**  
✅ **Response times under 200ms**  
✅ **All endpoints return proper JSON with correct HTTP status codes**  
✅ **CORS configured for frontend communication**

**The frontend is 100% complete and expects these exact APIs. Do not add extra fields or change the data structure.**