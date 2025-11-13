# 4All Backend - Complete Setup Guide

## 🎯 Quick Start (5 Minutes)

### Step 1: Install MongoDB

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Windows:**
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### Step 2: Install Dependencies
```bash
cd backend
npm install
```

### Step 3: Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env file (optional - works without Gemini API key)
nano .env
```

### Step 4: Start the Server
```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════════════════════╗
║        🏦  4All Inclusive Banking API Server          ║
╚════════════════════════════════════════════════════════╝

🚀 Server running on port 3001
✅ MongoDB Connected: localhost
```

## 🔑 Getting Gemini API Key (Optional)

The backend works WITHOUT a Gemini API key using intelligent rule-based fallback logic. However, for enhanced AI-powered profile detection:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key
5. Add to `.env`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
6. Restart the server

## 🧪 Testing the API

### Test 1: Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-10T12:00:00.000Z",
  "service": "4All Banking API",
  "version": "1.0.0"
}
```

### Test 2: Profile Detection (Visual Impairment)
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

Expected: `fontSize >= 20`, `contrast: "high"`, `largeTargets: true`

### Test 3: Profile Detection (Motor Impairment)
```bash
curl -X POST http://localhost:3001/api/profile/detect \
  -H "Content-Type: application/json" \
  -d '{
    "language": "en",
    "disabilities": ["motor"],
    "cognitiveScore": 5,
    "interactionMode": "voice"
  }'
```

Expected: `confirmMode: "voice"`, `largeTargets: true`

### Test 4: Profile Detection (Cognitive Support)
```bash
curl -X POST http://localhost:3001/api/profile/detect \
  -H "Content-Type: application/json" \
  -d '{
    "language": "pcm",
    "disabilities": ["cognitive"],
    "cognitiveScore": 3,
    "interactionMode": "text"
  }'
```

Expected: `uiComplexity: "simplified"`, `fontSize >= 18`

### Test 5: Create Transaction
```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "transfer",
    "amount": 5000,
    "recipient": "Ada Okafor",
    "account": "savings",
    "description": "Test transfer"
  }'
```

### Test 6: Bill Payment
```bash
curl -X POST http://localhost:3001/api/bills \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "electricity_provider_001",
    "accountNumber": "1234567890",
    "amount": 5000
  }'
```

## 🔗 Connecting Frontend to Backend

The frontend is configured to call Next.js API routes at `/api/*`. To connect to this backend:

### Option 1: Update Frontend API Calls (Recommended)
Update frontend API calls to point to `http://localhost:3001/api/*` instead of `/api/*`

### Option 2: Use Proxy in Next.js
Add to `frontend/next.config.ts`:
```typescript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:3001/api/:path*',
    },
  ];
}
```

## 🚨 Troubleshooting

### Issue: MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb
```

### Issue: Port 3001 Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3002
```

### Issue: Gemini API Errors
The system automatically falls back to rule-based logic if Gemini fails. Check:
1. API key is correct in `.env`
2. You have internet connection
3. Check console for specific error messages

### Issue: CORS Errors
Make sure `CORS_ORIGIN` in `.env` matches your frontend URL:
```env
CORS_ORIGIN=http://localhost:3000
```

## 📊 Database Management

### View Database Contents
```bash
# Connect to MongoDB
mongosh

# Switch to database
use 4all_db

# View collections
show collections

# View users
db.users.find().pretty()

# View transactions
db.transactions.find().pretty()

# Clear all data (for testing)
db.users.deleteMany({})
db.transactions.deleteMany({})
db.billpayments.deleteMany({})
db.analyticsevents.deleteMany({})
```

## 🎯 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/4all_db
CORS_ORIGIN=https://your-frontend-domain.com
GEMINI_API_KEY=your_production_api_key
```

### Recommended Hosting Platforms
- **Backend**: Render, Railway, Heroku, DigitalOcean
- **Database**: MongoDB Atlas (free tier available)

## 📝 Next Steps

1. ✅ Backend is running
2. ✅ Test all endpoints
3. 🔄 Connect frontend to backend
4. 🧪 Test full user flow
5. 🚀 Deploy to production

## 💡 Tips

- Use `npm run dev` for development (auto-reload)
- Use `npm start` for production
- Check server logs for debugging
- MongoDB data persists between restarts
- Gemini AI is optional but recommended for best results

