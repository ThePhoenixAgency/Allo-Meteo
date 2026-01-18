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

// Candidate endpoints we probe for text generation. Keep this list ordered by most-likely/common endpoints.
const TEXT_ENDPOINTS = ['/v1/responses', '/v1/chat/completions', '/v1/completions', '/generate', '/api/generate', '/api/inference', '/api/v1/generate', '/api/completions', '/completions', '/inference'];

// Candidate endpoints we probe for Text-To-Speech (TTS)
const TTS_ENDPOINTS = ['/tts', '/api/tts', '/api/speech', '/v1/tts', '/api/v1/tts'];

/**
 * detectModelsOn(base)
 * - Probes `${base}/v1/models` for available model identifiers (LM Studio style).
 * - Returns an array of model ids if found, else an empty array.
 * - This is best-effort: many servers do not expose /v1/models; callers should handle empty lists.
 */
export async function detectModelsOn(base) {
  try {
    // normalize base then probe the models endpoint
    const res = await fetch(`${base.replace(/\/$/, '')}/v1/models`);
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
  base = base.replace(/\/$/, '');
  const payloads = [
    ...(model ? [{ model, input: prompt }, { model, messages: [{ role: 'user', content: prompt }] }] : []),
    { prompt }, { input: prompt }, { inputs: prompt }, { text: prompt }, { messages: [{ role: 'user', content: prompt }] }, { model: 'default', prompt }
  ];

  const t0 = Date.now();
  for (const p of TEXT_ENDPOINTS) {
    for (const body of payloads) {
      try {
        const url = `${base}${p}`;
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
  base = base.replace(/\/$/, '');
  const payloads = [{ prompt }, { text: prompt }, { input: prompt }, { messages: [{ role: 'user', content: prompt }] }];
  const t0 = Date.now();
  for (const p of TTS_ENDPOINTS) {
    for (const body of payloads) {
      try {
        const url = `${base}${p}`;
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), timeout: 7000 });
        const json = await res.json().catch(() => null);
        if (res.ok && json) {
          const audio = json.audio || json.base64 || json.data || null;
          if (audio) return { audio, perf: { latencyMs: Date.now() - t0 }, endpoint: `${base}${p}` };
        }
      } catch (e) {}
      await wait(50);
    }
  }
  throw new Error('No working TTS endpoint');
}

export function wellFormedURL(hostOrUrl) {
  if (!hostOrUrl) return null;
  if (/^https?:\/\//.test(hostOrUrl)) return hostOrUrl.replace(/\/$/, '');
  return `http://${hostOrUrl.replace(/\/$/, '')}`;
}
