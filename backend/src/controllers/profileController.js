import User from "../models/User.js";
import geminiService from "../services/geminiService.js";

/**
 * POST /api/profile/detect
 * Process onboarding data and return adaptive profile settings using Gemini AI
 */
export const detectProfile = async (req, res) => {
  try {
    const {
      language,
      disabilities,
      cognitiveScore,
      interactionMode,
      microInteractions,
    } = req.body;

    // Validate required fields
    if (!language) {
      return res.status(400).json({
        error: "Language is required",
        details: "Please provide a language preference",
      });
    }

    // Use Gemini AI to generate adaptive profile
    const aiRecommendations = await geminiService.generateAdaptiveProfile({
      language,
      disabilities: disabilities || [],
      cognitiveScore: cognitiveScore || 5,
      interactionMode: interactionMode || "voice",
      microInteractions,
    });

    // Build complete profile response
    const profile = {
      profileId: `p_${Date.now()}`,
      language,
      interactionMode: microInteractions?.preferVoice
        ? "voice"
        : interactionMode || "text",
      disabilities: disabilities || [],
      cognitiveScore: cognitiveScore || 5,
      uiComplexity: aiRecommendations.uiComplexity,
      accessibilityPreferences: {
        fontSize: aiRecommendations.fontSize,
        contrast: aiRecommendations.contrast,
        ttsSpeed: aiRecommendations.ttsSpeed,
        largeTargets: aiRecommendations.largeTargets,
        captions: aiRecommendations.captions,
        font: "inter",
      },
      confirmMode: aiRecommendations.confirmMode,
      isOnboardingComplete: false,
    };

    // Optionally include AI reasoning in development mode
    if (
      process.env.NODE_ENV === "development" &&
      aiRecommendations.aiReasoning
    ) {
      profile._aiReasoning = aiRecommendations.aiReasoning;
    }

    res.json(profile);
  } catch (error) {
    console.error("Profile detection error:", error);
    res.status(500).json({
      error: "Profile detection failed",
      details: error.message,
    });
  }
};

/**
 * POST /api/profile
 * Save complete user profile after onboarding
 */
export const saveProfile = async (req, res) => {
  try {
    const profileData = req.body;

    // Validate required fields
    if (!profileData.profileId) {
      return res.status(400).json({
        error: "Profile ID is required",
      });
    }

    // Save or update profile in database
    const profile = await User.findOneAndUpdate(
      { profileId: profileData.profileId },
      profileData,
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      profileId: profile.profileId,
      message: "Profile saved successfully",
    });
  } catch (error) {
    console.error("Profile save error:", error);
    res.status(500).json({
      error: "Failed to save profile",
      details: error.message,
    });
  }
};

/**
 * GET /api/profile
 * Get all user profiles (for admin dashboard)
 */
export const getAllProfiles = async (req, res) => {
  try {
    const { limit = 100, skip = 0 } = req.query;

    const profiles = await User.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await User.countDocuments();

    res.json(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({
      error: "Failed to fetch profiles",
      details: error.message,
    });
  }
};

/**
 * GET /api/profile/:profileId
 * Retrieve existing user profile
 */
export const getProfile = async (req, res) => {
  try {
    const { profileId } = req.params;

    const profile = await User.findOne({ profileId }).lean();

    if (!profile) {
      return res.status(404).json({
        error: "Profile not found",
        details: `No profile found with ID: ${profileId}`,
      });
    }

    // Remove MongoDB internal fields
    delete profile._id;
    delete profile.__v;

    res.json(profile);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch profile",
      details: error.message,
    });
  }
};

/**
 * PUT /api/profile/:profileId
 * Update existing user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { profileId } = req.params;
    const updates = req.body;

    // Don't allow changing profileId
    delete updates.profileId;

    const profile = await User.findOneAndUpdate(
      { profileId },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!profile) {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    // Remove MongoDB internal fields
    delete profile._id;
    delete profile.__v;

    res.json({
      success: true,
      profile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      error: "Failed to update profile",
      details: error.message,
    });
  }
};
