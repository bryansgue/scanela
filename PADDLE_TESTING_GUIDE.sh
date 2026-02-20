#!/usr/bin/env bash

# PADDLE INTEGRATION TESTING SCRIPT
# ================================
# This script helps you test the Paddle integration locally

echo "🎫 PADDLE INTEGRATION TESTING GUIDE"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}✓ Prerequisites${NC}"
echo "1. Ngrok running: ngrok http 3000"
echo "2. .env.local configured with Paddle credentials"
echo "3. Next.js dev server running: npm run dev"
echo ""

# Step 1: Verify environment
echo -e "${BLUE}1. Verify Environment Variables${NC}"
echo "Checking if Paddle credentials are set..."

if [ -z "$PADDLE_API_KEY" ]; then
    echo -e "${YELLOW}⚠ PADDLE_API_KEY not set${NC}"
else
    echo -e "${GREEN}✓ PADDLE_API_KEY is set${NC}"
fi

if [ -z "$PADDLE_WEBHOOK_SECRET" ]; then
    echo -e "${YELLOW}⚠ PADDLE_WEBHOOK_SECRET not set${NC}"
else
    echo -e "${GREEN}✓ PADDLE_WEBHOOK_SECRET is set${NC}"
fi

if [ -z "$PADDLE_PRICE_MENU_MONTHLY" ]; then
    echo -e "${YELLOW}⚠ PADDLE_PRICE_MENU_MONTHLY not set${NC}"
else
    echo -e "${GREEN}✓ PADDLE_PRICE_MENU_MONTHLY is set${NC}"
fi

if [ -z "$PADDLE_PRICE_MENU_ANNUAL" ]; then
    echo -e "${YELLOW}⚠ PADDLE_PRICE_MENU_ANNUAL not set${NC}"
else
    echo -e "${GREEN}✓ PADDLE_PRICE_MENU_ANNUAL is set${NC}"
fi

echo ""
echo -e "${BLUE}2. Testing Paddle API Connection${NC}"
echo "Calling Paddle API to verify credentials..."

RESPONSE=$(curl -s -X GET "https://api.paddle.com/notification-settings" \
  -H "Authorization: Bearer $PADDLE_API_KEY" \
  -H "Content-Type: application/json")

if echo "$RESPONSE" | grep -q "data"; then
    echo -e "${GREEN}✓ Paddle API connection successful${NC}"
    echo "Webhook URL configured: $(echo "$RESPONSE" | grep -o '"destination":"[^"]*"' | head -1)"
else
    echo -e "${YELLOW}⚠ Paddle API call failed${NC}"
    echo "Response: $RESPONSE"
fi

echo ""
echo -e "${BLUE}3. Manual Testing Steps${NC}"
echo ""
echo "Step 1: Open your browser and navigate to http://localhost:3000/settings"
echo "Step 2: Scroll to 'Nuestros Planes' section"
echo "Step 3: Click on a paid plan (Scanela Menú or Scanela Ventas)"
echo "Step 4: Select a payment method (Stripe is recommended for testing)"
echo "Step 5: You should be redirected to Paddle Checkout"
echo ""

echo -e "${BLUE}4. Testing Webhook Locally${NC}"
echo ""
echo "To simulate a webhook event locally:"
echo ""
echo "Step 1: Get your ngrok URL (format: https://xxxxx.ngrok-free.dev)"
echo "Step 2: In Paddle Dashboard, update Notification Destination URL to:"
echo "        https://xxxxx.ngrok-free.dev/api/billing/webhook"
echo ""
echo "Step 3: Send a test webhook (use Paddle's Webhook Simulator):"
echo ""
echo "curl -X POST http://localhost:3000/api/billing/webhook \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'paddle-signature: ts=1234567890;h1=test_signature' \\"
echo "  -d '{\"event_id\":\"evt_test\",\"event_type\":\"subscription.created\",\"data\":{\"id\":\"sub_test\",\"customer_id\":\"customer_test\"}}'"
echo ""

echo -e "${BLUE}5. Checking Logs${NC}"
echo "Monitor your Next.js console for messages like:"
echo "[checkout] Created checkout for user..."
echo "[webhook] Error verifying webhook signature:"
echo ""

echo -e "${BLUE}6. Database Verification${NC}"
echo "After a successful checkout:"
echo "1. Check 'subscriptions' table for new record"
echo "2. Verify plan_source = 'paddle'"
echo "3. Confirm paddle_subscription_id is populated"
echo ""

echo -e "${GREEN}🎉 Testing guide complete!${NC}"
echo ""
echo "Common Issues:"
echo "- Webhook signature fails: Verify PADDLE_WEBHOOK_SECRET matches Paddle dashboard"
echo "- Checkout fails: Ensure ngrok is running and PADDLE_API_KEY is valid"
echo "- No database updates: Check Supabase connection and RLS policies"
echo ""
