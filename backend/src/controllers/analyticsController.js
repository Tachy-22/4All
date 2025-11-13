import AnalyticsEvent from "../models/Analytics.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

/**
 * POST /api/analytics
 * Receive and store frontend analytics data
 */
export const receiveAnalytics = async (req, res) => {
  try {
    const { events, accessibilityMetrics, sessionId } = req.body;

    if (!events || !Array.isArray(events)) {
      return res.status(400).json({
        error: "Events array is required",
      });
    }

    // Store each event in the database
    const savedEvents = [];
    for (const event of events) {
      try {
        const analyticsEvent = await AnalyticsEvent.create({
          eventType: event.type || event.eventType,
          userId: event.userId,
          profileId: event.profileId,
          sessionId: sessionId || event.sessionId,
          timestamp: event.timestamp || Date.now(),
          metadata: event.metadata || {},
          deviceInfo: event.deviceInfo || {},
          accessibilityContext: {
            disabilities: event.metadata?.userProfile?.disabilities,
            interactionMode: event.metadata?.interactionMode,
            uiComplexity: event.metadata?.userProfile?.uiComplexity,
            fontSize: accessibilityMetrics?.fontSize,
            contrast: accessibilityMetrics?.contrast,
          },
          emotionalContext: {
            detectedEmotion: event.metadata?.emotion || "neutral",
            frustrationLevel: event.metadata?.frustrationLevel || 0,
            engagementScore: event.metadata?.engagementScore || 5,
          },
          lifeEventSignals: event.metadata?.lifeEventSignals || [],
        });
        savedEvents.push(analyticsEvent);
      } catch (err) {
        console.error("Error saving individual event:", err);
        // Continue processing other events
      }
    }

    res.json({
      success: true,
      processed: savedEvents.length,
      message: "Analytics data received successfully",
    });
  } catch (error) {
    console.error("Analytics receive error:", error);
    res.status(500).json({
      error: "Failed to process analytics",
      details: error.message,
    });
  }
};

/**
 * GET /api/analytics
 * Get aggregated analytics data for admin dashboard
 */
export const getAnalytics = async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const voiceUsers = await User.countDocuments({ interactionMode: "voice" });
    const textUsers = await User.countDocuments({ interactionMode: "text" });

    // Get users created today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: todayStart },
    });

    // Get accessibility statistics
    const visualSupport = await User.countDocuments({
      disabilities: "visual",
    });
    const motorSupport = await User.countDocuments({
      disabilities: "motor",
    });
    const cognitiveSupport = await User.countDocuments({
      disabilities: "cognitive",
    });
    const hearingSupport = await User.countDocuments({
      disabilities: "hearing",
    });

    // Get transaction statistics
    const completedTransactions = await Transaction.find({
      status: "completed",
    }).lean();

    const totalVolume = completedTransactions.reduce(
      (sum, txn) => sum + txn.amount,
      0
    );

    const totalTransactions = await Transaction.countDocuments();
    const successfulTransactions = completedTransactions.length;
    const successRate =
      totalTransactions > 0
        ? (successfulTransactions / totalTransactions) * 100
        : 0;

    const avgTransactionValue =
      successfulTransactions > 0 ? totalVolume / successfulTransactions : 0;

    // Get language statistics
    const languageStats = await User.aggregate([
      {
        $group: {
          _id: "$language",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert language stats to percentages
    const languagePercentages = {};
    languageStats.forEach((stat) => {
      const percentage =
        totalUsers > 0 ? Math.round((stat.count / totalUsers) * 100) : 0;
      languagePercentages[stat._id] = percentage;
    });

    // Ensure all languages are represented
    ["en", "pcm", "yo", "ig", "ha"].forEach((lang) => {
      if (!languagePercentages[lang]) {
        languagePercentages[lang] = 0;
      }
    });

    // Get emotional analytics
    const emotionalStats = await AnalyticsEvent.aggregate([
      {
        $match: {
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

    // Get life event signals
    const lifeEventStats = await AnalyticsEvent.aggregate([
      {
        $match: {
          lifeEventSignals: { $exists: true, $ne: [] },
        },
      },
      {
        $unwind: "$lifeEventSignals",
      },
      {
        $group: {
          _id: "$lifeEventSignals",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format emotional stats
    const emotionalMetrics = {
      frustrated: 0,
      stressed: 0,
      satisfied: 0,
      confused: 0,
      happy: 0,
      neutral: 0,
      avgFrustrationLevel: 0,
      avgEngagementScore: 5,
    };

    emotionalStats.forEach((stat) => {
      if (stat._id) {
        emotionalMetrics[stat._id] = stat.count;
      }
    });

    const totalEmotionalEvents = emotionalStats.reduce(
      (sum, stat) => sum + stat.count,
      0
    );
    if (totalEmotionalEvents > 0) {
      emotionalMetrics.avgFrustrationLevel = Math.round(
        emotionalStats.reduce(
          (sum, stat) => sum + (stat.avgFrustration || 0),
          0
        ) / emotionalStats.length
      );
      emotionalMetrics.avgEngagementScore = Math.round(
        emotionalStats.reduce(
          (sum, stat) => sum + (stat.avgEngagement || 0),
          0
        ) / emotionalStats.length
      );
    }

    // Format life event stats
    const lifeEvents = {};
    lifeEventStats.forEach((stat) => {
      lifeEvents[stat._id] = stat.count;
    });

    res.json({
      userStats: {
        totalUsers,
        activeUsers: totalUsers, // In production, calculate based on recent activity
        newUsersToday,
        voiceUsers,
        textUsers,
      },
      accessibilityStats: {
        visualSupport,
        motorSupport,
        cognitiveSupport,
        hearingSupport,
      },
      transactionStats: {
        totalVolume: Math.round(totalVolume),
        successRate: Math.round(successRate * 10) / 10,
        avgTransactionValue: Math.round(avgTransactionValue),
      },
      languageStats: languagePercentages,
      emotionalAnalytics: emotionalMetrics,
      lifeEventSignals: lifeEvents,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      error: "Failed to fetch analytics",
      details: error.message,
    });
  }
};
