import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  profileId: { 
    type: String, 
    unique: true, 
    required: true,
    index: true
  },
  userId: { 
    type: String,
    sparse: true
  },
  name: { 
    type: String 
  },
  phone: { 
    type: String 
  },
  language: { 
    type: String, 
    required: true, 
    enum: ['en', 'pcm', 'yo', 'ig', 'ha'],
    default: 'en'
  },
  interactionMode: { 
    type: String, 
    required: true, 
    enum: ['voice', 'text'],
    default: 'voice'
  },
  disabilities: [{ 
    type: String, 
    enum: ['visual', 'hearing', 'motor', 'cognitive', 'speech'] 
  }],
  cognitiveScore: { 
    type: Number, 
    min: 1, 
    max: 10 
  },
  uiComplexity: { 
    type: String, 
    required: true, 
    enum: ['simplified', 'moderate', 'detailed'],
    default: 'moderate'
  },
  accessibilityPreferences: {
    fontSize: { 
      type: Number, 
      min: 14, 
      max: 24,
      default: 16
    },
    contrast: { 
      type: String, 
      enum: ['normal', 'high'],
      default: 'normal'
    },
    ttsSpeed: { 
      type: Number, 
      min: 0.5, 
      max: 2.0,
      default: 1.0
    },
    largeTargets: { 
      type: Boolean,
      default: false
    },
    captions: { 
      type: Boolean,
      default: false
    },
    font: { 
      type: String, 
      enum: ['inter', 'atkinson'],
      default: 'inter'
    }
  },
  confirmMode: { 
    type: String, 
    required: true, 
    enum: ['pin', 'voice', 'biometric'],
    default: 'pin'
  },
  isOnboardingComplete: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

// Index for faster queries
userSchema.index({ phone: 1 });
userSchema.index({ userId: 1 });

const User = mongoose.model('User', userSchema);

export default User;

