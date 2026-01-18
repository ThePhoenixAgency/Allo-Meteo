#!/usr/bin/env node

const BASE_URLS = ['http://192.168.1.57:6667'];
const prompt = `Tu es un assistant de diagnostic. Réponds juste par le nom ou le type du LLM qui traite ce prompt, puis explique brièvement comment il est configuré.`;

const ENDPOINTS = ['/generate','/api/generate','/api/inference','/api/v1/generate','/v1/generate','/v1/completions','/api/completions','/completions','/inference'];
const PAYLOADS = [{ prompt }, { input: prompt }, { inputs: prompt }, { text: prompt }, { messages: [{ role: 'user', content: prompt }] }, { model: 'default', prompt }];

async function probe() {
  for (const base of BASE_URLS) {
    for (const ep of ENDPOINTS) {
      const url = `${base}${ep}`;
      for (const body of PAYLOADS) {
        try {
          const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
          const text = await res.text();
          let json = null;
          try { json = JSON.parse(text); } catch (e) { json = null; }
          if (res.ok && json) {
            const out = json.text || json.output || json.result || json.generated_text || (json.choices && json.choices[0] && (json.choices[0].text || json.choices[0].message?.content));
            if (out) {
              console.log(`✅ Endpoint fonctionnel détecté: ${base}${ep}`);
              console.log('Extrait :');
              console.log((out && typeof out === 'string' ? out : JSON.stringify(out)).split('\n').slice(0,5).join('\n'));
              return;
            }
          }
          if (json && json.error) {
            console.log(`endpoint ${base}${ep} a renvoyé une erreur: ${JSON.stringify(json.error)}`);
          }
        } catch (e) {
          // ignore and continue
        }
      }
    }
  }
  console.error('Aucun endpoint compatible trouvé sur les ports testés.');
  process.exitCode = 1;
}

probe();
