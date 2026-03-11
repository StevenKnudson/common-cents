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
#   - Obtains a Let's Encrypt SSL certificate
#   - Starts the app behind nginx with HTTPS

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

# ── Prepare SSL nginx config ─────────────────────────────────
cp nginx/nginx-ssl.conf nginx/nginx-prod.conf
sed -i "s/server_name _;/server_name $DOMAIN;/g" nginx/nginx-prod.conf
sed -i "s|/etc/letsencrypt/live/app/|/etc/letsencrypt/live/$DOMAIN/|g" nginx/nginx-prod.conf

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

# Build the app and start nginx with init config
docker compose build app
docker compose up -d app
docker run --rm -d --name nginx-init \
  -p 80:80 \
  -v "$(pwd)/nginx/nginx-init.conf:/etc/nginx/conf.d/default.conf:ro" \
  -v certbot-webroot:/var/www/certbot:ro \
  nginx:alpine

# Request the certificate
docker run --rm \
  -v certbot-webroot:/var/www/certbot \
  -v certbot-certs:/etc/letsencrypt \
  certbot/certbot certonly --webroot \
  --webroot-path /var/www/certbot \
  --email "$EMAIL" --agree-tos --no-eff-email \
  -d "$DOMAIN"

# Stop temporary nginx
docker stop nginx-init 2>/dev/null || true
rm -f nginx/nginx-init.conf

# ── Create production docker-compose override ─────────────────
cat > docker-compose.override.yml <<'OVERRIDE'
services:
  app:
    ports: !reset []

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx-prod.conf:/etc/nginx/conf.d/default.conf:ro
      - certbot-webroot:/var/www/certbot:ro
      - certbot-certs:/etc/letsencrypt:ro
    depends_on:
      - app

  certbot:
    image: certbot/certbot
    volumes:
      - certbot-webroot:/var/www/certbot
      - certbot-certs:/etc/letsencrypt
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done'"

volumes:
  certbot-webroot:
  certbot-certs:
OVERRIDE

# ── Start everything ──────────────────────────────────────────
echo "  Starting Common Cents..."
docker compose up -d

echo ""
echo "  ────────────────────────────────────────────"
echo "  Done! Your app is live at:"
echo ""
echo "    https://$DOMAIN"
echo ""
echo "  Data is stored in a Docker volume (app-data)."
echo "  To back up:  docker run --rm -v common-cents_app-data:/data -v \$(pwd):/backup alpine tar czf /backup/data-backup.tar.gz -C /data ."
echo "  ────────────────────────────────────────────"
echo ""
