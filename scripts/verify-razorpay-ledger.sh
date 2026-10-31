#!/usr/bin/env bash
# Applies the access migrations to a THROWAWAY Postgres database and runs the
# Razorpay ledger tests. PG_TEST_URL must point at an empty scratch server;
# never point it at the live Supabase project.
set -euo pipefail
: "${PG_TEST_URL:?Set PG_TEST_URL to a scratch Postgres server, e.g. postgres://postgres@localhost:5432/postgres}"
cd "$(dirname "$0")/.."
DB="razorpay_ledger_test_$$"
psql "$PG_TEST_URL" -v ON_ERROR_STOP=1 -q -c "create database $DB"
trap 'psql "$PG_TEST_URL" -q -c "drop database if exists $DB" >/dev/null' EXIT
TEST_URL="${PG_TEST_URL%/*}/$DB"
run() { psql "$TEST_URL" -v ON_ERROR_STOP=1 -q -X -t -A "$@"; }
run -f scripts/fixtures/supabase-auth-stub.sql
# The foundation migration ends with Storage bucket policies, which need Supabase Storage.
sed '/insert into storage.buckets/,$d' supabase/migrations/202609080001_independent_platform.sql | run
for file in \
  supabase/migrations/202609080004_unified_access_commerce.sql \
  supabase/migrations/202609230006_customer_page_access_requests.sql \
  supabase/migrations/20261002101301_secure_email_code_redemption_and_expiry.sql \
  supabase/migrations/20261020224754_independent_feature_permission_reads.sql \
  supabase/migrations/20261031120000_razorpay_page_purchases.sql \
  supabase/migrations/20261031120000_razorpay_page_purchases.sql \
  supabase/migrations/20261101090000_upi_direct_payments.sql \
  supabase/migrations/20261101090000_upi_direct_payments.sql; do
  run -f "$file"
done
run -f scripts/verify-razorpay-ledger.sql
