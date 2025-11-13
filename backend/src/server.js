import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/database.js";

// Import routes
import profileRoutes from "./routes/profileRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import billsRoutes from "./routes/billsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import zivaRoutes from "./routes/zivaRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "4All Banking API",
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/profile", profileRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/bills", billsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ziva", zivaRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "4All Inclusive Banking API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      profile: {
        detect: "POST /api/profile/detect",
        save: "POST /api/profile",
        get: "GET /api/profile/:profileId",
        update: "PUT /api/profile/:profileId",
      },
      transactions: {
        list: "GET /api/transactions",
        create: "POST /api/transactions",
      },
      bills: {
        pay: "POST /api/bills",
        list: "GET /api/bills",
      },
      analytics: {
        send: "POST /api/analytics",
        get: "GET /api/analytics",
      },
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: [
      "/health",
      "/api/profile/detect",
      "/api/profile",
      "/api/transactions",
      "/api/bills",
      "/api/analytics",
    ],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log("");
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║                                                        ║");
  console.log("║        🏦  4All Inclusive Banking API Server          ║");
  console.log("║                                                        ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log("");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(
    `🔗 CORS Origin: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`
  );
  console.log(
    `🤖 Gemini AI: ${
      process.env.GEMINI_API_KEY
        ? "✅ Configured"
        : "⚠️  Not configured (using fallback)"
    }`
  );
  console.log("");
  console.log("📚 Available endpoints:");
  console.log("   GET  /health");
  console.log("   POST /api/profile/detect");
  console.log("   POST /api/profile");
  console.log("   GET  /api/profile/:profileId");
  console.log("   GET  /api/transactions");
  console.log("   POST /api/transactions");
  console.log("   POST /api/bills");
  console.log("   GET  /api/bills");
  console.log("   POST /api/analytics");
  console.log("   GET  /api/analytics");
  console.log("   POST /api/ziva");
  console.log("   POST /api/ziva/guidance");
  console.log("   GET  /api/dashboard/overview");
  console.log("   GET  /api/dashboard/user-segments");
  console.log("   GET  /api/dashboard/recommendations");
  console.log("");
  console.log("Press Ctrl+C to stop the server");
  console.log("");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\nSIGINT signal received: closing HTTP server");
  process.exit(0);
});

export default app;
