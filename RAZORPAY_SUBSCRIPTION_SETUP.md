# Razorpay Subscription Setup Guide

This guide will help you set up Razorpay for handling annual subscriptions in your SmartBuds application.

## Prerequisites

1. Razorpay account (sign up at https://razorpay.com)
2. Supabase project with database access
3. Next.js application running locally

## Step 1: Razorpay Account Setup

1. **Create Razorpay Account**
   - Go to https://razorpay.com and sign up
   - Complete KYC verification
   - Activate your account

2. **Get API Keys**
   - Go to Dashboard → Settings → API Keys
   - Copy your `Key ID` and `Key Secret`
   - Note: Use Test keys for development, Live keys for production

## Step 2: Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# App Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Database Setup

Run the subscription schema migration:

```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U postgres -d postgres -f scripts/sql/create-subscription-schema.sql
```

Or use the Supabase dashboard SQL editor to run the contents of `scripts/sql/create-subscription-schema.sql`.

## Step 4: Webhook Configuration

1. **Create Webhook in Razorpay Dashboard**
   - Go to Dashboard → Settings → Webhooks
   - Click "Add New Webhook"
   - URL: `https://your-domain.com/api/subscription/webhook`
   - Events to capture:
     - `payment.captured`
     - `payment.failed`
   - Copy the webhook secret and add it to your environment variables

2. **For Local Testing**
   - Use ngrok or similar tool to expose your local server
   - Set webhook URL to your ngrok URL + `/api/subscription/webhook`

## Step 5: Test the Integration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test subscription flow:**
   - Go to `/subscription`
   - Select a grade and board
   - Click "Subscribe Now"
   - Use Razorpay test cards for payment

## Test Cards

Use these test card numbers for testing:

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Pricing

The system is configured with ₹2,999 annual subscriptions for all grades and boards, valid until April 30th of the following year.

## Features

- ✅ Annual subscriptions only
- ✅ Grade and board specific access
- ✅ Automatic subscription expiry (April 30th)
- ✅ Payment verification
- ✅ Webhook handling
- ✅ User subscription management
- ✅ Access control based on active subscriptions

## Troubleshooting

1. **Payment not processing**
   - Check Razorpay API keys are correct
   - Verify webhook URL is accessible
   - Check browser console for errors

2. **Subscription not activating**
   - Check webhook is receiving events
   - Verify database connection
   - Check webhook secret matches

3. **Access denied after payment**
   - Verify subscription status in database
   - Check subscription end date
   - Ensure user is logged in

## Production Deployment

1. **Switch to Live Keys**
   - Replace test API keys with live keys
   - Update webhook URL to production domain
   - Test with real payment methods

2. **Security**
   - Ensure webhook secret is properly configured
   - Use HTTPS for all endpoints
   - Implement proper error handling

## Support

For issues with this integration:
- Check Razorpay documentation: https://razorpay.com/docs/
- Review webhook logs in Razorpay dashboard
- Check application logs for errors
