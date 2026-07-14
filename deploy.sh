#!/bin/bash
set -euo pipefail

# ==================================================
# STARK FACTORY — App Deployment Script
# App: Cyph Mission Control
# ==================================================

# --- CONFIG (change these per app) ---
PROJECT_ID="cyberize-nextjs-staging"
REGION="us-east1"
SERVICE_NAME="cyph-mission-ctrl-prod"

# --- PUBLIC VARIABLES (change these per app) ---
NEXT_PUBLIC_APP_URL="https://mission-portal.cyberizedev.com"
NEXT_PUBLIC_SITE_URL="https://mission-portal.cyberizedev.com"
NEXT_PUBLIC_SUPABASE_URL="https://yrsuwikjnbmvpznrgydb.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_8FvPLZTmChxMrPwv7q9-rw_NgjoDk1S"

# --- EXECUTION (do not modify below this line) ---
echo "=================================================="
echo "🤖 Stark Deployment Agent: Initiating Sequence"
echo "   Project: $PROJECT_ID"
echo "   Region:  $REGION"
echo "   Service: $SERVICE_NAME"
echo "   URL:     $NEXT_PUBLIC_APP_URL"
echo "=================================================="

gcloud config set project "$PROJECT_ID" --quiet

echo "🚀 Submitting Cloud Build..."
gcloud builds submit \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --config cloudbuild.yaml \
  --substitutions \
    _REGION="$REGION",\
    _SERVICE_NAME="$SERVICE_NAME",\
    _NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL",\
    _NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL",\
    _NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL",\
    _NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"

echo "=================================================="
echo "✅ Deployment Sequence Complete."
echo "   Service: $SERVICE_NAME"
echo "   URL:     $NEXT_PUBLIC_APP_URL"
echo "=================================================="
