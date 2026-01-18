/*
  probe.js
  - Utilities to probe a remote local LLM/TTS server (LM Studio, custom HTTP inference).
  - Small, dependency-free helpers used by the MCP server to detect models, test text endpoints and test TTS endpoints.

  Notes for maintainers:
  - TIMEOUTS and endpoint lists are conservative to support many vendors; modify TEXT_ENDPOINTS / TTS_ENDPOINTS if you have a custom server.
  - Extraction logic tries many plausible shapes (OpenAI-style, LM Studio /v1/responses, custom inference outputs).
  - Token counting falls back to a simple heuristic if the server doesn't provide usage fields.
*/

import { setTimeout as wait } from 'node:timers/promises';
import dns from 'node:dns';
import { URL } from 'node:url';

// Candidate endpoints we probe for text generation. Keep this list ordered by most-likely/common endpoints.
const TEXT_ENDPOINTS = ['/v1/responses', '/v1/chat/completions', '/v1/completions', '/generate', '/api/generate', '/api/inference', '/api/v1/generate', '/api/completions', '/completions', '/inference'];

// Candidate endpoints we probe for Text-To-Speech (TTS)
const TTS_ENDPOINTS = ['/tts', '/api/tts', '/api/speech', '/v1/tts', '/api/v1/tts'];

// Basic IP range checks to avoid SSRF into localhost/metadata/private networks.
function isPrivateOrLoopbackIp(ip) {
  // IPv4 checks
  const v4 = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (v4) {
    const [, aStr, bStr] = v4;
    const a = Number(aStr), b = Number(bStr);
    if (a === 127) return true; // loopback 127.0.0.0/8
    if (ip === '0.0.0.0') return true;
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // link-local 169.254.0.0/16
  }
  // IPv6 checks
  const lower = ip.toLowerCase();
  if (lower === '::1') return true; // loopback
  if (lower.startsWith('fe80:')) return true; // link-local
  if (lower.startsWith('fc00:') || lower.startsWith('fd00:')) return true; // unique local
  return false;
}

const lookupAsync = (host) => new Promise((resolve, reject) => {
  dns.lookup(host, { all: false }, (err, address) => {
    if (err) return reject(err);
    resolve(address.address || address);
  });
});

async function normalizeAndValidateBase(hostOrUrl) {
  if (!hostOrUrl || typeof hostOrUrl !== 'string') {
    throw new Error('invalid_host');
  }
  let candidate = hostOrUrl.trim();
  if (!candidate) throw new Error('invalid_host');

  // Prepend scheme if missing.
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `http://${candidate}`;
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error('invalid_host');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('invalid_host');
  }

  if (!parsed.hostname) {
    throw new Error('invalid_host');
  }

  // Basic hostname sanity: no obvious path traversal characters.
  if (/[\/\\]/.test(parsed.hostname)) {
    throw new Error('invalid_host');
  }

  // Resolve hostname and block localhost/private ranges.
  let ip;
  try {
    ip = await lookupAsync(parsed.hostname);
  } catch {
    throw new Error('invalid_host');
  }
  if (isPrivateOrLoopbackIp(ip)) {
    throw new Error('invalid_host');
  }

  // Normalize by removing trailing slash from origin + pathname base (but keep host/port).
  const base = `${parsed.protocol}//${parsed.host}`.replace(/\/$/, '');
  return base;
}

// Extra safety: ensure that values used as `base` for outgoing requests are origin-like
// (scheme + host[:port]) and do not contain any additional path or query components.
function ensureSafeBase(base) {
  if (!base || typeof base !== 'string') {
    throw new Error('invalid_host');
  }
  const trimmed = base.trim();
  // Must look like "<scheme>://<host[:port]>" with no trailing slash or path segment.
  const originPattern = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^/]+$/;
  if (!originPattern.test(trimmed)) {
    throw new Error('invalid_host');
  }
  return trimmed;
}

/**
 * detectModelsOn(base)
 * - Probes `${base}/v1/models` for available model identifiers (LM Studio style).
 * - Returns an array of model ids if found, else an empty array.
 * - This is best-effort: many servers do not expose /v1/models; callers should handle empty lists.
 */
export async function detectModelsOn(base) {
  try {
    // Validate and normalize the base URL to prevent SSRF
    const safeBase = await normalizeAndValidateBase(base);
    const validBase = ensureSafeBase(safeBase);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Use URL constructor to help CodeQL understand the URL is validated
    const modelsUrl = new URL('/v1/models', validBase).toString();

    const res = await fetch(modelsUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const json = await res.json().catch(() => null);
    if (!json) return [];
    if (Array.isArray(json.models)) return json.models.map(m => m.id).filter(Boolean);
    if (Array.isArray(json)) return json.map(m => (m.id || m)).filter(Boolean);
    return [];
  } catch (e) {
    // Swallow errors to keep detection robust and non-fatal for callers
    return [];
  }
}

/**
 * extractTextFromResponse(json)
 * - Try to extract a human-readable text from a variety of response shapes.
 * - Supports: plain string, { text }, OpenAI-like { choices }, LM Studio { output: [{ content: [...] }] }, and generic arrays.
 * - Returns the extracted string or null if nothing usable is found.
 */
function extractTextFromResponse(json) {
  if (!json) return null;
  if (typeof json === 'string') return json;
  if (json.text && typeof json.text === 'string') return json.text;
  if (json.generated_text && typeof json.generated_text === 'string') return json.generated_text;
  if (json.choices && Array.isArray(json.choices) && json.choices[0]) {
    const ch = json.choices[0];
    if (typeof ch.text === 'string') return ch.text;
    if (ch.message && ch.message.content && typeof ch.message.content === 'string') return ch.message.content;
  }
  if (Array.isArray(json.output)) {
    return json.output.map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join('\n');
  }
  // LM Studio /v1/responses form - fallback
  const outText = json.output?.map?.(o => {
    if (o?.content) return o.content.map(c => c.text || '').join('');
    return o?.text || '';
  }).join('\n');
  if (outText) return outText;
  return null;
}

/**
 * probeTextOn(base, prompt, model)
 * - Attempts many payload shapes across TEXT_ENDPOINTS to find a working text endpoint.
 * - Returns { text, sources, perf, endpoint } on success.
 * - Throws Error when no endpoint matches; caller should catch and handle fallback logic.
 */
export async function probeTextOn(base, prompt, model) {
  // Validate and normalize the base URL to prevent SSRF
  const safeBase = await normalizeAndValidateBase(base);
  const validBase = ensureSafeBase(safeBase);

  const payloads = [
    ...(model ? [{ model, input: prompt }, { model, messages: [{ role: 'user', content: prompt }] }] : []),
    { prompt }, { input: prompt }, { inputs: prompt }, { text: prompt }, { messages: [{ role: 'user', content: prompt }] }, { model: 'default', prompt }
  ];

  const t0 = Date.now();
  for (const p of TEXT_ENDPOINTS) {
    for (const body of payloads) {
      try {
        // Use URL constructor to help CodeQL understand the URL is validated
        const url = new URL(p, validBase).toString();
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), timeout: 5000 });
        const text = await res.text();
        let json = null;
        try { json = JSON.parse(text); } catch (e) { json = null; }
        if (res.ok && json) {
          const extracted = extractTextFromResponse(json) || extractTextFromResponse(json.candidates?.[0]) || extractTextFromResponse(json.choices?.[0]);
          if (extracted) {
            const tokens = json?.usage?.total_tokens || json?.usage?.total || json?.token_count || Math.max(1, Math.round((extracted.split(/\s+/).length) / 0.75));
            const perf = { latencyMs: Date.now() - t0, tokens };
            return { text: extracted, sources: json.sources || json.metadata || [], perf, endpoint: url };
          }
        }
      } catch (e) {
        // ignore and continue
      }
      // avoid hammering
      await wait(50);
    }
  }
  throw new Error('No working text endpoint');
}


export async function probeTtsOn(base, prompt) {
  // Validate and normalize the base URL to prevent SSRF
  const safeBase = await normalizeAndValidateBase(base);
  const validBase = ensureSafeBase(safeBase);
  const payloads = [{ prompt }, { text: prompt }, { input: prompt }, { messages: [{ role: 'user', content: prompt }] }];
  const t0 = Date.now();
  for (const p of TTS_ENDPOINTS) {
    for (const body of payloads) {
      try {
        // Use URL constructor to help CodeQL understand the URL is validated
        const url = new URL(p, validBase).toString();
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), timeout: 7000 });
        const json = await res.json().catch(() => null);
        if (res.ok && json) {
          const audio = json.audio || json.base64 || json.data || null;
          if (audio) return { audio, perf: { latencyMs: Date.now() - t0 }, endpoint: `${base}${p}` };
        }
      } catch (e) { }
      await wait(50);
    }
  }
  throw new Error('No working TTS endpoint');
}

export async function wellFormedURL(hostOrUrl) {
  // Normalize and validate the base URL to reduce SSRF risk.
  // Throws Error('invalid_host') on rejection.
  return normalizeAndValidateBase(hostOrUrl);
}
