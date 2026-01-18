/*
  client.js
  - Convenience client helpers to call an MCP server from other apps.
  - These functions perform a POST to the MCP and throw on non-2xx responses.
  - For usage examples, see README and index.tsx integration.
*/

/**
 * callMcpText(mcpBaseUrl, host, prompt, model, secret)
 * - Calls MCP `/text` and returns parsed JSON result.
 * - mcpBaseUrl: e.g. http://192.168.1.10:8080
 * - host: the target LLM host (ex: http://192.168.1.57:6667)
 * - model: optional model identifier to prefer (must be supported by the target)
 * - secret: optional MCP secret when MCP is configured with MCP_SECRET
 */
export async function callMcpText(mcpBaseUrl, host, prompt, model, secret) {
  if (!mcpBaseUrl) throw new Error('mcpBaseUrl required');
  const url = `${mcpBaseUrl.replace(/\/$/, '')}/text`;
  const body = { host, prompt, model };
  if (secret) body.secret = secret;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error((json && json.error) ? json.error : `HTTP ${res.status}`);
  return json;
}

/**
 * callMcpTts(mcpBaseUrl, host, prompt, secret)
 * - Calls MCP `/tts` and returns parsed JSON result.
 */
export async function callMcpTts(mcpBaseUrl, host, prompt, secret) {
  if (!mcpBaseUrl) throw new Error('mcpBaseUrl required');
  const url = `${mcpBaseUrl.replace(/\/$/, '')}/tts`;
  const body = { host, prompt };
  if (secret) body.secret = secret;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error((json && json.error) ? json.error : `HTTP ${res.status}`);
  return json;
}

/**
 * callMcpProbe(mcpBaseUrl, host, prompt, model, secret)
 * - Runs a combined text + tts probe on the target `host` via the MCP.
 */
export async function callMcpProbe(mcpBaseUrl, host, prompt, model, secret) {
  if (!mcpBaseUrl) throw new Error('mcpBaseUrl required');
  const url = `${mcpBaseUrl.replace(/\/$/, '')}/probe`;
  const body = { host, prompt, model };
  if (secret) body.secret = secret;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error((json && json.error) ? json.error : `HTTP ${res.status}`);
  return json;
} 
