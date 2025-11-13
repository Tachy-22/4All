import mongoose from 'mongoose';

const billPaymentSchema = new mongoose.Schema({
  paymentId: { 
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
  providerId: { 
    type: String, 
    required: true 
  },
  accountNumber: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending',
    index: true
  },
  reference: { 
    type: String,
    unique: true,
    sparse: true
  },
  provider: {
    name: { 
      type: String 
    },
    category: { 
      type: String, 
      enum: ['electricity', 'water', 'internet', 'phone', 'tv', 'other'] 
    }
  },
  saveForLater: { 
    type: Boolean, 
    default: false 
  },
  nickname: { 
    type: String 
  },
  timestamp: {
    type: Number,
    default: () => Date.now()
  }
}, { 
  timestamps: true 
});

// Indexes for faster queries
billPaymentSchema.index({ userProfileId: 1, createdAt: -1 });
billPaymentSchema.index({ status: 1 });
billPaymentSchema.index({ providerId: 1 });

const BillPayment = mongoose.model('BillPayment', billPaymentSchema);

export default BillPayment;

