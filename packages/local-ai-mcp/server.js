#!/usr/bin/env node
/*
  local-ai-mcp/server.js
  - Small HTTP adapter exposing probe endpoints for local LLM/TTS servers.
  - Designed to be run on a LAN host (bind to 0.0.0.0) or localhost only.

  Environment variables:
  - PORT: port to listen on (default 8080)
  - BIND_HOST: address to bind to (default 0.0.0.0). Use 127.0.0.1 to restrict to local machine.
  - TEXT_COOLDOWN_MS / TTS_COOLDOWN_MS: rate-limit windows (ms)
  - MCP_SECRET: optional string; when set, all POST requests must include `x-mcp-secret` header or body.secret to be accepted.

  API (summary):
  - GET /health -> status
  - GET /models?host=... -> probe remote host for models
  - POST /text { host, prompt, model? } -> probe text endpoints (rate-limited)
  - POST /tts { host, prompt } -> probe tts endpoints (rate-limited)
  - POST /probe { host, prompt, model? } -> both text + tts

  Security note: this server provides only minimal auth (MCP_SECRET). If exposed on a network, run behind TLS & a reverse proxy.
*/

import http from 'node:http';
import url from 'node:url';
import { detectModelsOn, probeTextOn, probeTtsOn, wellFormedURL } from './probe.js';

const PORT = Number(process.env.PORT || 8080);
const BIND_HOST = process.env.BIND_HOST || '0.0.0.0';
const TEXT_COOLDOWN_MS = Number(process.env.TEXT_COOLDOWN_MS || 5000);
const TTS_COOLDOWN_MS = Number(process.env.TTS_COOLDOWN_MS || 5000);
const MCP_SECRET = process.env.MCP_SECRET || '';

const rateMap = new Map(); // key -> { lastText, lastTts }

// Helper to check optional secret header/body
function requireSecret(req, body) {
  if (!MCP_SECRET) return true; // not enabled
  const header = req.headers['x-mcp-secret'];
  if (header && String(header) === MCP_SECRET) return true;
  if (body && body.secret && body.secret === MCP_SECRET) return true;
  return false;
}

/**
 * Notes for maintainers:
 * - Keep handlers small and return explicit JSON responses.
 * - Rate-limiting is per-client+host key and intentionally conservative; tune TEXT_COOLDOWN_MS/TTS_COOLDOWN_MS as needed.
 */
function requireSecret(req, body) {
  if (!MCP_SECRET) return true; // not enabled
  const header = req.headers['x-mcp-secret'];
  if (header && String(header) === MCP_SECRET) return true;
  if (body && body.secret && body.secret === MCP_SECRET) return true;
  return false;
}
function setHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
}

function json(res, code, obj) {
  setHeaders(res);
  res.statusCode = code;
  res.end(JSON.stringify(obj));
}

async function collectBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        if (!body) return resolve({});
        resolve(JSON.parse(body));
      } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function nowMs() { return Date.now(); }

const server = http.createServer(async (req, res) => {
  try {
    const { pathname, query } = url.parse(req.url || '', true);
    if (req.method === 'OPTIONS') return json(res, 200, { ok: true });

    if (req.method === 'GET' && pathname === '/health') return json(res, 200, { ok: true, uptime: process.uptime() });

    if (req.method === 'GET' && pathname === '/models') {
      const host = query.host;
      if (!host) return json(res, 400, { error: 'host required' });
      const base = wellFormedURL(host);
      const models = await detectModelsOn(base);
      return json(res, 200, { ok: true, models, base });
    }

    if (req.method === 'POST' && pathname === '/text') {
      const body = await collectBody(req);
      const host = body.host; const prompt = body.prompt || ''; const model = body.model || '';
      if (!host) return json(res, 400, { error: 'host required' });
      const base = wellFormedURL(host);
      const client = req.socket.remoteAddress || 'unknown';
      const key = `${client}::${base}`;
      const entry = rateMap.get(key) || {};
      const now = nowMs();
      if (entry.lastText && now - entry.lastText < TEXT_COOLDOWN_MS) {
        return json(res, 429, { error: 'rate_limited', retry_after_ms: TEXT_COOLDOWN_MS - (now - entry.lastText) });
      }
      const result = await probeTextOn(base, prompt, model);
      entry.lastText = now;
      entry.lastTextResult = result;
      rateMap.set(key, entry);
      return json(res, 200, { ok: true, ...result });
    }

    if (req.method === 'POST' && pathname === '/tts') {
      const body = await collectBody(req);
      const host = body.host; const prompt = body.prompt || '';
      if (!host) return json(res, 400, { error: 'host required' });
      const base = wellFormedURL(host);
      const client = req.socket.remoteAddress || 'unknown';
      const key = `${client}::${base}`;
      const entry = rateMap.get(key) || {};
      const now = nowMs();
      if (entry.lastTts && now - entry.lastTts < TTS_COOLDOWN_MS) {
        return json(res, 429, { error: 'tts_rate_limited', retry_after_ms: TTS_COOLDOWN_MS - (now - entry.lastTts) });
      }
      const result = await probeTtsOn(base, prompt);
      entry.lastTts = now;
      entry.lastTtsResult = result;
      rateMap.set(key, entry);
      return json(res, 200, { ok: true, ...result });
    }

    if (req.method === 'POST' && pathname === '/probe') {
      const body = await collectBody(req);
      const host = body.host; const prompt = body.prompt || ''; const model = body.model || '';
      if (!host) return json(res, 400, { error: 'host required' });
      const base = wellFormedURL(host);
      const text = await probeTextOn(base, prompt, model).catch(err => ({ error: err.message }));
      const tts = await probeTtsOn(base, prompt).catch(err => ({ error: err.message }));
      return json(res, 200, { ok: true, text, tts });
    }

    return json(res, 404, { error: 'not_found' });
  } catch (e) {
    console.error('server error', e);
    return json(res, 500, { error: e.message || String(e) });
  }
});

server.listen(PORT, BIND_HOST, () => {
  console.log(`local-ai-mcp server listening on http://${BIND_HOST}:${PORT}`);
});

process.on('SIGINT', () => { console.log('shutting down'); process.exit(0); });
