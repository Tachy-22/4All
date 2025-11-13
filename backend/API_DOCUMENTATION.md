# 4All Banking API - Complete Documentation

## Base URL
```
http://localhost:3001
```

## Authentication
Currently, the API does not require authentication. In production, implement JWT-based authentication.

---

## Endpoints

### 1. Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-10T12:00:00.000Z",
  "service": "4All Banking API",
  "version": "1.0.0"
}
```

---

## Profile Management

### 2. Detect Profile (AI-Powered)

#### POST /api/profile/detect
Generate adaptive accessibility profile using Gemini AI.

**Request Body:**
```json
{
  "language": "en",
  "disabilities": ["visual", "motor"],
  "cognitiveScore": 4,
  "interactionMode": "voice",
  "microInteractions": {
    "preferVoice": true,
    "completionTime": 45.2,
    "errorCount": 2
  }
}
```

**Response:**
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

**AI Logic:**
- Visual impairment → fontSize ≥ 20, high contrast, large targets
- Motor impairment → voice confirm, large targets
- Cognitive impairment or score < 4 → simplified UI, fontSize ≥ 18
- Hearing impairment → captions enabled, avoid voice confirm
- High cognitive score (>7) → detailed UI, smaller fontSize

---

### 3. Save Profile

#### POST /api/profile
Save or update complete user profile.

**Request Body:**
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

**Response:**
```json
{
  "success": true,
  "profileId": "p_1701234567890",
  "message": "Profile saved successfully"
}
```

---

### 4. Get Profile

#### GET /api/profile/:profileId
Retrieve user profile by ID.

**Response:**
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

### 5. Update Profile

#### PUT /api/profile/:profileId
Update existing profile.

**Request Body:**
```json
{
  "name": "Ada Okafor Updated",
  "accessibilityPreferences": {
    "fontSize": 22
  }
}
```

**Response:**
```json
{
  "success": true,
  "profile": { /* updated profile */ },
  "message": "Profile updated successfully"
}
```

---

## Transactions

### 6. Get Transactions

#### GET /api/transactions
Retrieve transaction history with filtering and pagination.

**Query Parameters:**
- `limit` (optional): Number of transactions (default: 10)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status ('pending' | 'processing' | 'completed' | 'failed' | 'cancelled')
- `type` (optional): Filter by type ('transfer' | 'bill_payment' | 'deposit' | 'withdrawal')
- `profileId` (optional): Filter by user profile ID

**Example:**
```
GET /api/transactions?limit=10&offset=0&status=completed
```

**Response:**
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
        "confirmationMethod": "voice"
      }
    }
  ],
  "total": 25,
  "hasMore": true
}
```

---

### 7. Create Transaction

#### POST /api/transactions
Create new transaction (transfer).

**Request Body:**
```json
{
  "type": "transfer",
  "amount": 5000,
  "recipient": "Ada Okafor",
  "recipientAccount": "2051234567",
  "account": "savings",
  "description": "Rent payment",
  "narration": "Monthly rent",
  "profileId": "p_1701234567890",
  "confirmationMethod": "voice"
}
```

**Response (Success):**
```json
{
  "success": true,
  "transaction": {
    "id": "txn_1701234567890",
    "type": "transfer",
    "status": "completed",
    "amount": 5000,
    "currency": "NGN",
    "recipient": "Ada Okafor",
    "sender": "Current User",
    "description": "Rent payment",
    "reference": "TRF/2024/123",
    "timestamp": 1704902400000,
    "timeline": [ /* ... */ ],
    "metadata": { /* ... */ }
  },
  "message": "Transaction initiated successfully"
}
```

---

## Bill Payments

### 8. Process Bill Payment

#### POST /api/bills
Process bill payment.

**Request Body:**
```json
{
  "providerId": "electricity_provider_001",
  "accountNumber": "1234567890",
  "amount": 5000,
  "saveForLater": true,
  "nickname": "Home Electricity",
  "profileId": "p_1701234567890"
}
```

**Response (Success):**
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

**Response (Failed):**
```json
{
  "success": false,
  "error": "Payment failed",
  "details": "Insufficient balance",
  "payment": {
    "id": "bill_1701234567890",
    "status": "failed"
  }
}
```

---

### 9. Get Bill Payments

#### GET /api/bills
Get bill payment history.

**Query Parameters:**
- `limit` (optional): Number of payments (default: 10)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status
- `profileId` (optional): Filter by user profile ID

---

## Analytics

### 10. Send Analytics Events

#### POST /api/analytics
Receive and store analytics events from frontend.

**Request Body:**
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
    "voiceUsage": 0.8
  },
  "sessionId": "session_1701234567890"
}
```

**Response:**
```json
{
  "success": true,
  "processed": 2,
  "message": "Analytics data received successfully"
}
```

---

### 11. Get Analytics Dashboard

#### GET /api/analytics
Get aggregated analytics for admin dashboard.

**Response:**
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

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

