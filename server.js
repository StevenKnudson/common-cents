'use strict';

/**
 * Common Cents — Local Network Server
 * Serves the app over your Wi-Fi so any device can access it.
 * Requires Node.js (https://nodejs.org) — no npm install needed.
 *
 * Usage:  node server.js
 *    or:  double-click start-server.bat
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');
const url  = require('url');

const PORT      = 3000;
const ROOT      = __dirname;
const DATA_FILE = path.join(ROOT, 'data.json');

// ── MIME types ────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js'  : 'application/javascript; charset=utf-8',
  '.css' : 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico' : 'image/x-icon',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.svg' : 'image/svg+xml',
};

// ── HTTP server ───────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url);

  // Allow any device on the LAN to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.writeHead(204);
    res.end();
    return;
  }

  // ── GET /api/data  (load all app data) ──────────────────────
  if (pathname === '/api/data' && req.method === 'GET') {
    if (!fs.existsSync(DATA_FILE)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{}');
      return;
    }
    fs.readFile(DATA_FILE, 'utf8', (err, raw) => {
      if (err) { res.writeHead(500); res.end('{}'); return; }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(raw);
    });
    return;
  }

  // ── POST /api/data  (save all app data) ─────────────────────
  if (pathname === '/api/data' && req.method === 'POST') {
    let body = '';
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > 150 * 1024 * 1024) {   // 150 MB safety limit
        req.destroy();
        res.writeHead(413);
        res.end('Payload too large');
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      try {
        JSON.parse(body); // validate before writing
        fs.writeFile(DATA_FILE, body, 'utf8', err => {
          if (err) { res.writeHead(500); res.end('Write error'); return; }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('{"ok":true}');
        });
      } catch (e) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
    return;
  }

  // ── Static files (index.html, etc.) ─────────────────────────
  let filePath = (pathname === '/' || pathname === '') ? '/index.html' : pathname;
  // Basic path-traversal prevention
  filePath = path.join(ROOT, filePath.replace(/\.\./g, ''));

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + pathname);
      return;
    }
    const ext  = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

// ── Start ─────────────────────────────────────────────────────
server.listen(PORT, '0.0.0.0', () => {
  // Find the first non-loopback IPv4 address
  let localIp = 'YOUR-PC-IP';
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
        break;
      }
    }
    if (localIp !== 'YOUR-PC-IP') break;
  }

  const line = '─'.repeat(48);
  console.log('');
  console.log('  Common Cents — Local Network Server');
  console.log('  ' + line);
  console.log(`  This PC  :  http://localhost:${PORT}`);
  console.log(`  Network  :  http://${localIp}:${PORT}`);
  console.log('  ' + line);
  console.log('  Open the Network URL on any phone, tablet, or');
  console.log('  computer connected to the same Wi-Fi.');
  console.log('');
  console.log('  Data file :  data.json  (in this folder)');
  console.log('  Press Ctrl+C to stop the server.');
  console.log('');
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ERROR: Port ${PORT} is already in use.`);
    console.error(`  Close any other app using port ${PORT}, or edit`);
    console.error(`  the PORT value at the top of server.js.\n`);
  } else {
    console.error('  Server error:', err.message);
  }
  process.exit(1);
});
