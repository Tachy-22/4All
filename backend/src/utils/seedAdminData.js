import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Analytics from "../models/Analytics.js";
import Promotion from "../models/Promotion.js";

dotenv.config();

// Sample user data
const sampleUsers = [
  {
    profileId: "p_demo_visual_001",
    name: "Adaeze Okonkwo",
    language: "en",
    interactionMode: "voice",
    disabilities: ["visual"],
    cognitiveScore: 7,
    uiComplexity: "simplified",
    accessibilityPreferences: {
      fontSize: 20,
      contrast: "high",
      ttsSpeed: 1.0,
      largeTargets: true,
      captions: true,
      font: "inter",
    },
    confirmMode: "voice",
    isOnboardingComplete: true,
  },
  {
    profileId: "p_demo_motor_002",
    name: "Chukwudi Eze",
    language: "pcm",
    interactionMode: "voice",
    disabilities: ["motor"],
    cognitiveScore: 8,
    uiComplexity: "simplified",
    accessibilityPreferences: {
      fontSize: 20,
      contrast: "high",
      ttsSpeed: 0.8,
      largeTargets: true,
      captions: false,
      font: "inter",
    },
    confirmMode: "voice",
    isOnboardingComplete: true,
  },
  {
    profileId: "p_demo_cognitive_003",
    name: "Fatima Abubakar",
    language: "ha",
    interactionMode: "text",
    disabilities: ["cognitive"],
    cognitiveScore: 4,
    uiComplexity: "simplified",
    accessibilityPreferences: {
      fontSize: 24,
      contrast: "high",
      ttsSpeed: 0.7,
      largeTargets: true,
      captions: true,
      font: "inter",
    },
    confirmMode: "pin",
    isOnboardingComplete: true,
  },
  {
    profileId: "p_demo_hearing_004",
    name: "Oluwaseun Adeyemi",
    language: "yo",
    interactionMode: "text",
    disabilities: ["hearing"],
    cognitiveScore: 9,
    uiComplexity: "moderate",
    accessibilityPreferences: {
      fontSize: 16,
      contrast: "normal",
      ttsSpeed: 1.0,
      largeTargets: false,
      captions: true,
      font: "inter",
    },
    confirmMode: "pin",
    isOnboardingComplete: true,
  },
  {
    profileId: "p_demo_none_005",
    name: "Emeka Nwosu",
    language: "ig",
    interactionMode: "text",
    disabilities: [],
    cognitiveScore: 10,
    uiComplexity: "detailed",
    accessibilityPreferences: {
      fontSize: 16,
      contrast: "normal",
      ttsSpeed: 1.5,
      largeTargets: false,
      captions: false,
      font: "inter",
    },
    confirmMode: "biometric",
    isOnboardingComplete: true,
  },
  {
    profileId: "p_demo_multi_006",
    name: "Blessing Okoro",
    language: "pcm",
    interactionMode: "voice",
    disabilities: ["visual", "motor"],
    cognitiveScore: 6,
    uiComplexity: "simplified",
    accessibilityPreferences: {
      fontSize: 22,
      contrast: "high",
      ttsSpeed: 0.8,
      largeTargets: true,
      captions: true,
      font: "inter",
    },
    confirmMode: "voice",
    isOnboardingComplete: true,
  },
];

// Sample analytics data
const sampleAnalytics = [
  {
    profileId: "p_demo_visual_001",
    sessionId: `session_${Date.now()}_1`,
    eventType: "transaction",
    timestamp: Date.now(),
    emotionalContext: {
      detectedEmotion: "satisfied",
      confidence: 0.85,
    },
  },
  {
    profileId: "p_demo_motor_002",
    sessionId: `session_${Date.now()}_2`,
    eventType: "bill_payment",
    timestamp: Date.now(),
    emotionalContext: {
      detectedEmotion: "happy",
      confidence: 0.9,
    },
  },
  {
    profileId: "p_demo_cognitive_003",
    sessionId: `session_${Date.now()}_3`,
    eventType: "balance_check",
    timestamp: Date.now(),
    emotionalContext: {
      detectedEmotion: "confused",
      confidence: 0.75,
    },
  },
  {
    profileId: "p_demo_hearing_004",
    sessionId: `session_${Date.now()}_4`,
    eventType: "transaction",
    timestamp: Date.now(),
    emotionalContext: {
      detectedEmotion: "satisfied",
      confidence: 0.88,
    },
  },
  {
    profileId: "p_demo_none_005",
    sessionId: `session_${Date.now()}_5`,
    eventType: "transaction",
    timestamp: Date.now(),
    emotionalContext: {
      detectedEmotion: "neutral",
      confidence: 0.92,
    },
  },
  {
    profileId: "p_demo_multi_006",
    sessionId: `session_${Date.now()}_6`,
    eventType: "bill_payment",
    timestamp: Date.now(),
    emotionalContext: {
      detectedEmotion: "frustrated",
      confidence: 0.8,
    },
  },
];

// Sample promotions
const samplePromotions = [
  {
    title: "Accessible Savings Boost",
    description: "Special 5% bonus interest for users with visual disabilities",
    targetSegment: "visual",
    type: "savings",
    offer: "5% bonus interest for 3 months",
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    status: "active",
  },
  {
    title: "Pidgin Banking Cashback",
    description:
      "Get 2% cashback on all transactions for Pidgin language users",
    targetSegment: "all",
    type: "cashback",
    offer: "2% cashback on all transactions",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000), // 37 days from now
    status: "scheduled",
  },
];

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/4all_db"
    );
    console.log("✅ Connected to MongoDB");

    // Clear existing data (optional - comment out if you want to keep existing data)
    await User.deleteMany({});
    await Analytics.deleteMany({});
    await Promotion.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Insert sample users
    await User.insertMany(sampleUsers);
    console.log(`✅ Inserted ${sampleUsers.length} sample users`);

    // Insert sample analytics
    await Analytics.insertMany(sampleAnalytics);
    console.log(
      `✅ Inserted ${sampleAnalytics.length} sample analytics events`
    );

    // Insert sample promotions
    await Promotion.insertMany(samplePromotions);
    console.log(`✅ Inserted ${samplePromotions.length} sample promotions`);

    console.log("\n🎉 Sample data seeded successfully!");
    console.log(
      "\n📊 You can now view the admin dashboard at: http://localhost:3001/admin"
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
