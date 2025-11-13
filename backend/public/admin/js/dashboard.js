// Configuration
const API_BASE_URL = "http://localhost:3001/api";
let currentTimeRange = "30d";
let dashboardData = null;
let charts = {};

// Initialize Dashboard
document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  initializeTimeRange();
  initializeModals();
  initializeRefresh();
  initializeQuickAccess();
  initializeExport();
  loadDashboardData();
});

// Navigation
function initializeNavigation() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      // Update active nav item
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");

      // Show corresponding section
      const section = item.dataset.section;
      showSection(section);
    });
  });
}

function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active");
  });

  // Show selected section
  const section = document.getElementById(`${sectionName}-section`);
  if (section) {
    section.classList.add("active");
  }

  // Update page title
  const titles = {
    overview: {
      title: "Dashboard Overview",
      subtitle: "AI-driven inclusive intelligence for Zenith Bank",
    },
    "user-insights": {
      title: "User Insights Panel",
      subtitle:
        "Live segmented profiles, emotional metrics, and high-risk alerts",
    },
    "banking-activity": {
      title: "Core Banking Activity Overview",
      subtitle: "Account activity, SME tracking, and life event signals",
    },
    offers: {
      title: "Offers & Promotions Effectiveness",
      subtitle: "Campaign performance and acceptance rates by segment",
    },
    "ai-recommendations": {
      title: "AI Recommendation Feed",
      subtitle:
        "Predictive & prescriptive actions with plain language rationale",
    },
    "emotional-analytics": {
      title: "Emotional Analytics Dashboard",
      subtitle: "Sentiment tracking, frustration metrics, and trust recovery",
    },
    accessibility: {
      title: "Accessibility & Inclusion Metrics",
      subtitle: "Disability engagement and inclusive campaign performance",
    },
    marketing: {
      title: "Marketing & Campaign Insights",
      subtitle: "AI-suggested campaigns, A/B testing, and ROI predictions",
    },
    alerts: {
      title: "Operational Alerts & Reports",
      subtitle: "Real-time insights into inclusive banking",
    },
    users: {
      title: "User Management",
      subtitle: "Manage and support your users",
    },
    segments: { title: "User Segments", subtitle: "Analyze user segmentation" },
    emotions: {
      title: "Emotional Analytics",
      subtitle: "Track user emotional states",
    },
    promotions: {
      title: "Campaign Management",
      subtitle: "Create and manage promotional campaigns",
    },
    recommendations: {
      title: "AI Recommendations",
      subtitle: "AI-driven operational insights",
    },
  };

  if (titles[sectionName]) {
    document.getElementById("page-title").textContent =
      titles[sectionName].title;
    document.getElementById("page-subtitle").textContent =
      titles[sectionName].subtitle;
  }

  // Load section-specific data
  loadSectionData(sectionName);
}

// Time Range
function initializeTimeRange() {
  const timeButtons = document.querySelectorAll(".time-btn");

  timeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      timeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentTimeRange = btn.dataset.range;
      loadDashboardData();
    });
  });
}

// Refresh
function initializeRefresh() {
  document.getElementById("refresh-data").addEventListener("click", () => {
    loadDashboardData();
  });
}

// Quick Access Navigation
function initializeQuickAccess() {
  const quickAccessCards = document.querySelectorAll(".quick-access-card");
  quickAccessCards.forEach((card) => {
    card.addEventListener("click", () => {
      const targetSection = card.dataset.navigate;
      if (targetSection) {
        // Update navigation
        document.querySelectorAll(".nav-item").forEach((nav) => {
          nav.classList.remove("active");
          if (nav.dataset.section === targetSection) {
            nav.classList.add("active");
          }
        });
        // Show section
        showSection(targetSection);
      }
    });
  });
}

// Export Functionality
function initializeExport() {
  const exportBtn = document.getElementById("export-data");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      exportDashboardData();
    });
  }
}

function exportDashboardData() {
  if (!dashboardData) {
    alert("No data to export. Please wait for data to load.");
    return;
  }

  // Create CSV content
  const csvContent = generateCSV(dashboardData);

  // Create download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `4all-dashboard-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function generateCSV(data) {
  let csv = "4All Dashboard Export\n";
  csv += `Generated: ${new Date().toLocaleString()}\n`;
  csv += `Time Range: ${currentTimeRange}\n\n`;

  csv += "User Insights\n";
  csv += `Total Users,${data.userInsights?.total || 0}\n`;
  csv += `Active Users,${data.userInsights?.active || 0}\n\n`;

  csv += "Disability Distribution\n";
  csv += "Type,Count\n";
  (data.userInsights?.disabilitySegmentation || []).forEach((seg) => {
    csv += `${seg._id},${seg.count}\n`;
  });

  csv += "\nEmotional Insights\n";
  csv += "Emotion,Count\n";
  (data.emotionalInsights || []).forEach((emotion) => {
    csv += `${emotion._id},${emotion.count}\n`;
  });

  return csv;
}

// Load Dashboard Data
async function loadDashboardData() {
  try {
    showLoading();

    // Fetch overview data
    const response = await fetch(
      `${API_BASE_URL}/dashboard/overview?timeRange=${currentTimeRange}`
    );
    dashboardData = await response.json();

    // Update overview section
    updateOverviewStats();
    updateCharts();
    updateInclusionMetrics();

    hideLoading();
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    showError("Failed to load dashboard data");
  }
}

// Update Overview Stats
function updateOverviewStats() {
  if (!dashboardData) return;

  const {
    userInsights,
    transactionHealth,
    emotionalInsights,
    inclusionMetrics,
  } = dashboardData;

  // Update main stat cards
  document.getElementById("total-users").textContent = userInsights.total || 0;

  // Calculate engagement rate (active users / total users)
  const engagementRate =
    userInsights.total > 0
      ? Math.round((userInsights.active / userInsights.total) * 100)
      : 0;
  document.getElementById("engagement-rate").textContent = `${engagementRate}%`;

  // Calculate trust score (satisfied + happy users / total emotional events)
  const totalEmotions = emotionalInsights.reduce((sum, e) => sum + e.count, 0);
  const positiveEmotions = emotionalInsights
    .filter((e) => ["satisfied", "happy", "confident"].includes(e._id))
    .reduce((sum, e) => sum + e.count, 0);
  const trustScore =
    totalEmotions > 0
      ? Math.round((positiveEmotions / totalEmotions) * 100)
      : 0;
  document.getElementById("trust-score").textContent = `${trustScore}%`;

  // Inclusivity score (users with accessibility features / total users)
  const inclusivityScore = inclusionMetrics?.percentageOfTotal || 0;
  document.getElementById("inclusivity-score").textContent = `${Math.round(
    inclusivityScore
  )}%`;

  // Update changes (mock for now)
  document.getElementById("users-change").textContent = "+12%";
  document.getElementById("engagement-change").textContent = "+8%";
  document.getElementById("trust-change").textContent = "+5%";
  document.getElementById("inclusivity-change").textContent = "+3%";

  // Update quick access stats
  const frustratedUsers =
    emotionalInsights.find((e) => e._id === "frustrated")?.count || 0;
  document.getElementById("qa-high-risk").textContent = frustratedUsers;
  document.getElementById("qa-transactions").textContent =
    transactionHealth.total || 0;
  document.getElementById("qa-frustrated").textContent = frustratedUsers;
  document.getElementById("qa-recommendations").textContent = "5"; // Mock data
}

// Update Charts
function updateCharts() {
  if (!dashboardData) return;

  // Destroy existing charts
  Object.values(charts).forEach((chart) => {
    if (chart && typeof chart.destroy === "function") {
      chart.destroy();
    }
  });
  charts = {};

  // Overview Charts
  createOverviewDisabilityChart();
  createOverviewEmotionChart();
  createOverviewModeChart();
}

// Overview Chart Functions
function createOverviewDisabilityChart() {
  const ctx = document.getElementById("overview-disability-chart");
  if (!ctx) return;

  const disabilities = dashboardData.userInsights.disabilitySegmentation || [];
  const labels = disabilities.map((d) => capitalizeFirst(d._id));
  const data = disabilities.map((d) => d.count);

  // Use accessible color palette
  const colors = ["#0077BB", "#EE7733", "#009988", "#CCBB44", "#CC3311"];

  charts.overviewDisability = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: {
              family: "'Atkinson Hyperlegible', sans-serif",
            },
          },
        },
      },
    },
  });
}

function createOverviewEmotionChart() {
  const ctx = document.getElementById("overview-emotion-chart");
  if (!ctx) return;

  const emotions = dashboardData.emotionalInsights || [];
  const labels = emotions.map((e) => capitalizeFirst(e._id));
  const data = emotions.map((e) => e.count);

  charts.overviewEmotion = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Users",
          data: data,
          backgroundColor: "#E1251B",
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              family: "'Atkinson Hyperlegible', sans-serif",
            },
          },
        },
        x: {
          ticks: {
            font: {
              family: "'Atkinson Hyperlegible', sans-serif",
            },
          },
        },
      },
    },
  });
}

function createOverviewModeChart() {
  const ctx = document.getElementById("overview-mode-chart");
  if (!ctx) return;

  const modes = dashboardData.userInsights.interactionModes || [];
  const labels = modes.map((m) => capitalizeFirst(m._id));
  const data = modes.map((m) => m.count);

  charts.overviewMode = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: ["#E1251B", "#E6B800"],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: {
              family: "'Atkinson Hyperlegible', sans-serif",
            },
          },
        },
      },
    },
  });
}

function createDisabilityChart() {
  const ctx = document.getElementById("disability-chart");
  if (!ctx) return;

  const disabilities = dashboardData.userInsights.disabilitySegmentation || [];

  const labels = disabilities.map((d) => capitalizeFirst(d._id));
  const data = disabilities.map((d) => d.count);
  const colors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

  charts.disability = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

function createCognitiveChart() {
  const ctx = document.getElementById("cognitive-chart");
  if (!ctx) return;

  const cognitive = dashboardData.userInsights.cognitiveDistribution || [];

  const labels = cognitive.map((c) => `Score ${c._id}`);
  const data = cognitive.map((c) => c.count);

  charts.cognitive = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Users",
          data: data,
          backgroundColor: "#6366f1",
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Update Inclusion Metrics
function updateInclusionMetrics() {
  if (!dashboardData) return;

  const { inclusionMetrics } = dashboardData;

  document.getElementById("inclusive-users").textContent =
    inclusionMetrics.totalInclusiveUsers || 0;
  document.getElementById("inclusive-percentage").textContent = `${
    inclusionMetrics.percentageOfTotal || 0
  }%`;
  document.getElementById("engagement-rate").textContent = `${
    inclusionMetrics.engagementRate || 0
  }%`;
  document.getElementById("satisfaction-score").textContent = (
    inclusionMetrics.satisfactionScore || 0
  ).toFixed(1);
}

// Load Section Data
async function loadSectionData(section) {
  switch (section) {
    case "overview":
      // Already loaded in loadDashboardData
      break;
    case "user-insights":
      await loadUserInsights();
      break;
    case "banking-activity":
      await loadBankingActivity();
      break;
    case "offers-promotions":
      await loadPromotions();
      break;
    case "ai-recommendations":
      await loadRecommendations();
      break;
    case "emotional-analytics":
      await loadEmotionalAnalytics();
      break;
    case "accessibility-metrics":
      await loadAccessibilityMetrics();
      break;
    case "marketing-insights":
      await loadMarketingInsights();
      break;
    case "operational-alerts":
      await loadOperationalAlerts();
      break;
    // Legacy sections
    case "users":
      await loadUsers();
      break;
    case "segments":
      await loadSegments();
      break;
    case "emotions":
      await loadEmotions();
      break;
    case "promotions":
      await loadPromotions();
      break;
    case "recommendations":
      await loadRecommendations();
      break;
  }
}

// New Section Loading Functions
async function loadUserInsights() {
  if (!dashboardData) return;

  const { userInsights, emotionalInsights } = dashboardData;

  // Update segment bars
  updateSegmentBars(userInsights.disabilitySegmentation || []);

  // Update emotional metrics
  updateEmotionalMetrics(emotionalInsights || []);

  // Update interaction modes
  updateInteractionModes(userInsights.interactionModes || []);

  // Update high-risk alerts
  updateHighRiskAlerts(emotionalInsights || []);
}

function updateSegmentBars(disabilities) {
  const total = disabilities.reduce((sum, d) => sum + d.count, 0);

  disabilities.forEach((disability) => {
    const percentage = total > 0 ? (disability.count / total) * 100 : 0;
    const barId = `segment-${disability._id}`;
    const countId = `count-${disability._id}`;

    const barElement = document.getElementById(barId);
    const countElement = document.getElementById(countId);

    if (barElement) {
      barElement.style.width = `${percentage}%`;
    }
    if (countElement) {
      countElement.textContent = disability.count;
    }
  });
}

function updateEmotionalMetrics(emotions) {
  const total = emotions.reduce((sum, e) => sum + e.count, 0);

  emotions.forEach((emotion) => {
    const percentage = total > 0 ? (emotion.count / total) * 100 : 0;
    const metricId = `emotion-${emotion._id}`;

    const metricElement = document.getElementById(metricId);
    if (metricElement) {
      metricElement.textContent = `${Math.round(percentage)}%`;
    }
  });
}

function updateInteractionModes(modes) {
  const total = modes.reduce((sum, m) => sum + m.count, 0);

  modes.forEach((mode) => {
    const percentage = total > 0 ? (mode.count / total) * 100 : 0;
    const modeId = `mode-${mode._id}`;

    const modeElement = document.getElementById(modeId);
    if (modeElement) {
      modeElement.textContent = `${Math.round(percentage)}%`;
    }
  });
}

function updateHighRiskAlerts(emotions) {
  const highRiskEmotions = ["frustrated", "stressed", "anxious"];
  const highRiskCount = emotions
    .filter((e) => highRiskEmotions.includes(e._id))
    .reduce((sum, e) => sum + e.count, 0);

  const alertElement = document.getElementById("high-risk-count");
  if (alertElement) {
    alertElement.textContent = highRiskCount;
  }
}

async function loadBankingActivity() {
  if (!dashboardData) return;

  const { transactionHealth } = dashboardData;

  // Update transaction metrics
  document.getElementById("total-transactions-activity").textContent =
    transactionHealth.total || 0;
  document.getElementById("success-rate-activity").textContent = `${
    transactionHealth.successRate || 0
  }%`;
  document.getElementById("avg-transaction").textContent = `₦${
    transactionHealth.averageAmount || 0
  }`;
}

async function loadEmotionalAnalytics() {
  if (!dashboardData) return;

  const { emotionalInsights } = dashboardData;

  // Create emotion trend chart
  createEmotionTrendChart(emotionalInsights);
}

function createEmotionTrendChart(emotions) {
  const ctx = document.getElementById("emotion-trend-chart");
  if (!ctx) return;

  const labels = emotions.map((e) => capitalizeFirst(e._id));
  const data = emotions.map((e) => e.count);

  if (charts.emotionTrend) {
    charts.emotionTrend.destroy();
  }

  charts.emotionTrend = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Emotional States",
          data: data,
          borderColor: "#E1251B",
          backgroundColor: "rgba(225, 37, 27, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              family: "'Atkinson Hyperlegible', sans-serif",
            },
          },
        },
        x: {
          ticks: {
            font: {
              family: "'Atkinson Hyperlegible', sans-serif",
            },
          },
        },
      },
    },
  });
}

async function loadAccessibilityMetrics() {
  if (!dashboardData) return;

  const { inclusionMetrics } = dashboardData;

  // Update accessibility adoption metrics
  document.getElementById("accessibility-adoption").textContent = `${Math.round(
    inclusionMetrics?.percentageOfTotal || 0
  )}%`;
}

async function loadMarketingInsights() {
  // Mock data for now
  console.log("Loading marketing insights...");
}

async function loadOperationalAlerts() {
  // Mock data for now
  console.log("Loading operational alerts...");
}

// Load Users
async function loadUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`);
    const users = await response.json();

    const tbody = document.getElementById("users-table-body");
    tbody.innerHTML = "";

    if (!users || users.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="empty-state"><i class="fas fa-users"></i><h4>No users found</h4></td></tr>';
      return;
    }

    users.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${user.profileId}</td>
                <td>${user.name || "N/A"}</td>
                <td>${
                  user.disabilities
                    ?.map((d) => `<span class="badge ${d}">${d}</span>`)
                    .join(" ") || "None"
                }</td>
                <td>${user.cognitiveScore || "N/A"}</td>
                <td>${user.language?.toUpperCase() || "N/A"}</td>
                <td>${capitalizeFirst(user.interactionMode) || "N/A"}</td>
                <td><button class="action-btn" onclick="viewUser('${
                  user.profileId
                }')">View</button></td>
            `;
      tbody.appendChild(row);
    });

    // Initialize search
    initializeUserSearch(users);
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

// User Search
function initializeUserSearch(users) {
  const searchInput = document.getElementById("user-search");

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const tbody = document.getElementById("users-table-body");
    const rows = tbody.querySelectorAll("tr");

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) ? "" : "none";
    });
  });
}

// View User
async function viewUser(profileId) {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${profileId}`);
    const user = await response.json();

    const modal = document.getElementById("user-modal");
    const content = document.getElementById("user-detail-content");

    content.innerHTML = `
            <div class="user-detail">
                <h4>${user.name || "User Profile"}</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>Profile ID:</strong>
                        <span>${user.profileId}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Phone:</strong>
                        <span>${user.phone || "N/A"}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Language:</strong>
                        <span>${user.language?.toUpperCase() || "N/A"}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Interaction Mode:</strong>
                        <span>${
                          capitalizeFirst(user.interactionMode) || "N/A"
                        }</span>
                    </div>
                    <div class="detail-item">
                        <strong>Disabilities:</strong>
                        <span>${user.disabilities?.join(", ") || "None"}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Cognitive Score:</strong>
                        <span>${user.cognitiveScore || "N/A"}</span>
                    </div>
                    <div class="detail-item">
                        <strong>UI Complexity:</strong>
                        <span>${
                          capitalizeFirst(user.uiComplexity) || "N/A"
                        }</span>
                    </div>
                    <div class="detail-item">
                        <strong>Confirm Mode:</strong>
                        <span>${
                          capitalizeFirst(user.confirmMode) || "N/A"
                        }</span>
                    </div>
                </div>

                <h5 style="margin-top: 1.5rem; margin-bottom: 1rem;">Accessibility Preferences</h5>
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>Font Size:</strong>
                        <span>${
                          user.accessibilityPreferences?.fontSize || "N/A"
                        }px</span>
                    </div>
                    <div class="detail-item">
                        <strong>Contrast:</strong>
                        <span>${
                          capitalizeFirst(
                            user.accessibilityPreferences?.contrast
                          ) || "N/A"
                        }</span>
                    </div>
                    <div class="detail-item">
                        <strong>TTS Speed:</strong>
                        <span>${
                          user.accessibilityPreferences?.ttsSpeed || "N/A"
                        }x</span>
                    </div>
                    <div class="detail-item">
                        <strong>Large Targets:</strong>
                        <span>${
                          user.accessibilityPreferences?.largeTargets
                            ? "Yes"
                            : "No"
                        }</span>
                    </div>
                    <div class="detail-item">
                        <strong>Captions:</strong>
                        <span>${
                          user.accessibilityPreferences?.captions ? "Yes" : "No"
                        }</span>
                    </div>
                    <div class="detail-item">
                        <strong>Font:</strong>
                        <span>${
                          capitalizeFirst(
                            user.accessibilityPreferences?.font
                          ) || "N/A"
                        }</span>
                    </div>
                </div>
            </div>
        `;

    modal.classList.add("active");
  } catch (error) {
    console.error("Error loading user details:", error);
  }
}

// Load Segments
async function loadSegments() {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/user-segments`);
    const data = await response.json();

    // Disability Segments
    const disabilityContainer = document.getElementById("disability-segments");
    disabilityContainer.innerHTML = "";

    (data.disabilitySegments || []).forEach((segment) => {
      const item = document.createElement("div");
      item.className = "segment-item";
      item.innerHTML = `
                <span class="segment-name">${capitalizeFirst(
                  segment._id
                )}</span>
                <span class="segment-count">${segment.count}</span>
            `;
      disabilityContainer.appendChild(item);
    });

    // UI Complexity Segments
    const uiContainer = document.getElementById("ui-complexity-segments");
    uiContainer.innerHTML = "";

    (data.uiComplexitySegments || []).forEach((segment) => {
      const item = document.createElement("div");
      item.className = "segment-item";
      item.innerHTML = `
                <span class="segment-name">${capitalizeFirst(
                  segment._id
                )}</span>
                <span class="segment-count">${segment.count}</span>
            `;
      uiContainer.appendChild(item);
    });

    // Language Segments
    const langContainer = document.getElementById("language-segments");
    langContainer.innerHTML = "";

    (data.languageSegments || []).forEach((segment) => {
      const item = document.createElement("div");
      item.className = "segment-item";
      item.innerHTML = `
                <span class="segment-name">${segment._id.toUpperCase()}</span>
                <span class="segment-count">${segment.count}</span>
            `;
      langContainer.appendChild(item);
    });

    // Interaction Modes
    const interactionContainer = document.getElementById(
      "interaction-segments"
    );
    interactionContainer.innerHTML = "";

    (dashboardData.userInsights.interactionModes || []).forEach((mode) => {
      const item = document.createElement("div");
      item.className = "segment-item";
      item.innerHTML = `
                <span class="segment-name">${capitalizeFirst(mode._id)}</span>
                <span class="segment-count">${mode.count}</span>
            `;
      interactionContainer.appendChild(item);
    });
  } catch (error) {
    console.error("Error loading segments:", error);
  }
}

// Load Emotions
async function loadEmotions() {
  try {
    const emotions = dashboardData.emotionalInsights || [];

    // Create emotions chart
    const ctx = document.getElementById("emotions-chart");
    if (ctx && charts.emotions) {
      charts.emotions.destroy();
    }

    const labels = emotions.map((e) => capitalizeFirst(e._id));
    const data = emotions.map((e) => e.count);
    const colors = [
      "#10b981",
      "#3b82f6",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#6b7280",
    ];

    charts.emotions = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
    });

    // Emotion stats
    const statsContainer = document.getElementById("emotion-stats-list");
    statsContainer.innerHTML = "";

    emotions.forEach((emotion, index) => {
      const item = document.createElement("div");
      item.className = "emotion-stat-item";
      item.innerHTML = `
                <div>
                    <span class="emotion-icon">${getEmotionIcon(
                      emotion._id
                    )}</span>
                    <strong>${capitalizeFirst(emotion._id)}</strong>
                </div>
                <span>${emotion.count} users</span>
            `;
      statsContainer.appendChild(item);
    });

    // Frustrated users (mock data - you can fetch from analytics)
    const frustratedContainer = document.getElementById(
      "frustrated-users-list"
    );
    frustratedContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-smile"></i>
                <h4>No users need immediate support</h4>
                <p>All users are showing positive engagement</p>
            </div>
        `;
  } catch (error) {
    console.error("Error loading emotions:", error);
  }
}

// Load Promotions
async function loadPromotions() {
  try {
    const response = await fetch(`${API_BASE_URL}/promotions`);
    const promotions = await response.json();

    const container = document.getElementById("promotions-list");
    container.innerHTML = "";

    if (!promotions || promotions.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bullhorn"></i>
                    <h4>No campaigns yet</h4>
                    <p>Create your first campaign to engage users</p>
                </div>
            `;
      return;
    }

    promotions.forEach((promo) => {
      const card = document.createElement("div");
      card.className = "promotion-card";
      card.innerHTML = `
                <div class="promotion-header">
                    <div>
                        <h4>${promo.title}</h4>
                        <span class="promotion-status ${
                          promo.status
                        }">${capitalizeFirst(promo.status)}</span>
                    </div>
                </div>
                <div class="promotion-body">
                    <p>${promo.description}</p>
                    <div class="promotion-meta">
                        <span><i class="fas fa-users"></i> ${
                          promo.targetSegment
                        }</span>
                        <span><i class="fas fa-calendar"></i> ${new Date(
                          promo.startDate
                        ).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="promotion-actions">
                    <button class="action-btn">Edit</button>
                    <button class="btn-danger">Delete</button>
                </div>
            `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading promotions:", error);
    // Show empty state on error
    const container = document.getElementById("promotions-list");
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bullhorn"></i>
                <h4>No campaigns yet</h4>
                <p>Create your first campaign to engage users</p>
            </div>
        `;
  }
}

// Load Recommendations
async function loadRecommendations() {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/recommendations`);
    const data = await response.json();

    const container = document.getElementById("recommendations-list");
    container.innerHTML = "";

    const recommendations = data.recommendations || [];

    if (recommendations.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h4>All systems optimal</h4>
                    <p>No recommendations at this time</p>
                </div>
            `;
      return;
    }

    recommendations.forEach((rec) => {
      const card = document.createElement("div");
      card.className = `recommendation-card ${rec.priority}`;
      card.innerHTML = `
                <div class="recommendation-header">
                    <h4>${rec.title}</h4>
                    <span class="priority-badge ${rec.priority}">${rec.priority}</span>
                </div>
                <div class="recommendation-body">
                    <p>${rec.description}</p>
                    <button class="btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-check"></i> Take Action
                    </button>
                </div>
            `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading recommendations:", error);
  }
}

// Modals
function initializeModals() {
  // Close modal buttons
  document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".modal").classList.remove("active");
    });
  });

  // Close modal on outside click
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });
  });

  // Create promotion button
  document
    .getElementById("create-promotion-btn")
    .addEventListener("click", () => {
      document.getElementById("promotion-modal").classList.add("active");
    });

  // Cancel buttons
  document.querySelectorAll(".cancel-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".modal").classList.remove("active");
    });
  });

  // Promotion form
  document
    .getElementById("promotion-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await createPromotion();
    });
}

// Create Promotion
async function createPromotion() {
  const promotion = {
    title: document.getElementById("promo-title").value,
    description: document.getElementById("promo-description").value,
    targetSegment: document.getElementById("promo-segment").value,
    type: document.getElementById("promo-type").value,
    offer: document.getElementById("promo-offer").value,
    startDate: document.getElementById("promo-start").value,
    endDate: document.getElementById("promo-end").value,
    status: "scheduled",
    createdAt: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/promotions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(promotion),
    });

    if (response.ok) {
      document.getElementById("promotion-modal").classList.remove("active");
      document.getElementById("promotion-form").reset();
      await loadPromotions();
      showSuccess("Campaign created successfully!");
    } else {
      showError("Failed to create campaign");
    }
  } catch (error) {
    console.error("Error creating promotion:", error);
    showError("Failed to create campaign");
  }
}

// Utility Functions
function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getEmotionIcon(emotion) {
  const icons = {
    satisfied: "😊",
    happy: "😄",
    neutral: "😐",
    frustrated: "😤",
    stressed: "😰",
    confused: "😕",
  };
  return icons[emotion] || "😐";
}

function showLoading() {
  // You can implement a loading overlay here
  console.log("Loading...");
}

function hideLoading() {
  console.log("Loading complete");
}

function showSuccess(message) {
  alert(message); // Replace with a better notification system
}

function showError(message) {
  alert(message); // Replace with a better notification system
}

// Add CSS for detail-grid
const style = document.createElement("style");
style.textContent = `
    .detail-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-top: 1rem;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .detail-item strong {
        color: var(--text-secondary);
        font-size: 0.85rem;
        font-weight: 600;
    }

    .detail-item span {
        color: var(--text-primary);
        font-size: 1rem;
    }
`;
document.head.appendChild(style);
