import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    profileId: {
      type: String,
      ref: "User",
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Number,
      required: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    deviceInfo: {
      userAgent: String,
      platform: String,
      language: String,
      screenResolution: String,
    },
    accessibilityContext: {
      disabilities: [String],
      interactionMode: String,
      uiComplexity: String,
      fontSize: Number,
      contrast: String,
    },
    emotionalContext: {
      detectedEmotion: {
        type: String,
        enum: [
          "neutral",
          "frustrated",
          "stressed",
          "satisfied",
          "confused",
          "happy",
        ],
      },
      frustrationLevel: {
        type: Number,
        min: 0,
        max: 10,
      },
      engagementScore: {
        type: Number,
        min: 0,
        max: 10,
      },
    },
    lifeEventSignals: {
      type: [String],
      enum: [
        "house_hunting",
        "wedding_planning",
        "business_startup",
        "education",
        "medical",
        "travel",
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for analytics queries
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ profileId: 1, timestamp: -1 });
analyticsEventSchema.index({ sessionId: 1, timestamp: 1 });

const AnalyticsEvent = mongoose.model("AnalyticsEvent", analyticsEventSchema);

export default AnalyticsEvent;
