# Stripe Subscription Setup Guide

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_... # Your Stripe webhook secret
NEXT_PUBLIC_APP_URL=http://localhost:3000 # Your app URL
```

## Getting Stripe Keys

1. **Sign up for Stripe**: Go to https://stripe.com
2. **Get Test Keys**: 
   - Go to Developers > API Keys
   - Copy "Publishable key" (starts with `pk_test_`)
   - Copy "Secret key" (starts with `sk_test_`)
3. **Set up Webhook**:
   - Go to Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/subscription/webhook`
   - Select events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`
   - Copy webhook secret (starts with `whsec_`)

## Database Setup

Run the SQL script to create subscription tables:

```sql
-- Run this in your Supabase SQL editor
\i scripts/sql/create-subscription-schema.sql
```

## Testing

1. **Test Mode**: Use Stripe test cards
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

2. **Test Flow**:
   - Go to `/subscription`
   - Select grade and board
   - Click "Subscribe Now"
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout

## Production Setup

1. **Switch to Live Keys**: Replace test keys with live keys
2. **Update Webhook URL**: Point to production domain
3. **Test with Real Cards**: Use small amounts first

## Features Implemented

✅ Database schema for annual subscriptions
✅ Stripe integration with checkout sessions
✅ Subscription plans page with grade/board selection
✅ Success and cancel pages
✅ Subscription service for database operations
✅ TypeScript types for subscriptions

## Next Steps

1. Add environment variables
2. Run database migration
3. Test subscription flow
4. Add access control middleware
5. Create subscription management dashboard
