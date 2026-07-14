#!/bin/bash
set -euo pipefail

# ==================================================
# STARK FACTORY — One-Time App Setup
# App: Cyph Mission Control | Project: cyberize-nextjs-staging
# IDEMPOTENT — safe to run multiple times.
# ==================================================

PROJECT_ID="cyberize-nextjs-staging"
REGION="us-east1"
APP_NAME="cyph-mission-ctrl"

echo "=================================================="
echo "🤖 Stark Factory: Initializing $APP_NAME"
echo "   Project: $PROJECT_ID | Region: $REGION"
echo "=================================================="

gcloud config set project "$PROJECT_ID" --quiet
gcloud config set run/region "$REGION" --quiet

# --- ENABLE APIs ---
echo "📌 Enabling APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com \
  artifactregistry.googleapis.com secretmanager.googleapis.com iam.googleapis.com
echo "   ✅ APIs enabled."

# --- ARTIFACT REGISTRY (shared across apps) ---
REPO_NAME="cloud-run-source-deploy"
echo "📦 Checking Artifact Registry..."
if gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" &>/dev/null; then
  echo "   ✅ Repo exists."
else
  gcloud artifacts repositories create "$REPO_NAME" \
    --repository-format=docker --location="$REGION" \
    --description="Docker repository for Cloud Run"
  echo "   ✅ Repo created."
fi

# --- CREATE SECRETS ---
echo "🔐 Creating secrets..."

SECRET_NAME="${APP_NAME}-supabase-secret-key"
if gcloud secrets describe "$SECRET_NAME" --project "$PROJECT_ID" &>/dev/null; then
  echo "   ✅ $SECRET_NAME exists."
else
  echo -n "REPLACE_WITH_ACTUAL_VALUE" | gcloud secrets create "$SECRET_NAME" \
    --data-file=- --project "$PROJECT_ID"
  echo "   ✅ Created $SECRET_NAME — ⚠️ UPDATE THE VALUE!"
  echo "      Run: echo -n 'real-value' | gcloud secrets versions add $SECRET_NAME --data-file=- --project $PROJECT_ID"
fi

# --- RUNTIME SERVICE ACCOUNT ---
RUNTIME_SA="sa-${APP_NAME}-runtime"
echo "👤 Checking runtime SA..."
if gcloud iam service-accounts describe "${RUNTIME_SA}@${PROJECT_ID}.iam.gserviceaccount.com" &>/dev/null; then
  echo "   ✅ Runtime SA exists."
else
  gcloud iam service-accounts create "$RUNTIME_SA" \
    --display-name="${APP_NAME} Runtime SA" --project "$PROJECT_ID"
  echo "   ✅ Runtime SA created."
fi

# --- BUILD SA BINDINGS ---
echo "🔑 Build SA bindings..."
BUILD_ID="$(gcloud builds list --project "$PROJECT_ID" --region "$REGION" --limit=1 --format='value(id)' 2>/dev/null || echo '')"
if [ -z "$BUILD_ID" ]; then
  echo "   ⚠️ No builds yet — re-run this script after your first deploy."
else
  BUILD_SA="$(gcloud builds describe "$BUILD_ID" --project "$PROJECT_ID" --region "$REGION" --format='value(serviceAccount)')"
  BUILD_SA_EMAIL="${BUILD_SA##*/serviceAccounts/}"
  echo "   Build SA: $BUILD_SA_EMAIL"
  # No build-time secrets for this app — nothing to bind.
  echo "   ✅ Build SA bindings complete (none required)."
fi

# --- RUNTIME SA BINDINGS ---
echo "🔑 Runtime SA bindings..."
RUNTIME_SA_EMAIL="${RUNTIME_SA}@${PROJECT_ID}.iam.gserviceaccount.com"
gcloud secrets add-iam-policy-binding "${APP_NAME}-supabase-secret-key" \
  --project "$PROJECT_ID" \
  --member="serviceAccount:${RUNTIME_SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor" --quiet
echo "   ✅ Runtime SA bindings complete."

# --- VERIFICATION ---
echo ""
echo "=================================================="
echo "🔍 VERIFICATION"
echo "=================================================="
echo "Secrets:"
gcloud secrets list --project "$PROJECT_ID" --format="table(name)" --filter="name:${APP_NAME}"
echo ""
echo "Runtime SA:"
gcloud iam service-accounts describe "${RUNTIME_SA_EMAIL}" --project "$PROJECT_ID" --format="value(email)" 2>/dev/null \
  && echo "   ✅ Exists" || echo "   ❌ NOT FOUND"
echo ""
echo "=================================================="
echo "✅ Init complete for $APP_NAME."
echo "   Next step: ./deploy.sh"
echo "=================================================="
