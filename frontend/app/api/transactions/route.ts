import { NextRequest, NextResponse } from 'next/server';

const mockTransactions = [
  {
    id: 'txn_001',
    type: 'credit',
    amount: 15000,
    description: 'Salary Credit',
    date: '2024-01-10',
    status: 'completed',
    reference: 'SAL/2024/001',
    account: 'Savings'
  },
  {
    id: 'txn_002',
    type: 'debit',
    amount: 3500,
    description: 'Grocery Shopping',
    date: '2024-01-09',
    status: 'completed',
    reference: 'POS/2024/002',
    account: 'Current'
  },
  {
    id: 'txn_003',
    type: 'debit',
    amount: 12000,
    description: 'Rent Payment',
    date: '2024-01-08',
    status: 'pending',
    reference: 'TRF/2024/003',
    account: 'Current'
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');
  const status = searchParams.get('status');

  let filteredTransactions = [...mockTransactions];
  
  if (status) {
    filteredTransactions = filteredTransactions.filter(txn => txn.status === status);
  }

  const paginatedTransactions = filteredTransactions
    .slice(offset, offset + limit);

  return NextResponse.json({
    transactions: paginatedTransactions,
    total: filteredTransactions.length,
    hasMore: offset + limit < filteredTransactions.length
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, amount, recipient, account, description } = body;

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock transaction creation
    const transaction = {
      id: `txn_${Date.now()}`,
      type: type || 'debit',
      amount: parseFloat(amount),
      description: description || `Transfer to ${recipient}`,
      recipient,
      account,
      date: new Date().toISOString().split('T')[0],
      status: Math.random() > 0.1 ? 'completed' : 'failed', // 90% success rate
      reference: `TRF/2024/${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      transaction,
      message: transaction.status === 'completed' 
        ? 'Transaction completed successfully' 
        : 'Transaction failed - please try again'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process transaction',
        message: 'An error occurred while processing your transaction'
      },
      { status: 500 }
    );
  }
}