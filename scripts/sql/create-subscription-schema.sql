-- Annual Subscription System Database Schema
-- This creates tables for managing annual subscriptions with Stripe

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  grade VARCHAR(20) NOT NULL,
  board VARCHAR(50) NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL,
  stripe_price_id VARCHAR(255) UNIQUE NOT NULL, -- Stripe Price ID
  stripe_product_id VARCHAR(255) NOT NULL, -- Stripe Product ID
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled, past_due, unpaid
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment records table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  amount_usd DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, succeeded, failed, cancelled
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- RLS Policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can read subscription plans
CREATE POLICY "Users can read subscription plans" ON subscription_plans
  FOR SELECT USING (true);

-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can read their own payments
CREATE POLICY "Users can read own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Insert sample subscription plans
INSERT INTO subscription_plans (name, grade, board, price_usd, stripe_price_id, stripe_product_id) VALUES
('Class 4 CBSE Annual', '4', 'CBSE', 39.99, 'price_class4_cbse_annual', 'prod_class4_cbse'),
('Class 5 CBSE Annual', '5', 'CBSE', 39.99, 'price_class5_cbse_annual', 'prod_class5_cbse'),
('Class 6 CBSE Annual', '6', 'CBSE', 39.99, 'price_class6_cbse_annual', 'prod_class6_cbse'),
('Class 7 CBSE Annual', '7', 'CBSE', 39.99, 'price_class7_cbse_annual', 'prod_class7_cbse'),
('Class 8 CBSE Annual', '8', 'CBSE', 39.99, 'price_class8_cbse_annual', 'prod_class8_cbse'),
('Class 9 CBSE Annual', '9', 'CBSE', 39.99, 'price_class9_cbse_annual', 'prod_class9_cbse'),
('Class 10 CBSE Annual', '10', 'CBSE', 39.99, 'price_class10_cbse_annual', 'prod_class10_cbse'),
('Class 4 ICSE Annual', '4', 'ICSE', 39.99, 'price_class4_icse_annual', 'prod_class4_icse'),
('Class 5 ICSE Annual', '5', 'ICSE', 39.99, 'price_class5_icse_annual', 'prod_class5_icse'),
('Class 6 ICSE Annual', '6', 'ICSE', 39.99, 'price_class6_icse_annual', 'prod_class6_icse'),
('Class 7 ICSE Annual', '7', 'ICSE', 39.99, 'price_class7_icse_annual', 'prod_class7_icse'),
('Class 8 ICSE Annual', '8', 'ICSE', 39.99, 'price_class8_icse_annual', 'prod_class8_icse'),
('Class 9 ICSE Annual', '9', 'ICSE', 39.99, 'price_class9_icse_annual', 'prod_class9_icse'),
('Class 10 ICSE Annual', '10', 'ICSE', 39.99, 'price_class10_icse_annual', 'prod_class10_icse')
ON CONFLICT (stripe_price_id) DO NOTHING;
