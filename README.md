# Common Cents 💰

A simple, self-hosted accounting web app — no subscriptions, no cloud, no dependencies.

## Features

- **Dashboard** — at-a-glance revenue, expenses, net income, and invoice summaries
- **Chart of Accounts** — create and manage asset, liability, equity, revenue, and expense accounts
- **Transactions** — record income, expenses, and transfers; attach receipt images or PDFs
- **Invoices** — create line-item invoices, track status (draft → sent → overdue → paid), generate printable PDFs
- **Reports** — Profit & Loss, Balance Sheet, and General Ledger

## Tech Stack

- Vanilla HTML + CSS + JavaScript — zero frameworks, zero npm
- `localStorage` for single-device use, or...
- **Local network server** (`server.js`) for multi-device access over Wi-Fi

## Getting Started

### Single Device (no install needed)
Just open `index.html` directly in your browser. Data is saved to `localStorage`.

### Multi-Device (local network)
Requires [Node.js](https://nodejs.org/) (no packages needed).

1. Double-click **`start-server.bat`** (Windows)
2. Open the printed URL on any device on your network:
   ```
   http://<your-local-ip>:3000
   ```
3. Data is stored in `data.json` and shared across all devices

> **Note:** `data.json` is excluded from version control (`.gitignore`) to protect your financial data.

## File Overview

| File | Description |
|------|-------------|
| `index.html` | The entire app — HTML, CSS, and JavaScript in one file |
| `server.js` | Minimal Node.js HTTP server for local network access |
| `start-server.bat` | Windows launcher — double-click to start the server |

## Invoice PDF

Go to **Invoices → ⚙ Business Info** to enter your business name, address, email, and phone.
Then click **🖨 PDF** on any invoice to open a print-ready page. Use **Save as PDF** in the browser print dialog.

---

Built with ❤️ using vanilla web technologies.
