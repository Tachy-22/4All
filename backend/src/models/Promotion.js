import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    promotionId: {
      type: String,
      required: true,
      unique: true,
      default: () => `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    targetSegment: {
      type: String,
      required: true,
      enum: [
        "all",
        "visual",
        "motor",
        "cognitive",
        "hearing",
        "speech",
        "low-cognitive",
        "mid-cognitive",
        "high-cognitive",
      ],
    },
    type: {
      type: String,
      required: true,
      enum: ["savings", "loan", "investment", "cashback", "education"],
    },
    offer: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "ended", "paused"],
      default: "scheduled",
    },
    metrics: {
      views: {
        type: Number,
        default: 0,
      },
      clicks: {
        type: Number,
        default: 0,
      },
      conversions: {
        type: Number,
        default: 0,
      },
    },
    createdBy: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
promotionSchema.index({ status: 1 });
promotionSchema.index({ targetSegment: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });

// Auto-update status based on dates
promotionSchema.pre("save", function (next) {
  const now = new Date();
  
  if (this.startDate <= now && this.endDate >= now && this.status === "scheduled") {
    this.status = "active";
  } else if (this.endDate < now && this.status !== "ended") {
    this.status = "ended";
  }
  
  next();
});

const Promotion = mongoose.model("Promotion", promotionSchema);

export default Promotion;

