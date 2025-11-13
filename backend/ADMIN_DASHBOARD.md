# 🎨 4All Admin Analytics Dashboard

## Overview

The Admin Analytics Dashboard is a comprehensive web interface for bank administrators to manage users, analyze accessibility engagement, track emotional analytics, create promotional campaigns, and receive AI-driven recommendations.

## 🚀 Quick Start

### Access the Dashboard

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Open the dashboard:**
   Navigate to: **http://localhost:3001/admin**

## 📊 Dashboard Features

### 1. **Overview Section** (Default View)

**Key Metrics:**
- Total Users
- Active Users (last 7 days)
- Total Transactions
- Avg. Satisfaction Score

**Visualizations:**
- **Disability Distribution** (Doughnut Chart) - Shows breakdown of users by disability type
- **Cognitive Score Distribution** (Bar Chart) - Shows users across cognitive score ranges

**Inclusion Metrics:**
- Voice Interaction Adoption
- Pidgin Language Users
- High Contrast Users
- Large Target Users

### 2. **Users Section**

**Features:**
- **User Table** with columns:
  - Name
  - Profile ID
  - Language
  - Disabilities (badges)
  - Cognitive Score
  - UI Complexity
  - Actions (View Details button)

- **Search Functionality** - Filter users by name or profile ID
- **User Detail Modal** - Click "View" to see complete user profile including:
  - Basic info (name, language, interaction mode)
  - Accessibility preferences (font size, contrast, TTS speed, etc.)

### 3. **Segments Section**

**User Segmentation by:**
- **Disability Type** - Visual, Motor, Cognitive, Hearing, Speech
- **UI Complexity** - Simple, Moderate, Advanced
- **Language** - EN, PCM, HA, IG, YO
- **Interaction Mode** - Voice, Text, Hybrid

Each segment shows the count of users in that category.

### 4. **Emotions Section**

**Features:**
- **Emotional Distribution Chart** (Pie Chart) - Shows breakdown of user emotional states
- **Emotion Statistics** - List of emotions with user counts and emoji icons
- **Frustrated Users Alert** - Shows users needing immediate support (if any)

**Tracked Emotions:**
- Satisfied 😊
- Happy 😄
- Neutral 😐
- Frustrated 😤
- Stressed 😰
- Confused 😕

### 5. **Promotions Section**

**Features:**
- **Campaign Grid** - View all promotional campaigns
- **Create Campaign Button** - Opens modal to create new promotion
- **Campaign Cards** show:
  - Title and status badge (Scheduled, Active, Ended, Paused)
  - Description
  - Target segment
  - Start date
  - Edit and Delete actions

**Create Promotion Modal:**
- Campaign Title
- Description
- Target Segment (dropdown)
- Campaign Type (Savings, Loan, Investment, Cashback, Education)
- Offer Details
- Start Date
- End Date

### 6. **Recommendations Section**

**AI-Driven Recommendations:**
- Operational insights from AI analysis
- Priority badges (High, Medium, Low)
- Actionable suggestions for improving user experience
- "Take Action" buttons for each recommendation

## 🔧 Technical Details

### Frontend Stack
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with CSS variables, flexbox, grid
- **Vanilla JavaScript** - No frameworks, pure JS for simplicity
- **Chart.js** - Data visualization library
- **Font Awesome** - Icons

### Backend Integration

**API Endpoints Used:**
```
GET  /api/dashboard/overview          - Dashboard statistics
GET  /api/dashboard/user-segments     - User segmentation data
GET  /api/dashboard/recommendations   - AI recommendations
GET  /api/profile                     - All user profiles
GET  /api/profile/:profileId          - Single user details
GET  /api/promotions                  - All campaigns
POST /api/promotions                  - Create campaign
PUT  /api/promotions/:id              - Update campaign
DELETE /api/promotions/:id            - Delete campaign
```

### File Structure
```
backend/public/admin/
├── index.html           # Main dashboard HTML
├── css/
│   └── dashboard.css    # Complete styling (1001 lines)
└── js/
    └── dashboard.js     # Dashboard logic (843 lines)
```

## 🎨 Design Features

### Responsive Design
- **Desktop** (>1024px) - Full sidebar, multi-column layouts
- **Tablet** (768px-1024px) - Adjusted grid layouts
- **Mobile** (<768px) - Stacked layouts, collapsible sidebar

### Accessibility
- High contrast colors
- Large click targets (min 44x44px)
- Keyboard navigation support
- Screen reader friendly
- ARIA labels and roles

### Color Scheme
- **Primary:** #6366f1 (Indigo)
- **Secondary:** #8b5cf6 (Purple)
- **Success:** #10b981 (Green)
- **Warning:** #f59e0b (Amber)
- **Danger:** #ef4444 (Red)

## 📈 Usage Examples

### Viewing User Details
1. Navigate to "Users" section
2. Use search box to find specific user
3. Click "View" button on any user row
4. Modal opens with complete profile details

### Creating a Campaign
1. Navigate to "Promotions" section
2. Click "Create Campaign" button
3. Fill in campaign details:
   - Title: "Summer Savings Boost"
   - Target: "visual" (users with visual disabilities)
   - Type: "savings"
   - Offer: "5% bonus interest for 3 months"
   - Dates: Set start and end dates
4. Click "Create Campaign"
5. Campaign appears in the grid

### Analyzing Emotions
1. Navigate to "Emotions" section
2. View pie chart showing emotional distribution
3. Check emotion statistics for detailed counts
4. Review "Frustrated Users" section for users needing support

## 🔄 Real-Time Updates

The dashboard includes:
- **Time Range Selector** - View data for 7, 30, or 90 days
- **Refresh Button** - Manually refresh all data
- **Auto-refresh** - Can be implemented for live updates

## 🚨 Troubleshooting

### Dashboard not loading?
- Ensure backend server is running on port 3001
- Check browser console for errors
- Verify MongoDB is connected

### Charts not displaying?
- Check that Chart.js CDN is accessible
- Verify API endpoints are returning data
- Check browser console for JavaScript errors

### No data showing?
- Run sample data script: `node src/utils/sampleData.js`
- Verify MongoDB connection
- Check API responses in Network tab

## 🎯 Next Steps

**Potential Enhancements:**
1. Add authentication/authorization
2. Implement real-time WebSocket updates
3. Add export functionality (CSV, PDF)
4. Create custom date range picker
5. Add campaign performance metrics
6. Implement user messaging system
7. Add notification system for alerts
8. Create detailed analytics reports

## 📝 Notes

- Dashboard is served as static files from `backend/public/admin`
- All data is fetched from REST API endpoints
- No database queries from frontend
- Fully responsive and accessible design
- Production-ready with proper error handling

---

**Built with ❤️ for 4All Inclusive Banking**

