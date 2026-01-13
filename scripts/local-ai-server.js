#!/usr/bin/env node
/*
  local-ai-server.js (mock)
  - Minimal HTTP mock implementation to emulate a local LLM + TTS server during development.
  - Endpoints:
    POST /generate -> returns a simple text bulletin
    POST /tts      -> returns a tiny base64-encoded sample audio payload
    GET  /_status  -> health/status
    POST /_stop    -> stop the server (used by controller)

  Notes:
  - The mock is intentionally tiny and safe for local dev only. For production or integration tests, prefer the real LM Studio / qwen / OpenAI endpoints.
*/

import http from 'node:http';

const PORT = 6667;

const MOCK_TEXT = `[METEO] Température 1°C, ressenti -2°C, humidité 78%, pression 1013 hPa, pluie 0,3 mm, neige 0 cm. Inversion thermique non détectée.
[ROUTE] RD1091 dégagée avec quelques plaques de gel. Trafic fluide.
[STATIONS] Alpe d'Huez : 0°C\nLes 2 Alpes : -2°C\nVaujany : -1°C\nOz-en-Oisans : -1°C\nSaint-Christophe-en-Oisans : -3°C\nVillard-Reculas : -4°C
[RISQUES] sismique : très faible. crues : vert.
[EVENEMENTS] Marché des producteurs à Bourg-d'Oisans\nCourse de ski de fond à Vaujany\nConcert "Cimes & Son" à la Maison des Sports
[LUNE] Pleine Lune`;
const SAMPLE_AUDIO_BASE64 = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=';

const server = http.createServer((req, res) => {
  const { method, url } = req;
  if (method === 'POST' && url === '/generate') {
    collectRequestBody(req)
      .then((body) => {
        console.log('Mock /generate prompt:', body.prompt || '[vide]');
        response(res, 200, { text: MOCK_TEXT, sources: [{ name: 'local-mock-llm' }], prompt: body.prompt });
      })
      .catch((error) => response(res, 400, { error: error.message }));
    return;
  }

  if (method === 'POST' && url === '/tts') {
    collectRequestBody(req)
      .then((body) => {
        console.log('Mock /tts prompt:', body.prompt || '[vide]');
        response(res, 200, { audio: SAMPLE_AUDIO_BASE64 });
      })
      .catch((error) => response(res, 400, { error: error.message }));
    return;
  }

  response(res, 404, { error: 'Not found' });
});

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

server.on('request', (req, res) => {
  // existing handler - already handled above by server callback
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIPs();
  console.log(`Mock local AI server listening on http://0.0.0.0:${PORT}`);
  if (ips.length) console.log(`Accessible on LAN at: ${ips.map(ip => `http://${ip}:${PORT}`).join(', ')}`);
  console.log('Endpoints: POST /generate, POST /tts, GET /_status, POST /_stop');
});

// add status and stop handlers
const http = require('http');
// monkey patch to add /_status and /_stop in the handler above (simple approach)
const originalHandler = server.emit;
server.emit = function(ev, req, res) {
  if (ev === 'request') {
    const url = req.url || req.pathname || '';
    if (req.method === 'GET' && url === '/_status') return response(res, 200, { ok: true, running: true, pid: process.pid });
    if (req.method === 'POST' && url === '/_stop') { response(res, 200, { ok: true, message: 'Stopping' }); setTimeout(() => process.exit(0), 250); return; }
  }
  return originalHandler.apply(this, arguments);
};

function response(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(payload));
}

function collectRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        if (!body) {
          resolve({});
          return;
        }
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}
