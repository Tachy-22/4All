import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, accountNumber, amount, saveForLater, nickname } = body;

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock bill payment processing (90% success rate)
    const success = Math.random() > 0.1;
    
    const payment = {
      id: `bill_${Date.now()}`,
      providerId,
      accountNumber,
      amount: parseFloat(amount),
      status: success ? 'completed' : 'failed',
      reference: success ? `BP${Date.now().toString().slice(-8)}` : undefined,
      timestamp: new Date().toISOString(),
      savedForLater: saveForLater,
      nickname
    };

    if (success) {
      return NextResponse.json({
        success: true,
        payment,
        reference: payment.reference,
        message: 'Bill payment completed successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        payment: { ...payment, status: 'failed' },
        message: 'Payment failed - please try again or contact support'
      });
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process bill payment',
        message: 'An error occurred while processing your payment'
      },
      { status: 500 }
    );
  }
}