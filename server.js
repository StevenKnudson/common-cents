'use strict';

/**
 * Common Cents — Multi-User Server
 * Each user has their own account and private data.
 * Requires Node.js (https://nodejs.org) — no npm install needed.
 *
 * Usage:  node server.js
 *    or:  double-click start-server.bat
 */

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const url    = require('url');
const crypto = require('crypto');

const PORT       = 3000;
const ROOT       = __dirname;
const USERS_FILE = path.join(ROOT, 'users.json');

// In-memory sessions: token → username (lowercased)
const sessions = new Map();

// ── User store helpers ────────────────────────────────────────
function loadUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); }
  catch (_) { return {}; }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(salt + password).digest('hex');
}

function genToken() {
  return crypto.randomBytes(32).toString('hex');
}

// One data file per user — only allow safe filename characters
function dataFile(username) {
  return path.join(ROOT, `data-${username.replace(/[^a-z0-9_-]/g, '_')}.json`);
}

// Extract the authenticated username from the Authorization header, or null
function getAuthUser(req) {
  const h = req.headers['authorization'] || '';
  const m = h.match(/^Bearer (.+)$/);
  return m ? (sessions.get(m[1]) || null) : null;
}

// Read the full request body, capped at 150 MB
function readBody(req, res, cb) {
  let body = '';
  let size = 0;
  req.on('data', chunk => {
    size += chunk.length;
    if (size > 150 * 1024 * 1024) {
      req.destroy();
      res.writeHead(413);
      res.end('Payload too large');
    }
    body += chunk;
  });
  req.on('end', () => cb(body));
}

function jsonReply(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

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

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.writeHead(204);
    res.end();
    return;
  }

  // ── POST /api/register ──────────────────────────────────────
  if (pathname === '/api/register' && req.method === 'POST') {
    readBody(req, res, body => {
      try {
        const { username, password } = JSON.parse(body);
        if (!username || !password)
          return jsonReply(res, 400, { error: 'Username and password required' });
        if (!/^[a-zA-Z0-9_-]{2,32}$/.test(username))
          return jsonReply(res, 400, { error: 'Username must be 2–32 characters: letters, numbers, _ or -' });
        if (password.length < 6)
          return jsonReply(res, 400, { error: 'Password must be at least 6 characters' });

        const users = loadUsers();
        if (users[username.toLowerCase()])
          return jsonReply(res, 409, { error: 'Username already taken' });

        const salt = crypto.randomBytes(16).toString('hex');
        const hash = hashPassword(password, salt);
        users[username.toLowerCase()] = { username, salt, hash };
        saveUsers(users);

        const token = genToken();
        sessions.set(token, username.toLowerCase());
        jsonReply(res, 200, { token, username });
      } catch (_) {
        jsonReply(res, 400, { error: 'Invalid request' });
      }
    });
    return;
  }

  // ── POST /api/login ─────────────────────────────────────────
  if (pathname === '/api/login' && req.method === 'POST') {
    readBody(req, res, body => {
      try {
        const { username, password } = JSON.parse(body);
        if (!username || !password)
          return jsonReply(res, 400, { error: 'Username and password required' });

        const users = loadUsers();
        const user  = users[username.toLowerCase()];
        if (!user || hashPassword(password, user.salt) !== user.hash)
          return jsonReply(res, 401, { error: 'Invalid username or password' });

        const token = genToken();
        sessions.set(token, username.toLowerCase());
        jsonReply(res, 200, { token, username: user.username });
      } catch (_) {
        jsonReply(res, 400, { error: 'Invalid request' });
      }
    });
    return;
  }

  // ── POST /api/logout ────────────────────────────────────────
  if (pathname === '/api/logout' && req.method === 'POST') {
    const h = req.headers['authorization'] || '';
    const m = h.match(/^Bearer (.+)$/);
    if (m) sessions.delete(m[1]);
    jsonReply(res, 200, { ok: true });
    return;
  }

  // ── GET /api/data  (load this user's data) ──────────────────
  if (pathname === '/api/data' && req.method === 'GET') {
    const user = getAuthUser(req);
    if (!user) return jsonReply(res, 401, { error: 'Not authenticated' });

    const file = dataFile(user);
    if (!fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{}');
      return;
    }
    fs.readFile(file, 'utf8', (err, raw) => {
      if (err) { res.writeHead(500); res.end('{}'); return; }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(raw);
    });
    return;
  }

  // ── POST /api/data  (save this user's data) ─────────────────
  if (pathname === '/api/data' && req.method === 'POST') {
    const user = getAuthUser(req);
    if (!user) return jsonReply(res, 401, { error: 'Not authenticated' });

    readBody(req, res, body => {
      try {
        JSON.parse(body); // validate before writing
        fs.writeFile(dataFile(user), body, 'utf8', err => {
          if (err) { res.writeHead(500); res.end('Write error'); return; }
          jsonReply(res, 200, { ok: true });
        });
      } catch (_) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
    return;
  }

  // ── Static files (index.html, etc.) ─────────────────────────
  let filePath = (pathname === '/' || pathname === '') ? '/index.html' : pathname;
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
  console.log('  Common Cents — Multi-User Server');
  console.log('  ' + line);
  console.log(`  This PC  :  http://localhost:${PORT}`);
  console.log(`  Network  :  http://${localIp}:${PORT}`);
  console.log('  ' + line);
  console.log('  Each user logs in with their own account.');
  console.log('  User data is stored separately per user.');
  console.log('');
  console.log('  User data :  data-{username}.json  (in this folder)');
  console.log('  Accounts  :  users.json  (in this folder)');
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
