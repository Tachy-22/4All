import Promotion from "../models/Promotion.js";

// Get all promotions
export const getPromotions = async (req, res) => {
  try {
    const { status, targetSegment } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (targetSegment) filter.targetSegment = targetSegment;
    
    const promotions = await Promotion.find(filter).sort({ createdAt: -1 });
    
    res.json(promotions);
  } catch (error) {
    console.error("Error fetching promotions:", error);
    res.status(500).json({
      error: "Failed to fetch promotions",
      message: error.message,
    });
  }
};

// Get single promotion
export const getPromotion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const promotion = await Promotion.findOne({
      $or: [{ _id: id }, { promotionId: id }],
    });
    
    if (!promotion) {
      return res.status(404).json({ error: "Promotion not found" });
    }
    
    res.json(promotion);
  } catch (error) {
    console.error("Error fetching promotion:", error);
    res.status(500).json({
      error: "Failed to fetch promotion",
      message: error.message,
    });
  }
};

// Create promotion
export const createPromotion = async (req, res) => {
  try {
    const promotionData = req.body;
    
    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "targetSegment",
      "type",
      "offer",
      "startDate",
      "endDate",
    ];
    
    for (const field of requiredFields) {
      if (!promotionData[field]) {
        return res.status(400).json({
          error: `Missing required field: ${field}`,
        });
      }
    }
    
    // Validate dates
    const startDate = new Date(promotionData.startDate);
    const endDate = new Date(promotionData.endDate);
    
    if (endDate <= startDate) {
      return res.status(400).json({
        error: "End date must be after start date",
      });
    }
    
    const promotion = new Promotion(promotionData);
    await promotion.save();
    
    res.status(201).json({
      success: true,
      message: "Promotion created successfully",
      promotion,
    });
  } catch (error) {
    console.error("Error creating promotion:", error);
    res.status(500).json({
      error: "Failed to create promotion",
      message: error.message,
    });
  }
};

// Update promotion
export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const promotion = await Promotion.findOneAndUpdate(
      { $or: [{ _id: id }, { promotionId: id }] },
      updates,
      { new: true, runValidators: true }
    );
    
    if (!promotion) {
      return res.status(404).json({ error: "Promotion not found" });
    }
    
    res.json({
      success: true,
      message: "Promotion updated successfully",
      promotion,
    });
  } catch (error) {
    console.error("Error updating promotion:", error);
    res.status(500).json({
      error: "Failed to update promotion",
      message: error.message,
    });
  }
};

// Delete promotion
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const promotion = await Promotion.findOneAndDelete({
      $or: [{ _id: id }, { promotionId: id }],
    });
    
    if (!promotion) {
      return res.status(404).json({ error: "Promotion not found" });
    }
    
    res.json({
      success: true,
      message: "Promotion deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    res.status(500).json({
      error: "Failed to delete promotion",
      message: error.message,
    });
  }
};

// Track promotion metrics
export const trackPromotionMetric = async (req, res) => {
  try {
    const { id } = req.params;
    const { metric } = req.body; // 'views', 'clicks', or 'conversions'
    
    if (!["views", "clicks", "conversions"].includes(metric)) {
      return res.status(400).json({ error: "Invalid metric type" });
    }
    
    const promotion = await Promotion.findOneAndUpdate(
      { $or: [{ _id: id }, { promotionId: id }] },
      { $inc: { [`metrics.${metric}`]: 1 } },
      { new: true }
    );
    
    if (!promotion) {
      return res.status(404).json({ error: "Promotion not found" });
    }
    
    res.json({
      success: true,
      metrics: promotion.metrics,
    });
  } catch (error) {
    console.error("Error tracking promotion metric:", error);
    res.status(500).json({
      error: "Failed to track metric",
      message: error.message,
    });
  }
};

