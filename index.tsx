import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Sun, Cloud, CloudRain, CloudSun, CloudSnow,
  Mountain, Thermometer, Volume2, MapPin,
  Wind, Droplets, Loader2, Play, Square,
  Waves, Snowflake, Eye, Gauge, Droplet, Moon,
  Clock, ShieldAlert, Mail, CheckCircle2, Info,
  TrendingUp, Radio, Zap, ShieldCheck, ExternalLink,
  ArrowRight, AlertTriangle, Activity, Menu, X,
  Pause, Car, Construction, Navigation, Siren,
  Sunrise, Sunset, MoonStar, CalendarDays, Sparkles,
  Ticket, Github, User, ArrowUpRight, ArrowDownRight,
  Waves as FloodIcon, Zap as SeismicIcon, Cookie, Shield
} from 'lucide-react';

/**
 * @file Allo-Météo & Route Expert - Version 3.4.0
 * @description Bulletin email complété, Espace Aragon exclu, Inversion thermique maintenue.
 */

const LOCATION = "Le Bourg d'Oisans";
const REPO_URL = "https://github.com/ThePhoenixAgency/Allo-meteo";
const LOCATION_COORDS = { lat: 45.0053, lon: 6.0748 };
const TEXT_COOLDOWN_MS = 5000;
const TTS_COOLDOWN_MS = 5000;
const AUTO_REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes pour économiser les tokens Gemini
const USER_SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes - considère l'utilisateur inactif après ce délai
const COOKIE_EXPIRY_DAYS = 395; // 13 mois (conformité RGPD max)

// Gestion cookies RGPD
const setCookie = (name: string, value: string, days: number = COOKIE_EXPIRY_DAYS) => {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

type UserProfile = {
  userId: string;
  city?: string;
  country?: string;
  ip?: string;
  lat?: number;
  lon?: number;
  visitCount: number;
  lastVisit: string;
  preferences?: any;
};

type ManualWeather = {
  temperature: number;
  windspeed: number;
  winddirection: number;
  humidity?: number | null;
  pressure?: number | null;
  precipitation?: number | null;
  timestamp: string;
};

const spinAnimation = `
  @keyframes slow-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-slow-spin {
    animation: slow-spin 12s linear infinite;
  }
  .weather-badge-glow {
    box-shadow: 0 0 50px rgba(59, 130, 246, 0.3);
  }
`;

const getHardcodedSaint = () => {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth();
  const saints: { [key: number]: string[] } = {
    0: ["Marie", "Basile", "Geneviève", "Odilon", "Édouard", "Mélaine", "Raymond", "Lucien", "Alix", "Guillaume", "Paulin", "Tatiana", "Yvette", "Nina", "Rémi", "Marcel", "Roseline", "Prisca", "Marius", "Sébastien", "Agnès", "Vincent", "Barnard", "Fr. de Sales", "Conv. de Paul", "Paule", "Angèle", "Thomas d'A.", "Gildas", "Martine", "Marcelle"],
    1: ["Ella", "Présentation", "Blaise", "Véronique", "Agathe", "Gaston", "Eugénie", "Jacqueline", "Apolline", "Arnaud", "N.-D. Lourdes", "Félix", "Béatrice", "Valentin", "Claude", "Julienne", "Alexis", "Bernadette", "Gabin", "Aimée", "Pierre-Dam.", "Isabelle", "Lazare", "Modeste", "Roméo", "Nestor", "Honorine", "Romain", "Auguste"],
    2: ["Aubin", "Charles le B.", "Guénolé", "Casimir", "Olive", "Colette", "Félicité", "Jean de Dieu", "Françoise", "Vivien", "Rosine", "Justine", "Rodrigue", "Mathilde", "Louise", "Bénédicte", "Patrice", "Cyrille", "Joseph", "Herbert", "Clémence", "Léa", "Victorien", "Catherine", "Humbert", "Larissa", "Habib", "Gontran", "Gwladys", "Amédée", "Benjamin"],
    3: ["Hugues", "Sandrine", "Richard", "Isidore", "Irène", "Marcellin", "Jean-B. de la S.", "Julie", "Gautier", "Fulbert", "Stanislas", "Jules", "Ida", "Maxime", "Paterne", "Benoît-Joseph", "Anicet", "Parfait", "Emma", "Odette", "Anselme", "Alexandre", "Georges", "Fidèle", "Marc", "Alida", "Zita", "Valérie", "Catherine de S.", "Robert"],
    4: ["Jérémie", "Boris", "Philippe", "Sylvain", "Judith", "Prudence", "Gisèle", "Pacôme", "Solange", "Estelle", "Achille", "Rolande", "Matthias", "Denise", "Honoré", "Pascal", "Éric", "Yves", "Bernardin", "Constantin", "Émile", "Didier", "Donatien", "Sophie", "Bérenger", "Augustin", "Germain", "Aymar", "Ferdinand", "Visitation"],
    5: ["Justin", "Blandine", "Kévin", "Clotilde", "Igor", "Norbert", "Gilbert", "Médard", "Diane", "Landry", "Barnabé", "Guy", "Antoine de P.", "Élisée", "Germaine", "Jean-Fr. Régis", "Hervé", "Léonce", "Romuald", "Silvère", "Été", "Alban", "Audrey", "Jean-Baptiste", "Prosper", "Anthelme", "Fernand", "Irénée", "Pierre-Paul", "Martial"],
    6: ["Thierry", "Martinien", "Thomas", "Florent", "Antoine", "Mariette", "Raoul", "Thibault", "Amandine", "Ulrich", "Benoît", "Olivier", "Henri", "Camille", "Donald", "N.-D. Mt-Carmel", "Charlotte", "Frédéric", "Arsène", "Marina", "Victor", "Marie-Mad.", "Brigitte", "Christine", "Jacques", "Anne", "Nathalie", "Samson", "Marthe", "Juliette", "Ignace de L."],
    7: ["Alphonse", "Julien Eymard", "Lydie", "Jean-M. Vianney", "Abel", "Transfiguration", "Gaétan", "Dominique", "Amour", "Laurent", "Claire", "Clarisse", "Hippolyte", "Evrard", "Assomption", "Armel", "Hyacinthe", "Hélène", "Jean Eudes", "Bernard", "Christophe", "Fabrice", "Rose de Lima", "Barthélemy", "Louis", "Natacha", "Monique", "Augustin", "Sabine", "Fiacre", "Aristide"],
    8: ["Gilles", "Ingrid", "Grégoire", "Rosalie", "Raïssa", "Bertrand", "Reine", "Nativité", "Alain", "Inès", "Adelphe", "Apollinaire", "Aimé", "Exaltation", "Roland", "Édith", "Renaud", "Nadège", "Émilie", "Davy", "Matthieu", "Maurice", "Constant", "Thecle", "Hermann", "Côme", "Vincent de P.", "Venceslas", "Gabriel", "Jérôme"],
    9: ["Thérèse de l'E.", "Léger", "Gérard", "Fr. d'Assise", "Fleur", "Bruno", "Serge", "Pélagie", "Denis", "Ghislain", "Firmin", "Wilfried", "Géraud", "Juste", "Thérèse d'A.", "Edwige", "Baudouin", "Luc", "René", "Adeline", "Céline", "Élodie", "Jean de Capistran", "Florentin", "Crépin", "Dimitri", "Émeline", "Jude", "Narcisse", "Bienvenue", "Quentin"],
    10: ["Toussaint", "Défunts", "Hubert", "Charles", "Sylvie", "Bertille", "Carine", "Geoffroy", "Théodore", "Léon", "Armistice", "Christian", "Brice", "Sidoine", "Albert", "Marguerite", "Élisabeth", "Aude", "Tanguy", "Edmond", "Prés. Marie", "Cécile", "Clément", "Flora", "Catherine", "Delphine", "Séverin", "Jacques de la M.", "Saturnin", "André"],
    11: ["Florence", "Viviane", "François-Xavier", "Barbara", "Gérald", "Nicolas", "Ambroise", "Immaculée Conc.", "Pierre Fourier", "Romaric", "Daniel", "Jeanne-Fr. de Ch.", "Lucie", "Odile", "Ninon", "Alice", "Gaël", "Gatien", "Urbain", "Théophile", "Hiver", "Françoise-Xavière", "Armand", "Adèle", "Noël", "Étienne", "Jean", "Innocents", "David", "Roger", "Sylvestre"]
  };
  return (saints[month] && saints[month][day - 1]) || "Saint du Jour";
};

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const buildExpertPrompt = () => {
  const today = new Date().toLocaleDateString('fr-FR');
  return `INFOS OISANS EN DIRECT - ${today} :
      NE CHERCHE PAS VILLARD-BONNOT NI ESPACE ARAGON.
      1. METEO: Température actuelle au Bourg d'Oisans (°C), ressenti, humidité (%), pression (hPa), pluie (mm), neige (cm).
      DÉTERMINE SI INVERSION THERMIQUE active.
      2. ROUTE: RD1091 (Grenoble-Oisans-Briançon).
      3. STATIONS: Températures actuelles (°C) EXCLUSIVEMENT pour :
      Alpe d'Huez, Les 2 Alpes, Vaujany, Oz-en-Oisans, Saint-Christophe-en-Oisans, Villard-Reculas.
      FORMAT STRICT STATIONS: Une station par ligne, "Nom station : Valeur°C".
      4. RISQUES: Analyse PRÉDICTIVE basée sur météo actuelle. Niveau sismique (Faible/Modéré/Élevé), Crues (Vert/Jaune/Orange/Rouge).
      Si AUCUN RISQUE ACTIF: Écris "Aucune alerte en cours".
      5. EVENEMENTS: 3 évènements (1 par ligne).
      6. LUNE: Phase.
      BALISES: [METEO], [ROUTE], [STATIONS], [RISQUES], [EVENEMENTS], [LUNE], [INVERSION]. RÉPONSE TRÈS COURTE ET RAPIDE SANS BLA-BLA.`;
};

async function tryLocalEndpoint(base: string, path: string, prompt: string) {
  const url = `${base}${path}`;
  // include selected model if present
  const selectedModel = typeof localStorage !== 'undefined' ? (localStorage.getItem('allo_meteo_model') || '').trim() : '';
  const payloads = [
    // prefer model-aware payloads
    ...(selectedModel ? [{ model: selectedModel, input: prompt }, { model: selectedModel, messages: [{ role: 'user', content: prompt }] }] : []),
    { prompt },
    { input: prompt },
    { inputs: prompt },
    { text: prompt },
    { messages: [{ role: 'user', content: prompt }] },
    { model: 'default', prompt },
  ];

  for (const body of payloads) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const text = await res.text();
      let json: any = null;
      try { json = JSON.parse(text); } catch (e) { json = null; }
      if (res.ok && json) {
        try { console.info(`Probe ${base}${path} OK ${res.status} - body preview:`, JSON.stringify(json).slice(0, 500)); } catch (e) { }
        if (path === '/v1/chat/completions') {
          console.log('LM Studio response for /v1/chat/completions:', json);
        }

        const extractText = (obj: any): string | null => {
          if (!obj) return null;
          if (typeof obj === 'string') return obj;
          if (obj.text && typeof obj.text === 'string') return obj.text;
          if (obj.generated_text && typeof obj.generated_text === 'string') return obj.generated_text;
          if (Array.isArray(obj.output) && obj.output.length) {
            const parts: string[] = [];
            for (const item of obj.output) {
              if (item && Array.isArray(item.content)) {
                for (const c of item.content) {
                  if (c && c.type === 'output_text' && typeof c.text === 'string') parts.push(c.text);
                  else if (typeof c === 'string') parts.push(c);
                  else if (c && c.text && typeof c.text === 'string') parts.push(c.text);
                }
              }
              if (item && typeof item.text === 'string') parts.push(item.text);
            }
            if (parts.length) return parts.join('\n');
          }
          if (obj.choices && Array.isArray(obj.choices) && obj.choices[0]) {
            const ch = obj.choices[0];
            if (typeof ch.text === 'string') return ch.text;
            if (ch.message && ch.message.content && typeof ch.message.content === 'string') return ch.message.content;
          }
          if (Array.isArray(obj.output)) return obj.output.map((x: any) => (typeof x === 'string' ? x : JSON.stringify(x))).join('\n');
          return null;
        };

        const extracted = extractText(json) || extractText(json.candidates?.[0]) || extractText(json.choices?.[0]);
        if (extracted) {
          try { console.info(`Using extracted text from ${base}${path}:`, extracted.slice(0, 200)); } catch (e) { }
          const tokens = json?.usage?.total_tokens || json?.usage?.total || json?.token_count || Math.max(1, Math.round((extracted.split(/\s+/).length) / 0.75));
          return { text: extracted, sources: json.sources || json.metadata || [], tokens };
        } else {
          console.warn(`Failed to extract text from ${base}${path} response:`, json);
        }

      }
      if (json && json.error) {
        console.debug(`local endpoint ${base}${path} responded with error:`, json.error);
        continue;
      }
      try { console.debug(`Probe ${base}${path} returned ${res.status} but no usable fields. body preview:`, (json ? JSON.stringify(json).slice(0, 500) : 'non-json response')); } catch (e) { }
    } catch (e) {
      console.debug(`failed ${url}:`, e.message || e);
      continue;
    }
  }
const fetchExpertTextWithFallback = async (prompt: string): Promise<{ text: string; sources: any[], perf?: { latencyMs: number, model?: string, tokens?: number } }> => {
  // No AI available, return default text
  return {
    text: 'Bulletin météo expert non disponible. Consultez les données météorologiques ci-dessous.',
    sources: [],
  };
};


const fetchBulletinAudioWithFallback = async (prompt: string) => {
  if (!prompt) return { audio: null, perf: undefined };
  // No AI available for TTS
  return { audio: null, perf: undefined };
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expertData, setExpertData] = useState<any>(null);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [manualWeather, setManualWeather] = useState<ManualWeather | null>(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [lastPerf, setLastPerf] = useState<any>({});
  const [selectedModel, setSelectedModel] = useState<string>(() => (typeof localStorage !== 'undefined' ? (localStorage.getItem('allo_meteo_model') || '') : ''));
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [aiEndpoint, setAiEndpoint] = useState<string | null>(null);
  const textCooldownRef = useRef<number>(0);
  const ttsCooldownRef = useRef<number>(0);
  const [textCooldownRemaining, setTextCooldownRemaining] = useState(0);
  const [ttsCooldownRemaining, setTtsCooldownRemaining] = useState(0);

  // MCP configuration (external micro-MCP server)
  const [mcpUrl, setMcpUrl] = useState<string>(() => (typeof localStorage !== 'undefined' ? (localStorage.getItem('allo_meteo_mcp_url') || '') : ''));
  const [mcpHost, setMcpHost] = useState<string>(() => (typeof localStorage !== 'undefined' ? (localStorage.getItem('allo_meteo_mcp_host') || 'http://localhost:1234') : 'http://localhost:1234'));
  const [mcpSecret, setMcpSecret] = useState<string>(() => (typeof localStorage !== 'undefined' ? (localStorage.getItem('allo_meteo_mcp_secret') || '') : ''));
  const [mcpStatus, setMcpStatus] = useState<any>(null);

  // État RGPD
  const [showCookieBanner, setShowCookieBanner] = useState<boolean>(false);
  const [showCookieSettings, setShowCookieSettings] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Toujours true, non modifiable
    functional: false,
    analytics: false,
  });

  const fetchExpertData = async () => {
    setGlobalLoading(true);
    try {
      const now = Date.now();
      if (now - (textCooldownRef.current || 0) < TEXT_COOLDOWN_MS) {
        const remaining = TEXT_COOLDOWN_MS - (now - (textCooldownRef.current || 0));
        setLastPerf((p: any) => ({ ...p, rateLimitedUntil: Date.now() + remaining }));
        console.warn('Skipped fetchExpertData due to rate limit', remaining);
        setGlobalLoading(false);
        return;
      }
      textCooldownRef.current = now;

      const prompt = buildExpertPrompt();
      const res = await fetchExpertTextWithFallback(prompt);
      const rawText = res.text || '';
      const cleanText = rawText.replace(/[\*#_>`~]/g, '');
      console.info('Expert text fetched. excerpt:', cleanText.slice(0, 400));
      console.debug('Expert sources:', res.sources, 'perf:', res.perf);
      setExpertData({ text: cleanText, sources: res.sources });

      // Sauvegarder timestamp pour cache
      localStorage.setItem('lastAIFetch', Date.now().toString());

      if (res.perf) setLastPerf((p: any) => ({ ...p, textLatencyMs: res.perf.latencyMs, model: res.perf.model, tokens: res.perf.tokens }));
    } catch (error) {
      console.error('Expert fetch failed:', error);
      setExpertData({ text: 'Analyse météorologique temporairement indisponible. Veuillez rafraîchir la page.', sources: [] });
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    try {
      if (selectedModel && selectedModel.trim()) localStorage.setItem('allo_meteo_model', selectedModel.trim());
      else localStorage.removeItem('allo_meteo_model');
      // re-fetch to re-probe endpoints with preferred model
      fetchExpertData();
    } catch (e) { }
  }, [selectedModel]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setTextCooldownRemaining(Math.max(0, TEXT_COOLDOWN_MS - Math.max(0, now - (textCooldownRef.current || 0))));
      setTtsCooldownRemaining(Math.max(0, TTS_COOLDOWN_MS - Math.max(0, now - (ttsCooldownRef.current || 0))));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const fetchManualWeather = async () => {
    try {
      setManualLoading(true);
      const url = `https://www.prevision-meteo.ch/services/json/lat=${LOCATION_COORDS.lat}&lon=${LOCATION_COORDS.lon}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Prevision-Meteo répond ${response.status}`);
      }
      const data = await response.json();
      const current = data.current_condition;

      if (current) {
        // Convertir la direction du vent en degrés
        const windDirMap: { [key: string]: number } = {
          'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
          'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
          'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
          'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
        };
        const windDirection = windDirMap[current.wnd_dir] ?? 0;

        setManualWeather({
          temperature: parseFloat(current.tmp),
          windspeed: parseFloat(current.wnd_spd),
          winddirection: windDirection,
          humidity: parseFloat(current.humidity),
          pressure: parseFloat(current.pressure),
          precipitation: 0, // API ne fournit pas les précipitations actuelles
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Manual weather fetch failed', error);
    } finally {
      setManualLoading(false);
    }
  };

  // Marque l'activité utilisateur pour déclencher les requêtes API
  const markUserActivity = () => {
    localStorage.setItem('lastUserActivity', Date.now().toString());
    console.info('👤 Activité utilisateur détectée');
  };

  // Vérifie si un utilisateur est actif (interaction récente)
  const isUserActive = (): boolean => {
    const lastActivity = localStorage.getItem('lastUserActivity');
    if (!lastActivity) return false;
    const elapsed = Date.now() - parseInt(lastActivity);
    return elapsed < USER_SESSION_TIMEOUT_MS;
  };

  // Initialiser profil utilisateur RGPD
  const initUserProfile = async () => {
    const consent = getCookie('allo_meteo_consent');
    if (!consent) {
      setShowCookieBanner(true);
      return;
    }

    // Vérifier si les cookies fonctionnels sont acceptés
    let prefs = { essential: true, functional: false, analytics: false };
    try {
      prefs = JSON.parse(consent);
    } catch {
      // Ancien format (simple string "accepted")
      prefs = { essential: true, functional: true, analytics: true };
    }
    setCookiePreferences(prefs);

    if (!prefs.functional) {
      console.info('🚫 Cookies fonctionnels refusés - pas de profil utilisateur');
      return;
    }

    let profile: UserProfile | null = null;
    const savedProfile = localStorage.getItem('allo_meteo_user_profile');

    if (savedProfile) {
      profile = JSON.parse(savedProfile);
      profile!.visitCount = (profile!.visitCount || 0) + 1;
      profile!.lastVisit = new Date().toISOString();
    } else {
      // Géolocalisation via ipapi.co (gratuit, pas de clé API)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const geoRes = await fetch('https://ipapi.co/json/', {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);

        if (!geoRes.ok) {
          throw new Error(`HTTP ${geoRes.status}`);
        }

        const geoData = await geoRes.json();

        // Validation des données reçues
        if (typeof geoData !== 'object' || geoData === null) {
          throw new Error('Invalid response format');
        }

        profile = {
          userId: crypto.randomUUID(),
          city: geoData.city || 'Inconnu',
          country: geoData.country_name || 'Inconnu',
          ip: geoData.ip || 'Inconnu',
          lat: geoData.latitude || LOCATION_COORDS.lat,
          lon: geoData.longitude || LOCATION_COORDS.lon,
          visitCount: 1,
          lastVisit: new Date().toISOString(),
        };
      } catch (e) {
        console.warn('Géolocalisation échouée', e);
        profile = {
          userId: crypto.randomUUID(),
          visitCount: 1,
          lastVisit: new Date().toISOString(),
        };
      }
    }

    setCookie('allo_meteo_profile', JSON.stringify(profile));
    setUserProfile(profile);
  };

  const acceptAllCookies = () => {
    const prefs = { essential: true, functional: true, analytics: true };
    setCookiePreferences(prefs);
    setCookie('allo_meteo_consent', JSON.stringify(prefs));
    setShowCookieBanner(false);
    setShowCookieSettings(false);
    initUserProfile();
  };

  const rejectNonEssentialCookies = () => {
    const prefs = { essential: true, functional: false, analytics: false };
    setCookiePreferences(prefs);
    setCookie('allo_meteo_consent', JSON.stringify(prefs));
    setShowCookieBanner(false);
    setShowCookieSettings(false);
    // Ne pas initialiser le profil utilisateur si refus
  };

  const saveCustomCookies = () => {
    setCookie('allo_meteo_consent', JSON.stringify(cookiePreferences));
    setShowCookieBanner(false);
    setShowCookieSettings(false);
    if (cookiePreferences.functional) {
      initUserProfile();
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Init RGPD et profil utilisateur
    initUserProfile();

    // Marquer l'activité au chargement de la page
    markUserActivity();

    // Check cache - si données récentes, ne pas appeler l'API
    const lastFetch = localStorage.getItem('lastAIFetch');
    const cacheExpired = !lastFetch || (Date.now() - parseInt(lastFetch)) > AUTO_REFRESH_INTERVAL_MS;

    // Toujours fetch la météo basique (pas coûteux)
    fetchManualWeather();

    // Fetch IA toujours au chargement pour dev
    if (cacheExpired) {
      console.info('🚀 Chargement IA au démarrage');
      fetchExpertData();
    } else {
      console.info('📦 Utilisation cache IA');
    }

    // Auto-refresh toutes les AUTO_REFRESH_INTERVAL_MS (mais seulement si utilisateur actif)
    const refreshTimer = setInterval(() => {
      if (isUserActive()) {
        console.info('🔄 Auto-refresh IA (utilisateur actif)');
        fetchExpertData();
      } else {
        console.info('⏸️ Auto-refresh annulé (pas d\'utilisateur actif)');
      }
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      clearInterval(refreshTimer);
      stopAudio();
    };
  }, []);

  const getSection = (key: string) => {
    if (!expertData?.text) return "";
    const parts = expertData.text.split(`[${key}]`);
    if (parts.length < 2) return "";
    return parts[1].split('[')[0].trim();
  };

  const stopAudio = () => {
    activeSourcesRef.current.forEach(source => {
      try { source.stop(); source.disconnect(); } catch (e) { }
    });
    activeSourcesRef.current.clear();
    setIsPlaying(false);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => { });
      audioContextRef.current = null;
    }
  };

  const playWeatherBulletin = async () => {
    markUserActivity(); // Interaction utilisateur
    if (isPlaying) { stopAudio(); return; }
    const now = Date.now();
    if (now - (ttsCooldownRef.current || 0) < TTS_COOLDOWN_MS) {
      const remaining = TTS_COOLDOWN_MS - (now - (ttsCooldownRef.current || 0));
      setLastPerf((p: any) => ({ ...p, rateLimitedUntil: Date.now() + remaining }));
      console.warn('Skipped playWeatherBulletin due to TTS rate limit', remaining);
      return;
    }
    setLoading(true);
    try {
      const promptText = `Tu es l'assistant Allo-Météo. INTERDICTION ABSOLUE : ne dis pas "Phoenix Project" ni "réel". 
      CONSIGNE PHONÉTIQUE : Prononce TRÈS DISTINCTEMENT les terminaisons. 
      Dis clairement : LES DEUZZZZ ALPEs, BOUR D'OISAN, OZZZZ EN OISAN, ALPE D'HUEZZZZ.
      Données : ${expertData?.text}`;
      const { audio: base64Audio, perf } = await fetchBulletinAudioWithFallback(promptText);
      if (!base64Audio) { setLoading(false); return; }

      ttsCooldownRef.current = Date.now();
      if (perf) setLastPerf((p: any) => ({ ...p, audioLatencyMs: perf.latencyMs, model: perf.model }));
      try { console.info('Fetched audio length:', base64Audio.length); } catch (e) { }

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => { setIsPlaying(false); activeSourcesRef.current.delete(source); };
      activeSourcesRef.current.add(source);
      setIsPlaying(true);
      source.start(0);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const meteoText = getSection('METEO');
  const stationsText = getSection('STATIONS');
  const risquesText = getSection('RISQUES');
  const inversion = getSection('INVERSION');

  // Gestion des états IA
  const hasAnyAIData = expertData?.text?.trim().length > 0;
  const hasRisquesData = risquesText.trim().length > 0;

  // États: Chargement initial, IA a répondu, IA indisponible
  const isLoading = !hasAnyAIData && globalLoading;
  const risqueSismique = hasRisquesData
    ? (risquesText.match(/sismique\s?[:\-]?\s?([^,.\n]+)/i)?.[1] || "Aucune alerte en cours")
    : (isLoading ? "Chargement..." : (hasAnyAIData ? "Aucune alerte en cours" : "IA indisponible"));
  const risqueCrues = hasRisquesData
    ? (risquesText.match(/crues\s?[:\-]?\s?([^,.\n]+)/i)?.[1] || "Aucune alerte en cours")
    : (isLoading ? "Chargement..." : (hasAnyAIData ? "Aucune alerte en cours" : "IA indisponible"));

  const manualTemperature = manualWeather?.temperature !== undefined ? manualWeather.temperature.toFixed(1) : null;
  const manualHumidityValue = manualWeather?.humidity ?? null;
  const manualRainValue = manualWeather?.precipitation ?? null;
  const manualPressureValue = manualWeather?.pressure ?? null;

  // Prioriser Prevision-Meteo sur les valeurs par défaut
  const currentTemp = manualTemperature || meteoText.match(/(\-?\d+)\s?°/)?.[1] || "...";
  const humidity = (manualHumidityValue !== null ? Math.round(manualHumidityValue).toString() : meteoText.match(/(\d+)\s?%/)?.[1] || "...") + "%";
  const rain = (manualRainValue !== null ? manualRainValue.toFixed(1) : meteoText.match(/(\d+[,.]?\d*)\s?mm/)?.[1] || "...") + " mm";
  const pressure = (manualPressureValue !== null ? manualPressureValue.toFixed(0) : meteoText.match(/(\d+)\s?hPa/)?.[1] || "...") + " hPa";

  const hasInversionText = inversion.toLowerCase().includes("oui") || inversion.toLowerCase().includes("active") || inversion.toLowerCase().includes("présente") || inversion.toLowerCase().includes("yes");
  const hasInversion = hasInversionText || (manualWeather && manualWeather.temperature <= 2);

  // Calculer phase de lune actuelle
  const getMoonPhase = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // Algorithme simplifié pour calculer la phase de lune
    let c = 0, e = 0, jd = 0, b = 0;
    if (month < 3) {
      const yearAdjusted = year - 1;
      const monthAdjusted = month + 12;
      c = Math.floor(yearAdjusted / 100);
      e = c / 4;
      jd = 365.25 * (yearAdjusted + 4716);
      b = Math.floor(30.6001 * (monthAdjusted + 1));
    } else {
      c = Math.floor(year / 100);
      e = Math.floor(c / 4);
      jd = Math.floor(365.25 * (year + 4716));
      b = Math.floor(30.6001 * (month + 1));
    }

    const fullJD = jd + b + day - 1524.5;
    const daysSinceNew = (fullJD - 2451550.1) % 29.53059;
    const phase = daysSinceNew / 29.53059;

    if (phase < 0.0625) return "🌑 Nouvelle Lune";
    if (phase < 0.1875) return "🌒 Premier Croissant";
    if (phase < 0.3125) return "🌓 Premier Quartier";
    if (phase < 0.4375) return "🌔 Gibbeuse Croissante";
    if (phase < 0.5625) return "🌕 Pleine Lune";
    if (phase < 0.6875) return "🌖 Gibbeuse Décroissante";
    if (phase < 0.8125) return "🌗 Dernier Quartier";
    if (phase < 0.9375) return "🌘 Dernier Croissant";
    return "🌑 Nouvelle Lune";
  };

  const manualSummaryLine = manualWeather
    ? `Prevision-Meteo.ch ${new Date(manualWeather.timestamp).toLocaleTimeString('fr-FR')} • ${manualWeather.temperature.toFixed(1)}°C • Vent ${manualWeather.windspeed.toFixed(0)} km/h`
    : '';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-16">
      <style>{spinAnimation}</style>

      {/* Bandeau RGPD Conforme */}
      {showCookieBanner && !showCookieSettings && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/98 backdrop-blur-xl text-white p-6 z-[9999] border-t-4 border-blue-500 shadow-2xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-500 p-3 rounded-xl flex-shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-xl mb-3 uppercase tracking-tight">🍪 Gestion des Cookies</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  Nous utilisons des cookies pour améliorer votre expérience. Les <strong>cookies essentiels</strong> sont
                  nécessaires au fonctionnement du site. Vous pouvez accepter ou refuser les cookies <strong>fonctionnels</strong>
                  et <strong>analytiques</strong>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-green-500/20 border border-green-500/50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <strong className="text-green-400">ESSENTIELS</strong>
                      <span className="text-[10px] text-slate-400">(obligatoire)</span>
                    </div>
                    <p className="text-slate-300">Sécurité, session, préférences de base</p>
                  </div>
                  <div className="bg-blue-500/20 border border-blue-500/50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-blue-400" />
                      <strong className="text-blue-400">FONCTIONNELS</strong>
                    </div>
                    <p className="text-slate-300">Géolocalisation, token utilisateur, historique visites</p>
                  </div>
                  <div className="bg-purple-500/20 border border-purple-500/50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      <strong className="text-purple-400">ANALYTIQUES</strong>
                    </div>
                    <p className="text-slate-300">Statistiques d'usage (désactivé actuellement)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={rejectNonEssentialCookies}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold uppercase text-sm transition-all border border-slate-600"
              >
                Refuser Tout
              </button>
              <button
                onClick={() => setShowCookieSettings(true)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold uppercase text-sm transition-all border border-blue-500"
              >
                Personnaliser
              </button>
              <button
                onClick={acceptAllCookies}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-black uppercase text-sm transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
              >
                <Cookie className="w-5 h-5" />
                Tout Accepter
              </button>
            </div>

            <p className="text-[10px] text-slate-500 mt-4 text-center">
              Conservation max: <strong>13 mois</strong> (conformité RGPD) •
              Données stockées localement •
              <a href="#privacy" className="underline hover:text-white ml-1">Politique de confidentialité</a>
            </p>
          </div>
        </div>
      )}

      {/* Panneau de personnalisation */}
      {showCookieSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 border-4 border-blue-500 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black uppercase text-white flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-500" />
                Paramètres des Cookies
              </h2>
              <button onClick={() => setShowCookieSettings(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Cookies essentiels */}
              <div className="bg-slate-800/50 p-5 rounded-2xl border-2 border-green-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <div>
                      <h3 className="font-black text-white uppercase">Cookies Essentiels</h3>
                      <p className="text-xs text-slate-400">Toujours actifs</p>
                    </div>
                  </div>
                  <div className="bg-green-500 px-4 py-2 rounded-full text-xs font-black">ACTIF</div>
                </div>
                <p className="text-sm text-slate-300 mb-3">
                  Nécessaires au fonctionnement du site. Gèrent la sécurité, la navigation et les préférences de base.
                </p>
                <div className="text-xs text-slate-400">
                  <strong>Cookies:</strong> allo_meteo_consent (13 mois)
                </div>
              </div>

              {/* Cookies fonctionnels */}
              <div className="bg-slate-800/50 p-5 rounded-2xl border-2 border-blue-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-400" />
                    <div>
                      <h3 className="font-black text-white uppercase">Cookies Fonctionnels</h3>
                      <p className="text-xs text-slate-400">Améliore l'expérience</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cookiePreferences.functional}
                      onChange={(e) => setCookiePreferences({ ...cookiePreferences, functional: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-slate-300 mb-3">
                  Mémorisent votre localisation, ville, pays, historique de visites et préférences personnalisées.
                </p>
                <div className="text-xs text-slate-400">
                  <strong>Cookies:</strong> allo_meteo_user_token (13 mois)<br />
                  <strong>LocalStorage:</strong> allo_meteo_user_profile, lastUserActivity
                </div>
              </div>

              {/* Cookies analytiques */}
              <div className="bg-slate-800/50 p-5 rounded-2xl border-2 border-purple-500/30 opacity-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-purple-400" />
                    <div>
                      <h3 className="font-black text-white uppercase">Cookies Analytiques</h3>
                      <p className="text-xs text-slate-400">Non implémenté</p>
                    </div>
                  </div>
                  <div className="bg-slate-700 px-4 py-2 rounded-full text-xs font-black">DÉSACTIVÉ</div>
                </div>
                <p className="text-sm text-slate-300">
                  Collectent des statistiques anonymes sur l'utilisation du site (non utilisé actuellement).
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCookieSettings(false)}
                className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold uppercase text-sm transition-all"
              >
                Annuler
              </button>
              <button
                onClick={saveCustomCookies}
                className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-black uppercase text-sm transition-all shadow-xl"
              >
                Enregistrer mes Choix
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-xl"><Sun className="text-white w-8 h-8 animate-slow-spin" /></div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter text-blue-900 leading-none uppercase italic">Allo-Météo</h1>
              <span className="text-xs font-bold text-blue-500 tracking-[0.3em] uppercase">Oisans 2026</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="bg-white/90 px-3 py-2 rounded-lg font-bold text-sm border">
              <option value="">Auto (détecte local)</option>
              {availableModels.length ? availableModels.map(m => <option key={m} value={m}>{m}</option>) : <option disabled>Aucun modèle local détecté</option>}
              <option value="custom">Custom (mettre via localStorage)</option>
            </select>
            <button onClick={playWeatherBulletin} className={`flex items-center gap-4 px-8 py-4 rounded-[2rem] font-black transition-all shadow-2xl active:scale-95 ${isPlaying ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-600 text-white'}`}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isPlaying ? <Square className="w-6 h-6 fill-current" /> : <Volume2 className="w-6 h-6" />)}
              <span className="text-lg uppercase">{isPlaying ? "STOP" : "BULLETIN"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border-b-[10px] border-blue-500">
            <div className="relative z-10">
              <div className="flex items-center gap-4 text-blue-100 font-black text-2xl uppercase mb-8">
                <CalendarDays className="w-8 h-8" />
                {new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(currentTime)}
                <span className="text-white/30 font-light mx-2">|</span>
                <span className="text-white">{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex flex-wrap items-center gap-10">
                <div className="bg-white/10 backdrop-blur-3xl p-8 rounded-full border border-white/20 flex flex-col items-center justify-center min-w-[260px] min-h-[260px] weather-badge-glow">
                  {globalLoading ? <Loader2 className="w-20 h-20 animate-spin text-white/50" /> : <Sun className="w-32 h-32 text-yellow-400 animate-slow-spin" />}
                  <div className="absolute bottom-4 bg-blue-600 px-7 py-2 rounded-full font-black text-4xl shadow-2xl border-2 border-white/50">{currentTemp}°C</div>
                </div>
                <div className="flex flex-col gap-4 flex-1 min-w-[300px]">
                  <div className="p-8 bg-white/10 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">Conditions {LOCATION}</p>
                    <p className="text-3xl font-black uppercase italic tracking-tighter leading-tight">{meteoText.match(/ciel\s?:\s?([^,.]+)/i)?.[1] || "Chargement..."}</p>
                  </div>
                  {hasInversion && (
                    <div className="p-6 bg-orange-500/20 rounded-[2rem] border-2 border-orange-400/50 flex items-center gap-4 animate-pulse">
                      <TrendingUp className="w-7 h-7 text-orange-400" />
                      <div>
                        <p className="text-[9px] font-black text-orange-200 uppercase">Alerte</p>
                        <p className="text-lg font-black uppercase leading-none text-orange-50">Inversion Thermique</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                {[
                  { icon: CloudRain, label: 'PRÉCIP.', val: rain },
                  { icon: CloudSnow, label: 'NEIGE', val: (meteoText.match(/(\d+)\s?cm/i)?.[1] || "0.0") + ' cm' },
                  { icon: Droplets, label: 'HUMIDITÉ', val: humidity },
                  { icon: Gauge, label: 'PRESSION', val: pressure }
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 p-6 rounded-[2rem] border border-white/20">
                    <item.icon className="w-8 h-8 mb-4 text-blue-300" />
                    <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                    <p className="text-2xl font-black">{item.val}</p>
                  </div>
                ))}
              </div>
              {!expertData?.text && manualSummaryLine && (
                <div className="mt-8 px-6 py-4 bg-white/20 rounded-[2rem] border border-white/30 text-[11px] font-black uppercase tracking-[0.3em] text-white/80">
                  {manualSummaryLine}
                  {manualLoading && ' • Chargement Open-Meteo...'}
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-5 uppercase text-blue-900"><Mountain className="w-10 h-10 text-blue-600" />TEMPÉRATURES DES STATIONS</h3>
            <div className="overflow-x-auto rounded-3xl border border-slate-100 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Station</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Température</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {globalLoading ? (
                    <tr><td colSpan={2} className="px-6 py-12 text-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" /></td></tr>
                  ) : (
                    stationsText.split('\n').filter(s => s.includes(':') || s.includes('-')).map((line, idx) => {
                      const sepIndex = line.lastIndexOf(':') !== -1 ? line.lastIndexOf(':') : line.lastIndexOf('-');
                      if (sepIndex === -1) return null;
                      const name = line.substring(0, sepIndex).trim();
                      const val = line.substring(sepIndex + 1).trim();
                      if (!name || name.length < 2) return null;
                      return (
                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-5 font-bold text-slate-700 uppercase tracking-tight">{name}</td>
                          <td className="px-6 py-5 font-black text-blue-600 text-right text-xl">{val}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200">
              <h3 className="text-xl font-black mb-6 flex items-center gap-4 uppercase text-red-600"><SeismicIcon className="w-8 h-8" /> RISQUE SISMIQUE</h3>
              <div className="p-6 bg-red-50 rounded-[2rem] border-2 border-red-100">
                <p className="text-lg font-bold text-red-900 italic">{risqueSismique}</p>
              </div>
            </div>
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200">
              <h3 className="text-xl font-black mb-6 flex items-center gap-4 uppercase text-blue-600"><FloodIcon className="w-8 h-8" /> RISQUE DE CRUES</h3>
              <div className="p-6 bg-blue-50 rounded-[2rem] border-2 border-blue-100">
                <p className="text-lg font-bold text-blue-900 italic">{risqueCrues}</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-5 uppercase text-indigo-900"><Ticket className="w-10 h-10 text-indigo-600" />ÉVÉNEMENTS OISANS</h3>
            <div className="space-y-4">
              {getSection('EVENEMENTS').split('\n').filter(e => e.trim()).map((event, idx) => (
                <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 font-bold text-xl text-slate-700 flex items-center gap-5"><div className="w-3 h-3 bg-indigo-500 rounded-full"></div>{event.trim()}</div>
              ))}
            </div>
          </section>
          <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200">
            <div className="flex items-center gap-5 mb-8"><div className="bg-orange-500 p-4 rounded-[1.5rem] shadow-lg"><Siren className="w-10 h-10 text-white animate-pulse" /></div><h3 className="text-2xl font-black text-slate-900 uppercase">INFOS ROUTE RD1091</h3></div>
            <div className="p-10 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100"><p className="text-xl font-bold text-slate-700 leading-relaxed italic">{getSection('ROUTE') || "Actualisation..."}</p></div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-10">
          <section className="bg-indigo-950 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden text-center">
            <h3 className="text-xl font-black mb-6 uppercase text-indigo-300 flex items-center justify-center gap-4"><MoonStar className="w-7 h-7" /> LUNE</h3>
            <div className="bg-indigo-900/40 p-5 rounded-full border-2 border-indigo-800 shadow-xl inline-block mb-4"><Moon className="w-12 h-12 text-indigo-100" /></div>
            <p className="text-2xl font-black uppercase text-white">{getSection('LUNE') || getMoonPhase()}</p>
          </section>
          <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200">
            <h3 className="text-xl font-black mb-8 uppercase text-blue-900 flex items-center gap-5"><Mail className="w-7 h-7 text-blue-600" /> BULLETIN DE 07H00</h3>
            <div className="space-y-4">
              <input type="text" placeholder="PRÉNOM" className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 text-sm font-black uppercase outline-none focus:border-blue-500" />
              <input type="email" placeholder="VOTRE EMAIL" className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 text-sm font-black uppercase outline-none focus:border-blue-500" />
              <button onClick={() => setNewsletterSubscribed(true)} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase shadow-xl hover:bg-blue-700 transition-all">{newsletterSubscribed ? "INSCRIT !" : "S'INSCRIRE"}</button>
            </div>
          </section>
          <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200">
            <h3 className="text-xl font-black mb-8 uppercase text-orange-600 flex items-center gap-4"><Sparkles className="w-7 h-7" /> ÉPHÉMÉRIDE</h3>
            <div className="p-6 bg-orange-50 rounded-[2rem] border-2 border-orange-100 text-center">
              <p className="text-[10px] font-black uppercase text-orange-400 mb-1 tracking-widest">Saint du Jour</p>
              <p className="text-2xl font-black uppercase text-orange-900">{getHardcodedSaint()}</p>
            </div>
          </section>
          <section className="bg-white rounded-[3rem] p-6 shadow-sm border border-slate-200">
            <h3 className="text-xl font-black mb-4 uppercase text-slate-900">ÉTAT IA</h3>
            <div className="text-sm text-slate-700 space-y-2">
              <div><strong>Endpoint:</strong> {aiEndpoint || (localStorage.getItem('allo_meteo_local_text_endpoint') || 'Aucun')}</div>
              <div><strong>Modèle:</strong> {selectedModel || 'Auto'}</div>
              <div><strong>Latences:</strong> texte {lastPerf?.textLatencyMs ?? '-'} ms · audio {lastPerf?.audioLatencyMs ?? '-'} ms</div>
              <div><strong>Tokens:</strong> {lastPerf?.tokens ?? '-'}</div>
              <div><strong>Rate:</strong> {textCooldownRemaining ? `texte cooldown ${Math.ceil(textCooldownRemaining / 1000)}s` : 'ok'} · {ttsCooldownRemaining ? `tts cooldown ${Math.ceil(ttsCooldownRemaining / 1000)}s` : 'ok'}</div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { setAvailableModels([]); setSelectedModel(''); localStorage.removeItem('allo_meteo_model'); }} className="px-3 py-2 bg-white border rounded">Reset modèle</button>
              </div>
            </div>
          </section>
          <div onClick={() => window.open(REPO_URL, '_blank')} className="bg-slate-900 p-10 rounded-[3rem] text-white flex justify-between items-center group cursor-pointer active:scale-95 transition-all shadow-2xl border-b-[8px] border-slate-800">
            <div className="flex items-center gap-5"><Github className="w-10 h-10 text-white" /><div><p className="text-[9px] font-black uppercase text-blue-400 mb-1 tracking-widest">PROJET ALLO-MÉTÉO</p><p className="text-2xl font-black uppercase italic leading-none">Oisans 2026</p></div></div>
            <ExternalLink className="w-6 h-6 text-white/30 group-hover:text-white" />
          </div>
        </aside>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(React.createElement(App));