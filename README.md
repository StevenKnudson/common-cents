# Common Cents

A simple, self-hosted accounting web app — no subscriptions, no frameworks, no dependencies.

## Features

- **Dashboard** — at-a-glance revenue, expenses, net income, cash position, and invoice summaries
- **Chart of Accounts** — create and manage asset, liability, equity, revenue, and expense accounts
- **Transactions** — record income, expenses, and transfers; attach receipt images or PDFs
- **Invoices** — create line-item invoices, track status (draft → sent → overdue → paid), generate printable PDFs
- **Reports** — Profit & Loss, Balance Sheet, and General Ledger
- **Cloud Sync** — optional GitHub Gist integration for syncing data across devices

## Tech Stack

- Vanilla HTML + CSS + JavaScript — zero frameworks, zero npm packages
- Node.js HTTP server (no dependencies) for multi-device and Docker deployments
- Three-tier data storage: GitHub Gist (cloud) → local network server (`data.json`) → browser `localStorage`
- Docker + Nginx + Let's Encrypt for production hosting

## Getting Started

### Single Device (no install needed)

Open `index.html` directly in your browser. Data is saved to `localStorage`.

### Multi-Device (local network)

Requires [Node.js](https://nodejs.org/) (no packages needed).

1. **Windows:** Double-click `start-server.bat`
2. **Other OS:** Run `node server.js`
3. Open the printed URL on any device on your network:
   ```
   http://<your-local-ip>:3000
   ```
4. Data is stored in `data.json` and shared across all devices

### Docker

Build and run with Docker Compose:

```bash
docker-compose up -d
```

This starts two services:

| Service | Purpose |
|---------|---------|
| **app** | Node.js server on port 3000 |
| **nginx** | Reverse proxy on port 80 |

App data is persisted in a Docker volume (`app-data`). For production with HTTPS, use `deploy.sh` instead.

### VPS Deployment (one-click)

For a fresh Ubuntu 22.04+ server (e.g. Hetzner):

```bash
git clone <repo-url> common-cents && cd common-cents
sudo bash deploy.sh yourdomain.com your@email.com
```

This installs Docker, generates SSL certificates, configures Nginx, and starts all containers.

## Cloud Sync

To sync data across devices using a GitHub Gist:

1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens) with `gist` scope
2. In the app, go to **Settings** and enter your token
3. Data will sync to a private Gist, accessible from any device running the app

The token is stored only in your browser's `localStorage` and is never committed to code.

## Invoice PDF

Go to **Invoices → Business Info** to enter your business name, address, email, and phone.
Then click **PDF** on any invoice to open a print-ready page. Use **Save as PDF** in the browser print dialog.

## File Overview

| File | Description |
|------|-------------|
| `index.html` | The entire app — HTML, CSS, and JavaScript in one file |
| `server.js` | Minimal Node.js HTTP server for local network and Docker use |
| `start-server.bat` | Windows launcher — double-click to start the server |
| `Dockerfile` | Container image definition (Node 20 Alpine) |
| `docker-compose.yml` | Docker deployment with app and Nginx |
| `deploy.sh` | One-click VPS deployment script with SSL (Ubuntu) |
| `nginx/nginx.conf` | Reverse proxy configuration (HTTP) |
| `nginx/nginx-ssl.conf` | SSL reverse proxy template (used by `deploy.sh`) |

> **Note:** `data.json` is excluded from version control (`.gitignore`) to protect your financial data.
