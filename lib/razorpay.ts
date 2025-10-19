import Razorpay from 'razorpay';

// Initialize Razorpay
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Razorpay configuration
export const RAZORPAY_CONFIG = {
  // Test mode - set to false for production
  testMode: process.env.NODE_ENV === 'development',
  
  // Currency
  currency: 'INR',
  
  // Webhook endpoint
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET!,
  
  // Success/Cancel URLs
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
};

// Helper function to create Razorpay order
export async function createRazorpayOrder(
  planId: string,
  amount: number,
  customerEmail: string,
  customerName?: string
) {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `plan_${planId}_${Date.now()}`,
      notes: {
        planId,
        customerEmail,
        source: 'smartbuds_app'
      }
    });
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
}

// Helper function to verify payment
export async function verifyRazorpayPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  try {
    const crypto = require('crypto');
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body.toString())
      .digest('hex');
    
    return expectedSignature === razorpaySignature;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return false;
  }
}

// Helper function to get payment details
export async function getRazorpayPayment(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching Razorpay payment:', error);
    throw error;
  }
}

// Helper function to create customer
export async function createRazorpayCustomer(email: string, name?: string) {
  try {
    const customer = await razorpay.customers.create({
      email,
      name,
      notes: {
        source: 'smartbuds_app'
      }
    });
    return customer;
  } catch (error) {
    console.error('Error creating Razorpay customer:', error);
    throw error;
  }
}
