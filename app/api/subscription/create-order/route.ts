import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';
import { subscriptionService } from '@/lib/subscription';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { planId, amount } = await request.json();

    if (!planId || !amount) {
      return NextResponse.json(
        { error: 'Missing planId or amount' },
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

    // Get subscription plan details
    const plans = await subscriptionService.getAllPlans();
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Check if user already has an active subscription for this grade/board
    const existingSubscription = await subscriptionService.getUserSubscription(user.id);
    if (existingSubscription && 
        existingSubscription.plan?.grade === plan.grade && 
        existingSubscription.plan?.board === plan.board &&
        existingSubscription.status === 'active') {
      return NextResponse.json(
        { error: 'You already have an active subscription for this grade and board' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await createRazorpayOrder(
      planId,
      amount,
      user.email!,
      user.user_metadata?.full_name || user.email!
    );

    // Create subscription record (pending status)
    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
    subscriptionEndDate.setMonth(3); // April
    subscriptionEndDate.setDate(30); // 30th April

    const subscription = await subscriptionService.createSubscription({
      userId: user.id,
      planId: plan.id,
      razorpayOrderId: order.id,
      subscriptionStartDate,
      subscriptionEndDate,
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Failed to create subscription record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: 'SmartBuds',
      description: plan.name,
      prefill: {
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
      },
      theme: {
        color: '#1a2633'
      }
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
