-- Annual Subscription System Database Schema with Razorpay
-- This creates tables for managing annual subscriptions with Razorpay

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  grade VARCHAR(20) NOT NULL,
  board VARCHAR(50) NOT NULL,
  price_inr INTEGER NOT NULL,
  razorpay_plan_id VARCHAR(255) UNIQUE, -- Optional: Razorpay Plan ID for subscriptions
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
  razorpay_payment_id VARCHAR(255),
  razorpay_customer_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, expired, cancelled
  subscription_start_date DATE NOT NULL,
  subscription_end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment records table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  razorpay_order_id VARCHAR(255) NOT NULL,
  razorpay_payment_id VARCHAR(255),
  amount_inr INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, succeeded, failed, cancelled
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date ON user_subscriptions(subscription_end_date);
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
INSERT INTO subscription_plans (name, grade, board, price_inr) VALUES
('Class 4 CBSE Annual', '4', 'CBSE', 2999),
('Class 5 CBSE Annual', '5', 'CBSE', 2999),
('Class 6 CBSE Annual', '6', 'CBSE', 2999),
('Class 7 CBSE Annual', '7', 'CBSE', 2999),
('Class 8 CBSE Annual', '8', 'CBSE', 2999),
('Class 9 CBSE Annual', '9', 'CBSE', 2999),
('Class 10 CBSE Annual', '10', 'CBSE', 2999),
('Class 4 ICSE Annual', '4', 'ICSE', 2999),
('Class 5 ICSE Annual', '5', 'ICSE', 2999),
('Class 6 ICSE Annual', '6', 'ICSE', 2999),
('Class 7 ICSE Annual', '7', 'ICSE', 2999),
('Class 8 ICSE Annual', '8', 'ICSE', 2999),
('Class 9 ICSE Annual', '9', 'ICSE', 2999),
('Class 10 ICSE Annual', '10', 'ICSE', 2999)
ON CONFLICT (name) DO NOTHING;
