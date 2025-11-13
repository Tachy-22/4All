import zivaService from '../services/zivaService.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * POST /api/ziva
 * Process conversational AI interaction with Ziva
 */
export const processZivaMessage = async (req, res) => {
  try {
    const { 
      message, 
      profileId, 
      conversationHistory = [],
      emotionalState 
    } = req.body;

    // Validate required fields
    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    // Get user profile for context
    let userProfile = null;
    let context = {
      balance: 120000, // Mock balance
      recentTransactions: [],
      emotionalState: emotionalState || 'neutral'
    };

    if (profileId) {
      userProfile = await User.findOne({ profileId }).lean();
      
      // Get recent transactions for context
      const transactions = await Transaction.find({ userProfileId: profileId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      
      context.recentTransactions = transactions;
      
      // Calculate balance from transactions (in production, get from account service)
      const totalCredits = transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalDebits = transactions
        .filter(t => t.type === 'transfer' || t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);
      context.balance = 120000 + totalCredits - totalDebits;
    }

    // Process message with Ziva AI
    const response = await zivaService.processMessage({
      userMessage: message,
      userProfile,
      conversationHistory,
      context
    });

    res.json({
      success: true,
      response: response.message,
      action: response.action,
      data: response.data,
      emotion: response.emotion,
      suggestions: response.suggestions,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Ziva processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message 
    });
  }
};

/**
 * POST /api/ziva/guidance
 * Get proactive financial guidance from Ziva
 */
export const getProactiveGuidance = async (req, res) => {
  try {
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({ 
        error: 'Profile ID is required' 
      });
    }

    // Get user profile
    const userProfile = await User.findOne({ profileId }).lean();
    if (!userProfile) {
      return res.status(404).json({ 
        error: 'Profile not found' 
      });
    }

    // Get recent transactions
    const transactions = await Transaction.find({ userProfileId: profileId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // Analyze spending patterns
    const analysis = analyzeSpendingPatterns(transactions);

    // Generate proactive guidance
    const guidance = [];

    if (analysis.spendingIncrease > 40) {
      guidance.push({
        type: 'spending_alert',
        severity: 'medium',
        message: `I noticed your spending increased by ${analysis.spendingIncrease}% recently. Would you like me to help you create a budget?`,
        action: 'create_budget',
        icon: 'alert'
      });
    }

    if (analysis.savingsOpportunity > 0) {
      guidance.push({
        type: 'savings_opportunity',
        severity: 'low',
        message: `Based on your income, you could save ₦${analysis.savingsOpportunity.toLocaleString()} this month. Would you like to set up automatic savings?`,
        action: 'setup_savings',
        icon: 'piggy-bank'
      });
    }

    if (analysis.overdraftRisk) {
      guidance.push({
        type: 'overdraft_warning',
        severity: 'high',
        message: `Your balance is running low. Would you like to explore overdraft protection or payment plan options?`,
        action: 'overdraft_protection',
        icon: 'warning'
      });
    }

    res.json({
      success: true,
      guidance,
      analysis: {
        totalSpending: analysis.totalSpending,
        averageTransaction: analysis.averageTransaction,
        spendingTrend: analysis.spendingIncrease > 0 ? 'increasing' : 'decreasing'
      }
    });
  } catch (error) {
    console.error('Proactive guidance error:', error);
    res.status(500).json({ 
      error: 'Failed to generate guidance',
      details: error.message 
    });
  }
};

/**
 * Analyze spending patterns
 */
function analyzeSpendingPatterns(transactions) {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);

  const recentSpending = transactions
    .filter(t => t.timestamp > thirtyDaysAgo && (t.type === 'transfer' || t.type === 'withdrawal'))
    .reduce((sum, t) => sum + t.amount, 0);

  const previousSpending = transactions
    .filter(t => t.timestamp > sixtyDaysAgo && t.timestamp <= thirtyDaysAgo && (t.type === 'transfer' || t.type === 'withdrawal'))
    .reduce((sum, t) => sum + t.amount, 0);

  const spendingIncrease = previousSpending > 0 
    ? Math.round(((recentSpending - previousSpending) / previousSpending) * 100)
    : 0;

  const totalIncome = transactions
    .filter(t => t.timestamp > thirtyDaysAgo && t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsOpportunity = Math.max(0, totalIncome - recentSpending);
  const overdraftRisk = recentSpending > totalIncome * 0.9;

  return {
    totalSpending: recentSpending,
    averageTransaction: transactions.length > 0 ? recentSpending / transactions.length : 0,
    spendingIncrease,
    savingsOpportunity,
    overdraftRisk
  };
}

