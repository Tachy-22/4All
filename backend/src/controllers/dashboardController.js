import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import BillPayment from "../models/BillPayment.js";
import AnalyticsEvent from "../models/Analytics.js";

/**
 * GET /api/dashboard/overview
 * Get comprehensive bank dashboard overview
 */
export const getDashboardOverview = async (req, res) => {
  try {
    const { timeRange = "30d" } = req.query;

    // Calculate time range
    const now = Date.now();
    const timeRangeMs =
      timeRange === "7d"
        ? 7 * 24 * 60 * 60 * 1000
        : timeRange === "30d"
        ? 30 * 24 * 60 * 60 * 1000
        : 90 * 24 * 60 * 60 * 1000;
    const startTime = now - timeRangeMs;

    // User insights with segmentation
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: new Date(startTime) },
    });

    // Disability segmentation
    const disabilitySegmentation = await User.aggregate([
      {
        $unwind: { path: "$disabilities", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$disabilities",
          count: { $sum: 1 },
          avgEngagement: { $avg: "$cognitiveScore" },
        },
      },
    ]);

    // Cognitive score distribution
    const cognitiveDistribution = await User.aggregate([
      {
        $bucket: {
          groupBy: "$cognitiveScore",
          boundaries: [1, 4, 7, 11],
          default: "unknown",
          output: {
            count: { $sum: 1 },
            users: { $push: "$profileId" },
          },
        },
      },
    ]);

    // Interaction mode preferences
    const interactionModes = await User.aggregate([
      {
        $group: {
          _id: "$interactionMode",
          count: { $sum: 1 },
        },
      },
    ]);

    // Transaction health metrics
    const recentTransactions = await Transaction.find({
      timestamp: { $gte: startTime },
    }).lean();

    const transactionHealth = {
      total: recentTransactions.length,
      successful: recentTransactions.filter((t) => t.status === "completed")
        .length,
      failed: recentTransactions.filter((t) => t.status === "failed").length,
      pending: recentTransactions.filter((t) => t.status === "pending").length,
      totalVolume: recentTransactions
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0),
    };

    transactionHealth.successRate =
      transactionHealth.total > 0
        ? (transactionHealth.successful / transactionHealth.total) * 100
        : 0;

    // Emotional analytics
    const emotionalInsights = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: startTime },
          "emotionalContext.detectedEmotion": { $exists: true },
        },
      },
      {
        $group: {
          _id: "$emotionalContext.detectedEmotion",
          count: { $sum: 1 },
          avgFrustration: { $avg: "$emotionalContext.frustrationLevel" },
          avgEngagement: { $avg: "$emotionalContext.engagementScore" },
        },
      },
    ]);

    // Accessibility feature usage
    const accessibilityUsage = await User.aggregate([
      {
        $group: {
          _id: null,
          avgFontSize: { $avg: "$accessibilityPreferences.fontSize" },
          highContrastUsers: {
            $sum: {
              $cond: [
                { $eq: ["$accessibilityPreferences.contrast", "high"] },
                1,
                0,
              ],
            },
          },
          largeTargetUsers: {
            $sum: {
              $cond: ["$accessibilityPreferences.largeTargets", 1, 0],
            },
          },
          captionUsers: {
            $sum: {
              $cond: ["$accessibilityPreferences.captions", 1, 0],
            },
          },
        },
      },
    ]);

    // Inclusion metrics
    const inclusionMetrics = {
      totalInclusiveUsers: await User.countDocuments({
        disabilities: { $exists: true, $ne: [] },
      }),
      percentageOfTotal: 0,
      engagementRate: 0,
      satisfactionScore: 0,
    };

    if (totalUsers > 0) {
      inclusionMetrics.percentageOfTotal =
        (inclusionMetrics.totalInclusiveUsers / totalUsers) * 100;
    }

    // Calculate engagement rate for inclusive users
    const inclusiveUserEngagement = await AnalyticsEvent.countDocuments({
      timestamp: { $gte: startTime },
      "accessibilityContext.disabilities": { $exists: true, $ne: [] },
    });

    const totalEvents = await AnalyticsEvent.countDocuments({
      timestamp: { $gte: startTime },
    });

    if (totalEvents > 0) {
      inclusionMetrics.engagementRate =
        (inclusiveUserEngagement / totalEvents) * 100;
    }

    res.json({
      timeRange,
      userInsights: {
        total: totalUsers,
        active: activeUsers,
        disabilitySegmentation,
        cognitiveDistribution,
        interactionModes,
      },
      transactionHealth,
      emotionalInsights,
      accessibilityUsage: accessibilityUsage[0] || {},
      inclusionMetrics,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({
      error: "Failed to fetch dashboard overview",
      details: error.message,
    });
  }
};

/**
 * GET /api/dashboard/user-segments
 * Get detailed user segmentation analysis
 */
export const getUserSegments = async (req, res) => {
  try {
    // Segment by disability type
    const disabilitySegments = await User.aggregate([
      {
        $unwind: { path: "$disabilities", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$disabilities",
          count: { $sum: 1 },
          avgCognitiveScore: { $avg: "$cognitiveScore" },
          voicePreference: {
            $sum: { $cond: [{ $eq: ["$interactionMode", "voice"] }, 1, 0] },
          },
          textPreference: {
            $sum: { $cond: [{ $eq: ["$interactionMode", "text"] }, 1, 0] },
          },
        },
      },
    ]);

    // Segment by UI complexity preference
    const uiComplexitySegments = await User.aggregate([
      {
        $group: {
          _id: "$uiComplexity",
          count: { $sum: 1 },
          avgCognitiveScore: { $avg: "$cognitiveScore" },
        },
      },
    ]);

    // Language distribution
    const languageSegments = await User.aggregate([
      {
        $group: {
          _id: "$language",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      disabilitySegments,
      uiComplexitySegments,
      languageSegments,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("User segments error:", error);
    res.status(500).json({
      error: "Failed to fetch user segments",
      details: error.message,
    });
  }
};

/**
 * GET /api/dashboard/recommendations
 * Get AI-driven recommendations for bank operations
 */
export const getRecommendations = async (req, res) => {
  try {
    const recommendations = [];

    // Check for high frustration users
    const frustratedUsers = await AnalyticsEvent.aggregate([
      {
        $match: {
          "emotionalContext.frustrationLevel": { $gte: 7 },
        },
      },
      {
        $group: {
          _id: "$profileId",
          avgFrustration: { $avg: "$emotionalContext.frustrationLevel" },
          eventCount: { $sum: 1 },
        },
      },
      {
        $match: {
          eventCount: { $gte: 3 },
        },
      },
    ]);

    if (frustratedUsers.length > 0) {
      recommendations.push({
        type: "user_support",
        priority: "high",
        title: "High Frustration Detected",
        description: `${frustratedUsers.length} users showing high frustration levels. Consider proactive outreach.`,
        action: "contact_support_team",
        affectedUsers: frustratedUsers.length,
      });
    }

    // Check for low engagement in specific segments
    const lowEngagementSegments = await User.aggregate([
      {
        $match: {
          updatedAt: { $lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $unwind: { path: "$disabilities", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$disabilities",
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gte: 5 },
        },
      },
    ]);

    if (lowEngagementSegments.length > 0) {
      recommendations.push({
        type: "engagement",
        priority: "medium",
        title: "Low Engagement in Accessibility Segments",
        description:
          "Some user segments haven't engaged recently. Consider targeted campaigns.",
        action: "create_engagement_campaign",
        segments: lowEngagementSegments,
      });
    }

    // Check transaction failure rates
    const failedTransactions = await Transaction.countDocuments({
      status: "failed",
      timestamp: { $gte: Date.now() - 7 * 24 * 60 * 60 * 1000 },
    });

    const totalRecentTransactions = await Transaction.countDocuments({
      timestamp: { $gte: Date.now() - 7 * 24 * 60 * 60 * 1000 },
    });

    const failureRate =
      totalRecentTransactions > 0
        ? (failedTransactions / totalRecentTransactions) * 100
        : 0;

    if (failureRate > 5) {
      recommendations.push({
        type: "technical",
        priority: "high",
        title: "High Transaction Failure Rate",
        description: `${failureRate.toFixed(
          1
        )}% of transactions failing. Investigate technical issues.`,
        action: "investigate_failures",
        failureRate,
      });
    }

    res.json({
      recommendations,
      totalRecommendations: recommendations.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    res.status(500).json({
      error: "Failed to generate recommendations",
      details: error.message,
    });
  }
};
