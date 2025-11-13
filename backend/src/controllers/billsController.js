import BillPayment from '../models/BillPayment.js';

// Mock provider data
const PROVIDERS = {
  'electricity_provider_001': { name: 'Electricity Company', category: 'electricity' },
  'water_provider_001': { name: 'Water Corporation', category: 'water' },
  'internet_provider_001': { name: 'Internet Service Provider', category: 'internet' },
  'phone_provider_001': { name: 'Mobile Network', category: 'phone' },
  'tv_provider_001': { name: 'Cable TV Service', category: 'tv' }
};

/**
 * POST /api/bills
 * Process bill payments
 */
export const processBillPayment = async (req, res) => {
  try {
    const { 
      providerId, 
      accountNumber, 
      amount, 
      saveForLater, 
      nickname,
      profileId 
    } = req.body;

    // Validate required fields
    if (!providerId) {
      return res.status(400).json({ 
        error: 'Provider ID is required' 
      });
    }

    if (!accountNumber) {
      return res.status(400).json({ 
        error: 'Account number is required' 
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount',
        details: 'Amount must be greater than 0' 
      });
    }

    // Get provider info
    const provider = PROVIDERS[providerId] || { 
      name: 'Unknown Provider', 
      category: 'other' 
    };

    // Generate payment ID and reference
    const paymentId = `bill_${Date.now()}`;
    const timestamp = Date.now();

    // Simulate processing (90% success rate)
    const isSuccessful = Math.random() > 0.1;
    const status = isSuccessful ? 'completed' : 'failed';
    const reference = isSuccessful ? `BP${timestamp.toString().slice(-8)}` : undefined;

    // Create bill payment document
    const payment = await BillPayment.create({
      paymentId,
      userProfileId: profileId || 'default_user',
      providerId,
      accountNumber,
      amount: parseFloat(amount),
      status,
      reference,
      provider,
      saveForLater: saveForLater || false,
      nickname: nickname || null,
      timestamp
    });

    // Format response based on success/failure
    if (isSuccessful) {
      return res.json({
        success: true,
        payment: {
          id: payment.paymentId,
          providerId: payment.providerId,
          accountNumber: payment.accountNumber,
          amount: payment.amount,
          status: payment.status,
          reference: payment.reference,
          timestamp: payment.timestamp,
          provider: payment.provider
        },
        message: 'Bill payment completed successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Payment failed',
        details: 'Insufficient balance or network error',
        payment: {
          id: payment.paymentId,
          status: payment.status,
          reference: payment.reference
        }
      });
    }
  } catch (error) {
    console.error('Bill payment error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process bill payment',
      details: error.message 
    });
  }
};

/**
 * GET /api/bills
 * Get bill payment history
 */
export const getBillPayments = async (req, res) => {
  try {
    const { 
      limit = 10, 
      offset = 0, 
      status,
      profileId 
    } = req.query;

    // Build query filter
    const filter = {};
    if (status) filter.status = status;
    if (profileId) filter.userProfileId = profileId;

    // Execute query with pagination
    const payments = await BillPayment.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await BillPayment.countDocuments(filter);

    // Format response
    const formattedPayments = payments.map(payment => ({
      id: payment.paymentId,
      providerId: payment.providerId,
      accountNumber: payment.accountNumber,
      amount: payment.amount,
      status: payment.status,
      reference: payment.reference,
      timestamp: payment.timestamp,
      provider: payment.provider,
      saveForLater: payment.saveForLater,
      nickname: payment.nickname
    }));

    res.json({
      payments: formattedPayments,
      total,
      hasMore: parseInt(offset) + parseInt(limit) < total
    });
  } catch (error) {
    console.error('Get bill payments error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch bill payments',
      details: error.message 
    });
  }
};

