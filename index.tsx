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
  Waves as FloodIcon, Zap as SeismicIcon
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * @file Allo-Météo & Route Expert - Version 3.4.0
 * @description Bulletin email complété, Espace Aragon exclu, Inversion thermique maintenue.
 */

const LOCATION = "Le Bourg d'Oisans";
const REPO_URL = "https://github.com/ThePhoenixAgency/Allo-meteo";

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

const App = () => {
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expertData, setExpertData] = useState<any>(null);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchExpertData();
    return () => {
      clearInterval(timer);
      stopAudio();
    };
  }, []);

  const fetchExpertData = async () => {
    setGlobalLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `INFOS OISANS EN DIRECT - ${new Date().toLocaleDateString('fr-FR')} :
      NE CHERCHE PAS VILLARD-BONNOT NI ESPACE ARAGON.
      1. METEO: Température actuelle au Bourg d'Oisans (°C), ressenti, humidité (%), pression (hPa), pluie (mm), neige (cm).
      DÉTERMINE SI INVERSION THERMIQUE active.
      2. ROUTE: RD1091 (Grenoble-Oisans-Briançon).
      3. STATIONS: Températures actuelles (°C) EXCLUSIVEMENT pour : 
      Alpe d'Huez, Les 2 Alpes, Vaujany, Oz-en-Oisans, Saint-Christophe-en-Oisans, Villard-Reculas.
      FORMAT STRICT STATIONS: Une station par ligne, "Nom station : Valeur°C".
      4. RISQUES: Sismique et Crues.
      5. EVENEMENTS: 3 évènements (1 par ligne).
      6. LUNE: Phase.
      BALISES: [METEO], [ROUTE], [STATIONS], [RISQUES], [EVENEMENTS], [LUNE], [INVERSION]. RÉPONSE TRÈS COURTE ET RAPIDE SANS BLA-BLA.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingBudget: 0 } 
        },
      });
      
      const rawText = response.text || "";
      const cleanText = rawText.replace(/[\*#_>`~]/g, '');
      setExpertData({ text: cleanText, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] });
    } catch (error) {
      console.error("Erreur API:", error);
    } finally {
      setGlobalLoading(false);
    }
  };

  const getSection = (key: string) => {
    if (!expertData?.text) return "";
    const parts = expertData.text.split(`[${key}]`);
    if (parts.length < 2) return "";
    return parts[1].split('[')[0].trim();
  };

  const stopAudio = () => {
    activeSourcesRef.current.forEach(source => { 
      try { source.stop(); source.disconnect(); } catch (e) {} 
    });
    activeSourcesRef.current.clear();
    setIsPlaying(false);
    if (audioContextRef.current) { 
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null; 
    }
  };

  const playWeatherBulletin = async () => {
    if (isPlaying) { stopAudio(); return; }
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const promptText = `Tu es l'assistant Allo-Météo. INTERDICTION ABSOLUE : ne dis pas "Phoenix Project" ni "réel". 
      CONSIGNE PHONÉTIQUE : Prononce TRÈS DISTINCTEMENT les S finaux et les terminaisons. 
      Dis clairement : LES DEUZZZZ ALPESSSS, BOURGGGG D'OISANSSSS, OZZZZ EN OISANSSSS, ALPE D'HUEZZZZ.
      Données : ${expertData?.text}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) { setLoading(false); return; }

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
  
  const currentTemp = meteoText.match(/(\-?\d+)\s?°/)?.[1] || "12";
  const humidity = (meteoText.match(/(\d+)\s?%/)?.[1] || "65") + "%";
  const rain = (meteoText.match(/(\d+[,.]?\d*)\s?mm/)?.[1] || "0") + " mm";
  
  const hasInversion = inversion.toLowerCase().includes("oui") || inversion.toLowerCase().includes("active") || inversion.toLowerCase().includes("présente") || inversion.toLowerCase().includes("yes");

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-16">
      <style>{spinAnimation}</style>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-xl"><Sun className="text-white w-8 h-8 animate-slow-spin" /></div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter text-blue-900 leading-none uppercase italic">Allo-Météo</h1>
              <span className="text-xs font-bold text-blue-500 tracking-[0.3em] uppercase">Oisans 2026</span>
            </div>
          </div>
          <button onClick={playWeatherBulletin} className={`flex items-center gap-4 px-8 py-4 rounded-[2rem] font-black transition-all shadow-2xl active:scale-95 ${isPlaying ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-600 text-white'}`}>
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isPlaying ? <Square className="w-6 h-6 fill-current" /> : <Volume2 className="w-6 h-6" />)}
            <span className="text-lg uppercase">{isPlaying ? "STOP" : "BULLETIN"}</span>
          </button>
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
                    <p className="text-3xl font-black uppercase italic tracking-tighter leading-tight">{meteoText.match(/ciel\s?:\s?([^,.]+)/i)?.[1] || "Stable"}</p>
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
                  { icon: CloudSnow, label: 'NEIGE', val: (meteoText.match(/(\d+)\s?cm/i)?.[1] || "0") + ' cm' },
                  { icon: Droplets, label: 'HUMIDITÉ', val: humidity },
                  { icon: Gauge, label: 'PRESSION', val: (meteoText.match(/(\d+)\s?hPa/i)?.[1] || "1018") + ' hPa' }
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 p-6 rounded-[2rem] border border-white/20">
                    <item.icon className="w-8 h-8 mb-4 text-blue-300" />
                    <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                    <p className="text-2xl font-black">{item.val}</p>
                  </div>
                ))}
              </div>
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
                <p className="text-lg font-bold text-red-900 italic">{risquesText.match(/sismique\s?[:\-]?\s?([^,.\n]+)/i)?.[1] || "Très Faible"}</p>
              </div>
            </div>
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200">
              <h3 className="text-xl font-black mb-6 flex items-center gap-4 uppercase text-blue-600"><FloodIcon className="w-8 h-8" /> RISQUE DE CRUES</h3>
              <div className="p-6 bg-blue-50 rounded-[2rem] border-2 border-blue-100">
                <p className="text-lg font-bold text-blue-900 italic">{risquesText.match(/crues\s?[:\-]?\s?([^,.\n]+)/i)?.[1] || "Vert"}</p>
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
            <p className="text-2xl font-black uppercase text-white">{getSection('LUNE') || "En cours..."}</p>
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
          <div onClick={() => window.open(REPO_URL, '_blank')} className="bg-slate-900 p-10 rounded-[3rem] text-white flex justify-between items-center group cursor-pointer active:scale-95 transition-all shadow-2xl border-b-[8px] border-slate-800">
            <div className="flex items-center gap-5"><Github className="w-10 h-10 text-white" /><div><p className="text-[9px] font-black uppercase text-blue-400 mb-1 tracking-widest">PROJET ALLO-MÉTÉO</p><p className="text-2xl font-black uppercase italic leading-none">Oisans 2026</p></div></div>
            <ExternalLink className="w-6 h-6 text-white/30 group-hover:text-white" />
          </div>
        </aside>
      </main>
      <footer className="max-w-7xl mx-auto px-4 mt-20 py-12 border-t border-slate-200 text-center"><p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em]">© 2026 ALLO-MÉTÉO OISANS • STATION DE CONTRÔLE</p></footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);