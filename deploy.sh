#!/usr/bin/env bash
set -euo pipefail

# ── Common Cents — Hetzner VPS Deploy Script ──────────────────
# Run this on a fresh Ubuntu 22.04+ Hetzner VPS.
#
# Usage:
#   1. SSH into your server
#   2. Clone the repo:  git clone <your-repo-url> common-cents && cd common-cents
#   3. Run:  sudo bash deploy.sh yourdomain.com your@email.com
#
# This script:
#   - Installs Docker & Docker Compose (if missing)
#   - Generates a secure .env file
#   - Obtains a Let's Encrypt SSL certificate
#   - Builds and starts the full stack (PostgreSQL + API + Web + nginx)

DOMAIN="${1:?Usage: sudo bash deploy.sh <domain> <email>}"
EMAIL="${2:?Usage: sudo bash deploy.sh <domain> <email>}"

echo ""
echo "  Common Cents — Deploying to $DOMAIN"
echo "  ────────────────────────────────────────────"
echo ""

# ── Install Docker if needed ──────────────────────────────────
if ! command -v docker &>/dev/null; then
  echo "  Installing Docker..."
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
  echo "  Docker installed."
fi

# ── Generate .env if missing ─────────────────────────────────
if [ ! -f .env ]; then
  echo "  Generating .env..."
  DB_PASSWORD=$(openssl rand -hex 24)
  JWT_SECRET=$(openssl rand -hex 32)
  cat > .env <<ENVEOF
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
WEB_URL=https://$DOMAIN
ENVEOF
  chmod 600 .env
  echo "  .env created with secure random secrets."
fi

# ── Update nginx config with actual domain ────────────────────
sed -i "s/server_name _;/server_name $DOMAIN;/g" nginx/nginx.conf
sed -i "s|/etc/letsencrypt/live/app/|/etc/letsencrypt/live/$DOMAIN/|g" nginx/nginx.conf

# ── Get SSL certificate ──────────────────────────────────────
echo "  Obtaining SSL certificate for $DOMAIN..."

# Start nginx temporarily with HTTP-only config for cert challenge
cat > nginx/nginx-init.conf <<'INITEOF'
server {
    listen 80;
    server_name _;
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        return 200 'Setting up...';
        add_header Content-Type text/plain;
    }
}
INITEOF

docker run --rm -d --name nginx-init \
  -p 80:80 \
  -v "$(pwd)/nginx/nginx-init.conf:/etc/nginx/conf.d/default.conf:ro" \
  -v common-cents_certbot-webroot:/var/www/certbot:ro \
  nginx:alpine

# Request the certificate
docker run --rm \
  -v common-cents_certbot-webroot:/var/www/certbot \
  -v common-cents_certbot-certs:/etc/letsencrypt \
  certbot/certbot certonly --webroot \
  --webroot-path /var/www/certbot \
  --email "$EMAIL" --agree-tos --no-eff-email \
  -d "$DOMAIN"

# Stop temporary nginx
docker stop nginx-init 2>/dev/null || true
rm -f nginx/nginx-init.conf

# ── Build and start everything ────────────────────────────────
echo "  Building and starting Common Cents..."
docker compose up -d --build

echo ""
echo "  ────────────────────────────────────────────"
echo "  Done! Your app is live at:"
echo ""
echo "    https://$DOMAIN"
echo ""
echo "  Stack:"
echo "    - PostgreSQL 16"
echo "    - Express API (port 4000 internal)"
echo "    - React frontend"
echo "    - nginx reverse proxy with SSL"
echo ""
echo "  Useful commands:"
echo "    docker compose logs -f          # view logs"
echo "    docker compose exec api sh      # shell into API"
echo "    docker compose down             # stop everything"
echo "    docker compose up -d --build    # rebuild & restart"
echo ""
echo "  Database backup:"
echo "    docker compose exec db pg_dump -U commoncents commoncents > backup.sql"
echo "  ────────────────────────────────────────────"
echo ""
