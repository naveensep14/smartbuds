import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayPayment, getRazorpayPayment } from '@/lib/razorpay';
import { subscriptionService } from '@/lib/subscription';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, orderId } = await request.json();

    if (!paymentId || !orderId) {
      return NextResponse.json(
        { error: 'Missing paymentId or orderId' },
        { status: 400 }
      );
    }

    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Get payment details from Razorpay
    const payment = await getRazorpayPayment(paymentId);
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Verify payment signature (optional - for extra security)
    // const isValid = await verifyRazorpayPayment(orderId, paymentId, signature);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    // }

    // Get subscription details
    const subscription = await subscriptionService.getUserSubscription(user.id);
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Update subscription status if payment is successful
    if (payment.status === 'captured') {
      await subscriptionService.updateSubscriptionStatus(
        orderId,
        'active',
        paymentId,
        payment.customer_id
      );
    }

    return NextResponse.json({
      success: true,
      subscription: {
        ...subscription,
        status: payment.status === 'captured' ? 'active' : subscription.status,
      },
      payment: {
        id: payment.id,
        amount: Number(payment.amount) / 100, // Convert from paise
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        createdAt: new Date(payment.created_at * 1000),
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
