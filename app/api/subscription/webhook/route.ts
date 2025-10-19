import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayPayment, getRazorpayPayment } from '@/lib/razorpay';
import { subscriptionService } from '@/lib/subscription';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('Razorpay webhook event:', event.type);

    switch (event.type) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentCaptured(payment: any) {
  try {
    console.log('Payment captured:', payment.id);
    
    // Get subscription by order ID
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('razorpay_order_id', payment.order_id)
      .single();

    if (error || !subscription) {
      console.error('Subscription not found for order:', payment.order_id);
      return;
    }

    // Update subscription status to active
    await subscriptionService.updateSubscriptionStatus(
      payment.order_id,
      'active',
      payment.id,
      payment.customer_id
    );

    // Create payment record
    await subscriptionService.createPayment({
      userId: subscription.user_id,
      subscriptionId: subscription.id,
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
      amountInr: payment.amount / 100, // Convert from paise
      status: 'succeeded',
    });

    console.log('Subscription activated for user:', subscription.user_id);
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    console.log('Payment failed:', payment.id);
    
    // Get subscription by order ID
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('razorpay_order_id', payment.order_id)
      .single();

    if (error || !subscription) {
      console.error('Subscription not found for order:', payment.order_id);
      return;
    }

    // Update subscription status to failed
    await subscriptionService.updateSubscriptionStatus(
      payment.order_id,
      'cancelled'
    );

    // Create payment record
    await subscriptionService.createPayment({
      userId: subscription.user_id,
      subscriptionId: subscription.id,
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
      amountInr: payment.amount / 100, // Convert from paise
      status: 'failed',
    });

    console.log('Subscription marked as failed for user:', subscription.user_id);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}
