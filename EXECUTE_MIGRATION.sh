#!/bin/bash
# Quick script to show SQL migration needed

cat > /tmp/paddle_migration.sql << 'EOF'
-- Paddle Integration Migration
-- Execute these queries in Supabase SQL Editor
-- https://app.supabase.com/project/rjkzfxhaeakfpfylxjii/sql/new

-- Step 1: Add Paddle columns to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paddle_price_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paddle_checkout_id TEXT;

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_sub_id 
  ON subscriptions(paddle_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_cust_id 
  ON subscriptions(paddle_customer_id);

-- Step 3: Add Paddle ID column to payment_events
ALTER TABLE payment_events ADD COLUMN IF NOT EXISTS paddle_id TEXT;

-- Done!
EOF

echo "📋 SQL Migration Script Created!"
echo ""
echo "📝 Copy the following and paste into Supabase SQL Editor:"
echo "   https://app.supabase.com/project/rjkzfxhaeakfpfylxjii/sql/new"
echo ""
echo "🔗 Direct link: https://app.supabase.com/projects"
echo ""
cat /tmp/paddle_migration.sql
echo ""
echo "✅ After executing, your database will be ready for Paddle!"
