import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import BillPayment from '../models/BillPayment.js';
import AnalyticsEvent from '../models/Analytics.js';

dotenv.config();

const sampleUsers = [
  {
    profileId: 'p_demo_visual',
    name: 'Ada Okafor',
    phone: '+2348012345678',
    language: 'en',
    interactionMode: 'voice',
    disabilities: ['visual'],
    cognitiveScore: 6,
    uiComplexity: 'simplified',
    accessibilityPreferences: {
      fontSize: 20,
      contrast: 'high',
      ttsSpeed: 1.0,
      largeTargets: true,
      captions: false,
      font: 'inter'
    },
    confirmMode: 'voice',
    isOnboardingComplete: true
  },
  {
    profileId: 'p_demo_motor',
    name: 'Chidi Nwosu',
    phone: '+2348087654321',
    language: 'en',
    interactionMode: 'voice',
    disabilities: ['motor'],
    cognitiveScore: 7,
    uiComplexity: 'moderate',
    accessibilityPreferences: {
      fontSize: 16,
      contrast: 'normal',
      ttsSpeed: 1.0,
      largeTargets: true,
      captions: false,
      font: 'inter'
    },
    confirmMode: 'voice',
    isOnboardingComplete: true
  },
  {
    profileId: 'p_demo_cognitive',
    name: 'Ngozi Eze',
    phone: '+2348098765432',
    language: 'pcm',
    interactionMode: 'text',
    disabilities: ['cognitive'],
    cognitiveScore: 3,
    uiComplexity: 'simplified',
    accessibilityPreferences: {
      fontSize: 18,
      contrast: 'normal',
      ttsSpeed: 0.8,
      largeTargets: false,
      captions: false,
      font: 'inter'
    },
    confirmMode: 'pin',
    isOnboardingComplete: true
  }
];

const sampleTransactions = [
  {
    transactionId: 'txn_demo_001',
    userProfileId: 'p_demo_visual',
    type: 'transfer',
    status: 'completed',
    amount: 15000,
    currency: 'NGN',
    recipient: 'Chidi Nwosu',
    sender: 'Ada Okafor',
    description: 'Rent payment',
    reference: 'TRF/2024/001',
    timestamp: Date.now() - 86400000,
    timeline: [
      {
        status: 'pending',
        timestamp: Date.now() - 86400000,
        description: 'Transaction initiated'
      },
      {
        status: 'completed',
        timestamp: Date.now() - 86400000 + 2000,
        description: 'Transfer completed successfully'
      }
    ],
    metadata: {
      channel: 'mobile_app',
      confirmationMethod: 'voice'
    }
  },
  {
    transactionId: 'txn_demo_002',
    userProfileId: 'p_demo_motor',
    type: 'transfer',
    status: 'completed',
    amount: 5000,
    currency: 'NGN',
    recipient: 'Ngozi Eze',
    sender: 'Chidi Nwosu',
    description: 'Grocery money',
    reference: 'TRF/2024/002',
    timestamp: Date.now() - 43200000,
    timeline: [
      {
        status: 'pending',
        timestamp: Date.now() - 43200000,
        description: 'Transaction initiated'
      },
      {
        status: 'completed',
        timestamp: Date.now() - 43200000 + 2000,
        description: 'Transfer completed successfully'
      }
    ],
    metadata: {
      channel: 'mobile_app',
      confirmationMethod: 'voice'
    }
  }
];

const sampleBillPayments = [
  {
    paymentId: 'bill_demo_001',
    userProfileId: 'p_demo_visual',
    providerId: 'electricity_provider_001',
    accountNumber: '1234567890',
    amount: 8000,
    status: 'completed',
    reference: 'BP12345678',
    provider: {
      name: 'Electricity Company',
      category: 'electricity'
    },
    saveForLater: true,
    nickname: 'Home Electricity',
    timestamp: Date.now() - 172800000
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/4all_db');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await BillPayment.deleteMany({});
    await AnalyticsEvent.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert sample data
    await User.insertMany(sampleUsers);
    console.log(`✅ Inserted ${sampleUsers.length} sample users`);

    await Transaction.insertMany(sampleTransactions);
    console.log(`✅ Inserted ${sampleTransactions.length} sample transactions`);

    await BillPayment.insertMany(sampleBillPayments);
    console.log(`✅ Inserted ${sampleBillPayments.length} sample bill payments`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSample profiles:');
    console.log('- p_demo_visual (Visual impairment)');
    console.log('- p_demo_motor (Motor impairment)');
    console.log('- p_demo_cognitive (Cognitive support)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

