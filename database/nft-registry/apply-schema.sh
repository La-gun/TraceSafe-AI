#!/usr/bin/env bash
# Apply nft_registry schema (Docker Compose). Run from this directory.
set -euo pipefail
cd "$(dirname "$0")"

echo "Starting Postgres (docker compose)..."
docker compose up -d

for i in $(seq 1 40); do
  if docker exec tracesafe-nft-registry pg_isready -U tracesafe -d nft_registry >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "Applying 001_schema.sql ..."
docker exec -i tracesafe-nft-registry psql -U tracesafe -d nft_registry -v ON_ERROR_STOP=1 < postgres/001_schema.sql

echo "Applying 002_triggers.sql ..."
docker exec -i tracesafe-nft-registry psql -U tracesafe -d nft_registry -v ON_ERROR_STOP=1 < postgres/002_triggers.sql

echo "Verifying schema nft_registry ..."
docker exec tracesafe-nft-registry psql -U tracesafe -d nft_registry -c '\dn nft_registry' -c '\dt nft_registry.*'

echo ""
echo "Local: postgres://tracesafe:tracesafe_dev@localhost:5433/nft_registry"
echo "Use a hosted Postgres URL in server function environment for deployed functions."
