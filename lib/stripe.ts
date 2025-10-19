import Stripe from 'stripe';

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

// Stripe configuration
export const STRIPE_CONFIG = {
  // Test mode - set to false for production
  testMode: process.env.NODE_ENV === 'development',
  
  // Currency
  currency: 'usd',
  
  // Webhook endpoint
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  
  // Success/Cancel URLs
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
};

// Helper function to create Stripe customer
export async function createStripeCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'smartbuds_app',
      },
    });
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

// Helper function to create subscription
export async function createStripeSubscription(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          source: 'smartbuds_app',
        },
      },
    });
    return session;
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    throw error;
  }
}

// Helper function to cancel subscription
export async function cancelStripeSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return subscription;
  } catch (error) {
    console.error('Error cancelling Stripe subscription:', error);
    throw error;
  }
}

// Helper function to get subscription details
export async function getStripeSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error fetching Stripe subscription:', error);
    throw error;
  }
}
