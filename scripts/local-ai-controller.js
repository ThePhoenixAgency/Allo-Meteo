#!/usr/bin/env node
/*
  local-ai-controller.js
  - Small helper HTTP controller to start/stop the mock local AI server from other machines or via the UI.
  - Provides endpoints:
    POST /start  -> spawns scripts/local-ai-server.js as a detached process
    POST /stop   -> attempts to stop the spawned process
    GET  /status -> returns running status and local IPs
    GET  /ip     -> list of LAN IP addresses

  Environment & usage:
  - CONTROLLER_PORT: port to listen on (default 6789)
  - BIND_HOST: host to bind (default 0.0.0.0)
  - The controller is intentionally minimal; it uses process spawning and is best used for local development only.
*/

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

let child = null;
const PORT = Number(process.env.CONTROLLER_PORT || 6789);
const BIND_HOST = process.env.BIND_HOST || '0.0.0.0';
const MOCK_SCRIPT = path.resolve(__dirname, 'local-ai-server.js');

const os = require('os');
function getLocalIPs() {
  const nets = os.networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) results.push(net.address);
    }
  }
  return results;
}

// Security: controller exposes CORS headers in responses to be callable from browsers or UIs; don't expose it publicly without firewall or auth.


function startMock(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (child) {
    res.end(JSON.stringify({ ok: true, message: 'Already running', pid: child.pid }));
    return;
  }
  child = spawn(process.execPath, [MOCK_SCRIPT], { stdio: ['ignore', 'pipe', 'pipe'], detached: true, env: { ...process.env } });
  child.unref();
  child.stdout && child.stdout.on('data', d => process.stdout.write(`[mock] ${d}`));
  child.stderr && child.stderr.on('data', d => process.stderr.write(`[mock err] ${d}`));
  child.on('exit', (code, sig) => { console.log(`mock exited ${code} ${sig}`); child = null; });
  res.end(JSON.stringify({ ok: true, message: 'Started', pid: child.pid }));
}

function stopMock(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (!child) {
    res.end(JSON.stringify({ ok: true, message: 'Not running' }));
    return;
  }
  try {
    process.kill(-child.pid, 'SIGTERM'); // kill group
  } catch (e) {
    try { child.kill('SIGTERM'); } catch (e2) {}
  }
  res.end(JSON.stringify({ ok: true, message: 'Stopping' }));
}

function status(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify({ ok: true, running: !!child, pid: child ? child.pid : null, localIPs: getLocalIPs() }));
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS'); res.setHeader('Access-Control-Allow-Headers', '*'); res.end(); return; }
  if (req.method === 'POST' && req.url === '/start') return startMock(res);
  if (req.method === 'POST' && req.url === '/stop') return stopMock(res);
  if (req.method === 'GET' && req.url === '/status') return status(res);
  if (req.method === 'GET' && req.url === '/ip') { res.setHeader('Access-Control-Allow-Origin', '*'); res.end(JSON.stringify({ ok: true, localIPs: getLocalIPs() })); return; }
  res.statusCode = 404; res.end(JSON.stringify({ error: 'nope' }));
});

server.listen(PORT, BIND_HOST, () => {
  console.log(`local-ai-controller listening on http://${BIND_HOST}:${PORT}`);
  console.log(`Local interfaces: ${getLocalIPs().join(', ')}`);
});

process.on('SIGINT', () => { console.log('controller exiting'); process.exit(0); });
