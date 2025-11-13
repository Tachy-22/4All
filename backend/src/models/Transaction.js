import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, { _id: false });

const transactionSchema = new mongoose.Schema({
  transactionId: { 
    type: String, 
    unique: true, 
    required: true,
    index: true
  },
  userProfileId: { 
    type: String, 
    ref: 'User', 
    required: true,
    index: true
  },
  type: { 
    type: String, 
    enum: ['transfer', 'bill_payment', 'deposit', 'withdrawal'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'], 
    default: 'pending',
    index: true
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  recipient: { 
    type: String 
  },
  sender: {
    type: String
  },
  recipientAccount: { 
    type: String 
  },
  account: { 
    type: String 
  },
  description: { 
    type: String 
  },
  narration: { 
    type: String 
  },
  reference: { 
    type: String,
    unique: true,
    sparse: true
  },
  timestamp: {
    type: Number,
    default: () => Date.now()
  },
  timeline: [timelineSchema],
  metadata: {
    channel: {
      type: String,
      default: 'mobile_app'
    },
    location: String,
    confirmationMethod: {
      type: String,
      enum: ['pin', 'voice', 'biometric']
    }
  }
}, { 
  timestamps: true 
});

// Indexes for faster queries
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ userProfileId: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

