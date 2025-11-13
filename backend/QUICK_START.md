# 🚀 Quick Start Guide - 4All Backend

## ⚡ 5-Minute Setup

### 1. Install MongoDB (if not already installed)

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

**Windows:**
Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Start the Server
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

### 4. Test It Works
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"...","service":"4All Banking API","version":"1.0.0"}
```

## ✅ You're Done!

The backend is now running with:
- ✅ All API endpoints active
- ✅ MongoDB connected
- ✅ Gemini AI integration (with intelligent fallback)
- ✅ CORS configured for frontend

## 🔑 Optional: Add Gemini API Key

For enhanced AI-powered profile detection:

1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Edit `backend/.env`:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Restart server: `npm run dev`

**Note:** The system works perfectly without Gemini API key using intelligent rule-based logic!

## 🧪 Test the API

### Profile Detection (Visual Impairment)
```bash
curl -X POST http://localhost:3001/api/profile/detect \
  -H "Content-Type: application/json" \
  -d '{"language":"en","disabilities":["visual"],"cognitiveScore":6,"interactionMode":"voice"}'
```

Expected: `fontSize: 20`, `contrast: "high"`, `largeTargets: true`

### Create Transaction
```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"type":"transfer","amount":5000,"recipient":"Ada Okafor","description":"Test"}'
```

### Bill Payment
```bash
curl -X POST http://localhost:3001/api/bills \
  -H "Content-Type: application/json" \
  -d '{"providerId":"electricity_provider_001","accountNumber":"1234567890","amount":5000}'
```

## 📚 Available Endpoints

```
GET  /health                    - Health check
POST /api/profile/detect        - AI profile detection
POST /api/profile               - Save profile
GET  /api/profile/:id           - Get profile
GET  /api/transactions          - List transactions
POST /api/transactions          - Create transaction
POST /api/bills                 - Pay bill
GET  /api/bills                 - List bills
POST /api/analytics             - Send analytics
GET  /api/analytics             - Get analytics
```

## 🔗 Connect to Frontend

See `FRONTEND_INTEGRATION.md` for detailed instructions.

Quick version:
1. Frontend should call `http://localhost:3001/api/*`
2. Make sure CORS is configured (already done!)
3. Test with browser DevTools Network tab

## 🆘 Troubleshooting

### MongoDB not connecting?
```bash
# Check if MongoDB is running
mongosh

# If not, start it
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Linux
```

### Port 3001 already in use?
```bash
# Find and kill the process
lsof -i :3001
kill -9 <PID>
```

### Want to see sample data?
```bash
npm run seed
```

## 📖 More Documentation

- `README.md` - Full documentation
- `SETUP.md` - Detailed setup guide
- `API_DOCUMENTATION.md` - Complete API reference
- `IMPLEMENTATION_SUMMARY.md` - What's been built
- `FRONTEND_INTEGRATION.md` - Connect to frontend

## 🎯 What's Working

✅ **Real Gemini AI Integration** - Not mock data!
✅ **MongoDB Persistence** - Data is saved
✅ **All Endpoints** - Profile, transactions, bills, analytics
✅ **CORS Configured** - Ready for frontend
✅ **Error Handling** - Comprehensive error responses
✅ **Intelligent Fallback** - Works with or without Gemini API

## 🎉 Success!

Your backend is ready to power the 4All inclusive banking application!

**Next Steps:**
1. ✅ Backend running
2. 🔄 Connect frontend (see FRONTEND_INTEGRATION.md)
3. 🧪 Test full user flow
4. 🚀 Deploy to production

---

**Need help?** Check the other documentation files or the server logs for debugging.

