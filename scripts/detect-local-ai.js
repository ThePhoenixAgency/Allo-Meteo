#!/usr/bin/env node

import os from 'os';

const PORTS = [6667, 6666];
const ENDPOINT = '/generate';
const TIMEOUT = 3000;

function getIPv4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

async function probe(url, body = { prompt: 'ping' }) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal });
    clearTimeout(id);
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (e) { json = null; }
    return { ok: res.ok, status: res.status, text, json };
  } catch (e) {
    return { ok: false, error: e.message || e };
  }
}

(async function main(){
  const localIp = getIPv4();
  console.log('Local IPv4 detected:', localIp || '[none]');

  const candidates = new Set();
  candidates.add('http://localhost');
  if (localIp) {
    const parts = localIp.split('.');
    if (parts.length === 4) {
      const prefix = parts.slice(0,3).join('.');
      candidates.add(`http://${localIp}`);
      candidates.add(`http://${prefix}.1`);
      candidates.add(`http://${prefix}.254`);
    }
  }

  console.log('Probing candidates (ports:', PORTS.join(', '), '):');
  for (const base of candidates) {
    for (const port of PORTS) {
      const url = `${base}:${port}${ENDPOINT}`;
      process.stdout.write(`- Testing ${url} ... `);
      const r = await probe(url);
      if (!r.ok) {
        if (r.error) console.log(`ERROR (${r.error})`);
        else console.log(`HTTP ${r.status} - no usable JSON`);
        if (r.json && r.json.error) console.log('  -> JSON error:', r.json.error);
        if (r.text && typeof r.text === 'string' && r.text.length>0) console.log('  -> Body preview:', r.text.slice(0,200));
        continue;
      }
      console.log(`OK (HTTP ${r.status})`);
      if (r.json) {
        console.log('  -> JSON preview:', JSON.stringify(r.json).slice(0,500));
      } else {
        console.log('  -> Text preview:', r.text.slice(0,200));
      }
    }
  }

  console.log('\nDone. If none responded, consider running `npm run local-ai` to start the mock on port 6667 or check LM Studio settings.');
})();
