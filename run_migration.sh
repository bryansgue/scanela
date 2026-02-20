#!/bin/bash
# Execute Paddle migration using Supabase SQL Editor API

echo "🔄 Running Paddle migration..."
echo ""

# Read migration file
MIGRATION=$(cat PADDLE_MIGRATION.sql)

# Get credentials from .env.local
source .env.local

# Check if we have required variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Missing Supabase credentials in .env.local"
    exit 1
fi

echo "📋 Migration steps:"
echo "1. Add paddle_subscription_id column"
echo "2. Add paddle_customer_id column"
echo "3. Add paddle_price_id column"
echo "4. Add paddle_checkout_id column"
echo "5. Create indexes"
echo "6. Add paddle_id to payment_events"
echo ""

# For now, print instructions since we need direct DB access
echo "⚠️  To execute this migration, please:"
echo ""
echo "1. Go to: https://app.supabase.com/project/rjkzfxhaeakfpfylxjii/sql"
echo "2. Click 'New Query'"
echo "3. Paste the contents of PADDLE_MIGRATION.sql"
echo "4. Click 'Run'"
echo ""
echo "📄 Or manually execute each statement:"
echo ""
cat PADDLE_MIGRATION.sql | while IFS= read -r line; do
    if [[ ! -z "$line" && ! "$line" =~ ^-- ]]; then
        echo "  $line"
    fi
done

echo ""
echo "✅ Once executed, the database will be ready for Paddle integration!"
