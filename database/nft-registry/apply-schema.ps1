# Apply nft_registry schema to local Postgres (Docker Compose).
# Prerequisites: Docker Desktop running.
# Usage: from repo root or this folder:
#   powershell -ExecutionPolicy Bypass -File database/nft-registry/apply-schema.ps1

$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
Set-Location $here

Write-Host "Starting Postgres (docker compose)..." -ForegroundColor Cyan
docker compose up -d

$ready = $false
for ($i = 0; $i -lt 40; $i++) {
  docker exec tracesafe-nft-registry pg_isready -U tracesafe -d nft_registry 2>$null
  if ($LASTEXITCODE -eq 0) { $ready = $true; break }
  Start-Sleep -Seconds 1
}
if (-not $ready) {
  Write-Host "Postgres did not become ready. Is Docker Desktop running?" -ForegroundColor Red
  exit 1
}

Write-Host "Applying 001_schema.sql ..." -ForegroundColor Cyan
Get-Content -Raw "$here\postgres\001_schema.sql" | docker exec -i tracesafe-nft-registry psql -U tracesafe -d nft_registry -v ON_ERROR_STOP=1

Write-Host "Applying 002_triggers.sql ..." -ForegroundColor Cyan
Get-Content -Raw "$here\postgres\002_triggers.sql" | docker exec -i tracesafe-nft-registry psql -U tracesafe -d nft_registry -v ON_ERROR_STOP=1

Write-Host "Verifying schema nft_registry ..." -ForegroundColor Cyan
docker exec tracesafe-nft-registry psql -U tracesafe -d nft_registry -c "\dn nft_registry" -c "\dt nft_registry.*"

Write-Host ""
Write-Host "Local connection string:" -ForegroundColor Green
Write-Host "  postgres://tracesafe:tracesafe_dev@localhost:5433/nft_registry"
Write-Host ""
Write-Host "Deployed server functions cannot reach localhost. Use this URL only with a tunnel" -ForegroundColor Yellow
Write-Host "or set secrets to a hosted DB (Neon, Supabase, RDS, etc.)." -ForegroundColor Yellow
