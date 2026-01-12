import { config } from 'dotenv';

config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const requiredEnv = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Faltan variables de entorno: ${missing.join(', ')}`);
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const LIMIT = Number(process.env.SUPABASE_INSPECT_LIMIT || 5);

async function fetchTableSample(table, columns = '*', orderColumn = 'created_at') {
  const query = supabase
    .from(table)
    .select(columns)
    .limit(LIMIT);

  if (orderColumn) {
    query.order(orderColumn, { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error(`Error consultando ${table}:`, error.message);
    return [];
  }
  return data || [];
}

async function run() {
  console.log(`📊 Leyendo tablas (limite ${LIMIT})...`);
  const [businesses, menus, orders, subscriptions, paymentEvents] = await Promise.all([
    fetchTableSample('businesses', 'id,user_id,name,created_at,updated_at'),
    fetchTableSample('menus', 'id,business_id,business_name,theme,menu_data,updated_at'),
    fetchTableSample('orders', 'id,business_id,customer_name,status,total,created_at'),
    fetchTableSample(
      'subscriptions',
      'id,user_id,plan,plan_source,plan_metadata,status,billing_period,cancel_at_period_end,current_period_start,current_period_end,stripe_customer_id,stripe_subscription_id,last_payment_status,last_payment_at,updated_at'
    ),
    fetchTableSample('payment_events', 'id,user_id,event_type,stripe_id,created_at'),
  ]);

  const result = {
    timestamp: new Date().toISOString(),
    businesses,
    menus,
    orders,
    subscriptions,
    paymentEvents,
  };

  console.dir(result, { depth: null, colors: true });
}

run().catch((err) => {
  console.error('Error ejecutando inspección:', err);
  process.exit(1);
});
