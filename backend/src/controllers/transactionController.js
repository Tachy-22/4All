import Transaction from '../models/Transaction.js';

/**
 * GET /api/transactions
 * Retrieve user transaction history with filtering and pagination
 */
export const getTransactions = async (req, res) => {
  try {
    const { 
      limit = 10, 
      offset = 0, 
      status, 
      type,
      profileId 
    } = req.query;

    // Build query filter
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (profileId) filter.userProfileId = profileId;

    // Execute query with pagination
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Transaction.countDocuments(filter);

    // Transform transactions to match frontend format
    const formattedTransactions = transactions.map(txn => ({
      id: txn.transactionId,
      type: txn.type,
      status: txn.status,
      amount: txn.amount,
      currency: txn.currency || 'NGN',
      recipient: txn.recipient,
      sender: txn.sender,
      description: txn.description,
      reference: txn.reference,
      timestamp: txn.timestamp,
      timeline: txn.timeline || [],
      metadata: txn.metadata || {}
    }));

    res.json({
      transactions: formattedTransactions,
      total,
      hasMore: parseInt(offset) + parseInt(limit) < total
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transactions',
      details: error.message 
    });
  }
};

/**
 * POST /api/transactions
 * Create new transaction (transfer)
 */
export const createTransaction = async (req, res) => {
  try {
    const { 
      type, 
      amount, 
      recipient, 
      recipientAccount, 
      account, 
      description, 
      narration,
      profileId,
      confirmationMethod 
    } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount',
        details: 'Amount must be greater than 0' 
      });
    }

    if (!recipient) {
      return res.status(400).json({ 
        error: 'Recipient is required' 
      });
    }

    // Generate transaction ID and reference
    const transactionId = `txn_${Date.now()}`;
    const reference = `TRF/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000000)}`;
    const timestamp = Date.now();

    // Create transaction timeline
    const timeline = [
      {
        status: 'pending',
        timestamp,
        description: 'Transaction initiated'
      }
    ];

    // Simulate processing (90% success rate)
    const isSuccessful = Math.random() > 0.1;
    const finalStatus = isSuccessful ? 'completed' : 'failed';

    if (isSuccessful) {
      timeline.push({
        status: 'completed',
        timestamp: timestamp + 2000,
        description: 'Transfer completed successfully'
      });
    } else {
      timeline.push({
        status: 'failed',
        timestamp: timestamp + 2000,
        description: 'Transfer failed - insufficient funds or network error'
      });
    }

    // Create transaction document
    const transaction = await Transaction.create({
      transactionId,
      userProfileId: profileId || 'default_user',
      type: type || 'transfer',
      status: finalStatus,
      amount: parseFloat(amount),
      currency: 'NGN',
      recipient,
      sender: 'Current User', // In production, get from auth
      recipientAccount,
      account,
      description: description || `Transfer to ${recipient}`,
      narration,
      reference,
      timestamp,
      timeline,
      metadata: {
        channel: 'mobile_app',
        confirmationMethod: confirmationMethod || 'pin'
      }
    });

    // Format response
    const response = {
      id: transaction.transactionId,
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      recipient: transaction.recipient,
      sender: transaction.sender,
      description: transaction.description,
      reference: transaction.reference,
      timestamp: transaction.timestamp,
      timeline: transaction.timeline,
      metadata: transaction.metadata
    };

    res.json({
      success: isSuccessful,
      transaction: response,
      message: isSuccessful 
        ? 'Transaction initiated successfully' 
        : 'Transaction failed - please try again'
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ 
      error: 'Failed to create transaction',
      details: error.message 
    });
  }
};

