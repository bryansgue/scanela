#!/usr/bin/env python3
"""
Execute Paddle migration in Supabase
"""
import os
import sys

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ supabase module not found. Install with: pip install supabase")
    sys.exit(1)

# Get Supabase credentials from environment
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Missing environment variables:")
    print("   - NEXT_PUBLIC_SUPABASE_URL")
    print("   - SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

try:
    # Create Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print(f"✓ Connected to Supabase: {SUPABASE_URL}")
    
    # Read migration SQL
    with open("PADDLE_MIGRATION.sql", "r") as f:
        migration_sql = f.read()
    
    print(f"\n📋 Migration SQL ({len(migration_sql)} chars):")
    print("-" * 50)
    print(migration_sql[:300] + "..." if len(migration_sql) > 300 else migration_sql)
    print("-" * 50)
    
    # Execute migration
    print("\n⏳ Executing migration...")
    result = supabase.postgrest.exec(migration_sql)
    print("✅ Migration executed successfully!")
    print(f"Result: {result}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
