-- Add Paddle columns to subscriptions table
-- This migration adds support for Paddle payment provider

-- Add Paddle-specific columns if they don't exist
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paddle_price_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paddle_checkout_id TEXT;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_sub_id 
  ON subscriptions(paddle_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_cust_id 
  ON subscriptions(paddle_customer_id);

-- Update payment_events table to support Paddle
ALTER TABLE payment_events ADD COLUMN IF NOT EXISTS paddle_id TEXT;

-- Add comment to table
COMMENT ON COLUMN subscriptions.paddle_subscription_id IS 'Paddle subscription ID (format: sub_*)';
COMMENT ON COLUMN subscriptions.paddle_customer_id IS 'Paddle customer ID (same as user_id)';
COMMENT ON COLUMN subscriptions.paddle_price_id IS 'Paddle price ID (format: pri_*)';
COMMENT ON COLUMN subscriptions.paddle_checkout_id IS 'Paddle checkout ID (format: chk_*)';
COMMENT ON COLUMN payment_events.paddle_id IS 'Paddle event or resource ID';
