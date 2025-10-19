import { NextRequest, NextResponse } from 'next/server';
import { createStripeCustomer, createStripeSubscription, STRIPE_CONFIG } from '@/lib/stripe';
import { subscriptionService } from '@/lib/subscription';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { planId, stripePriceId } = await request.json();

    if (!planId || !stripePriceId) {
      return NextResponse.json(
        { error: 'Missing planId or stripePriceId' },
        { status: 400 }
      );
    }

    // Get user from request (you'll need to implement auth middleware)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For now, we'll get user from session cookie
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

    // Create or get Stripe customer
    let customerId: string;
    try {
      // Try to find existing customer
      const { data: existingCustomer } = await supabase
        .from('user_subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (existingCustomer?.stripe_customer_id) {
        customerId = existingCustomer.stripe_customer_id;
      } else {
        // Create new customer
        const customer = await createStripeCustomer(
          user.email!,
          user.user_metadata?.full_name || user.email!
        );
        customerId = customer.id;
      }
    } catch (error) {
      console.error('Error handling Stripe customer:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    // Create checkout session
    const session = await createStripeSubscription(
      customerId,
      stripePriceId,
      `${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      `${STRIPE_CONFIG.cancelUrl}?plan_id=${planId}`
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
