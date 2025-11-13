# Frontend Integration Guide

## 🔗 Connecting Frontend to Backend

The frontend currently uses Next.js API routes (`frontend/app/api/*`) as mock endpoints. To connect to the real backend:

## Option 1: Update Frontend API Calls (Recommended)

### Step 1: Create API Configuration File

Create `frontend/lib/api-config.ts`:
```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  profile: {
    detect: `${API_BASE_URL}/api/profile/detect`,
    save: `${API_BASE_URL}/api/profile`,
    get: (id: string) => `${API_BASE_URL}/api/profile/${id}`,
  },
  transactions: {
    list: `${API_BASE_URL}/api/transactions`,
    create: `${API_BASE_URL}/api/transactions`,
  },
  bills: {
    pay: `${API_BASE_URL}/api/bills`,
    list: `${API_BASE_URL}/api/bills`,
  },
  analytics: {
    send: `${API_BASE_URL}/api/analytics`,
    get: `${API_BASE_URL}/api/analytics`,
  },
};
```

### Step 2: Update Frontend API Calls

Find and replace API calls in your frontend components:

**Before:**
```typescript
const response = await fetch('/api/profile/detect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

**After:**
```typescript
import { API_ENDPOINTS } from '@/lib/api-config';

const response = await fetch(API_ENDPOINTS.profile.detect, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### Step 3: Add Environment Variable

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Option 2: Use Next.js Proxy (Alternative)

Update `frontend/next.config.ts`:
```typescript
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
```

This way, frontend calls to `/api/*` will automatically proxy to the backend.

## 🧪 Testing the Integration

### 1. Start Backend
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 3001
✅ MongoDB Connected: localhost
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Profile Detection

Open browser console and run:
```javascript
fetch('http://localhost:3001/api/profile/detect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    language: 'en',
    disabilities: ['visual'],
    cognitiveScore: 6,
    interactionMode: 'voice'
  })
})
.then(r => r.json())
.then(console.log);
```

Expected response:
```json
{
  "profileId": "p_...",
  "language": "en",
  "uiComplexity": "moderate",
  "accessibilityPreferences": {
    "fontSize": 20,
    "contrast": "high",
    "largeTargets": true,
    ...
  }
}
```

## 🔍 Debugging CORS Issues

If you see CORS errors:

### 1. Check Backend CORS Configuration
In `backend/.env`:
```env
CORS_ORIGIN=http://localhost:3000
```

### 2. Verify Frontend URL
Make sure frontend is running on `http://localhost:3000`

### 3. Check Browser Console
Look for specific CORS error messages

### 4. Test with curl
```bash
curl -X POST http://localhost:3001/api/profile/detect \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"language":"en","disabilities":["visual"],"cognitiveScore":6}'
```

## 📋 API Endpoint Mapping

| Frontend Call | Backend Endpoint | Method |
|--------------|------------------|--------|
| `/api/profile` (POST) | `/api/profile/detect` | POST |
| `/api/profile` (GET) | `/api/profile/:id` | GET |
| `/api/transactions` | `/api/transactions` | GET/POST |
| `/api/bills` | `/api/bills` | POST |
| `/api/analytics` | `/api/analytics` | POST/GET |

## 🎯 Key Differences to Note

### 1. Profile Detection Endpoint
- **Frontend mock**: `/api/profile` (POST)
- **Backend real**: `/api/profile/detect` (POST)

You may need to update the frontend to call `/api/profile/detect` instead.

### 2. Response Format
The backend returns the exact same format as the frontend mocks, so no changes needed to response handling.

### 3. Error Handling
Backend returns consistent error format:
```json
{
  "error": "Error message",
  "details": "Detailed description"
}
```

## 🚀 Production Deployment

### Backend
Deploy to: Render, Railway, Heroku, or DigitalOcean

Environment variables needed:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
CORS_ORIGIN=https://your-frontend-domain.com
GEMINI_API_KEY=your_api_key
```

### Frontend
Update `NEXT_PUBLIC_API_URL` to your backend URL:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

## 📝 Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] MongoDB connected
- [ ] CORS configured correctly
- [ ] API calls updated to use backend URL
- [ ] Test profile detection endpoint
- [ ] Test transaction creation
- [ ] Test bill payment
- [ ] Test analytics submission

## 🆘 Common Issues

### Issue: "Failed to fetch"
**Solution**: Make sure backend is running on port 3001

### Issue: CORS error
**Solution**: Check `CORS_ORIGIN` in backend `.env` matches frontend URL

### Issue: 404 Not Found
**Solution**: Verify endpoint URL is correct (e.g., `/api/profile/detect` not `/api/profile`)

### Issue: MongoDB connection failed
**Solution**: Start MongoDB service:
```bash
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Linux
```

## 💡 Tips

1. **Use browser DevTools Network tab** to inspect API calls
2. **Check backend console** for request logs
3. **Test endpoints with curl** before integrating
4. **Use Postman** for complex API testing
5. **Enable CORS in development** for easier debugging

## 🎉 Success!

Once integrated, your frontend will:
- ✅ Use real Gemini AI for profile detection
- ✅ Store data in MongoDB
- ✅ Have persistent transactions and profiles
- ✅ Collect real analytics data
- ✅ Support all accessibility features with AI-powered adaptations

