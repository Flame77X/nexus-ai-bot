import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

// ==========================================
// FALLBACK DATABASE (OFFLINE SAFETY NET)
// ==========================================
const FALLBACK_DB = {
  fun: [
    { tags: ["joke", "laugh", "funny"], response: ["Why do Java developers wear glasses? Because they don't C#!", "I told a Chemistry joke, but there was no reaction.", "Parallel lines have so much in common. It’s a shame they’ll never meet."] },
    { tags: ["roast", "insult"], response: ["I’d explain it to you, but I don’t have any crayons.", "You're like a cloud. When you disappear, it's a beautiful day."] }
  ],
  study: [
    { tags: ["tip", "study", "help"], response: ["Try Pomodoro: 25 min focus → 5 min break.", "Use Active Recall: Close the book and explain out loud.", "Sleep > All-nighters. Your brain needs it to consolidate memory!"] }
  ]
};

// ==========================================
// ICONS (Memoized)
// ==========================================
const Icons = {
  Cpu: memo(({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 9h6v6H9z" /><path d="M9 1v3" /><path d="M15 1v3" /><path d="M9 20v3" /><path d="M15 20v3" /><path d="M20 9h3" /><path d="M20 14h3" /><path d="M1 9h3" /><path d="M1 14h3" /></svg>),
  Bot: memo(({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" /><rect width="18" height="12" x="3" y="8" rx="2" /><path d="M12 12v6" /><path d="M8 18h8" /></svg>),
  Smile: memo(({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg>),
  BookOpen: memo(({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>),
  Send: memo(({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>),
  Refresh: memo(({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>),
  Rocket: memo(({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>),
  User: memo(({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>),
  Menu: memo(({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>),
  X: memo(({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>),
  Mic: memo(({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>),
  Volume2: memo(({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>),
  Info: memo(({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>)
};

// ==========================================
// PERSONA CONFIGURATION
// ==========================================
const AI_PERSONAS = [
  { id: 'scibot', name: 'Professor Pulsar', role: 'Knowledge Expert', gradient: 'from-cyan-500 to-blue-600', textHighlight: 'text-cyan-400', bgHighlight: 'bg-cyan-500', icon: Icons.Bot, welcome: "Connected to Knowledge Grid. Ask me anything!", systemPrompt: "You are Professor Pulsar, a brilliant science teacher for Grade 8-12. Explain simply, accurately, with analogies. Max 3 sentences." },
  { id: 'jokebot', name: 'GiggleBit', role: 'Comedy Core', gradient: 'from-fuchsia-500 to-purple-600', textHighlight: 'text-fuchsia-400', bgHighlight: 'bg-fuchsia-500', icon: Icons.Smile, welcome: "GiggleBit Online! Ready to roast or joke?", systemPrompt: "You are GiggleBit, a sarcastic funny AI. Tell science puns and gentle roasts. Keep it short and witty." },
  { id: 'helper', name: 'Study Buddy', role: 'Exam Strategist', gradient: 'from-emerald-400 to-green-600', textHighlight: 'text-emerald-400', bgHighlight: 'bg-emerald-500', icon: Icons.BookOpen, welcome: "Hey! I'm here to help you study smarter.", systemPrompt: "You are Study Buddy. Give practical study tips, motivation, and focus hacks. Be kind and encouraging." }
];

// ==========================================
// ML-POWERED EDUCATIONAL IMAGE DATABASE (THE MAGIC)
// ==========================================
const EDUCATIONAL_PROMPT_DATABASE = {
  // Biology
  "human ear": "cross section of human ear showing pinna, auditory canal, tympanic membrane, ossicles malleus incus stapes, cochlea, semicircular canals, auditory nerve, eustachian tube, labeled clearly",
  "human heart": "sagittal section of human heart showing right atrium, left atrium, right ventricle, left ventricle, tricuspid valve, mitral valve, aortic valve, pulmonary valve, septum, aorta, pulmonary artery, labeled with blood flow arrows",
  "nephron": "detailed kidney nephron diagram showing glomerulus, Bowman's capsule, proximal convoluted tubule, loop of Henle, distal convoluted tubule, collecting duct, afferent and efferent arterioles, vasa recta, labeled",
  "plant cell": "labeled plant cell showing cell wall, chloroplast with grana, central vacuole, nucleus, mitochondria, endoplasmic reticulum, golgi apparatus, ribosomes",
  "animal cell": "labeled animal cell showing nucleus, mitochondria, endoplasmic reticulum, golgi, lysosomes, centrioles, no cell wall, no chloroplast",
  "dna": "DNA double helix structure showing sugar phosphate backbone, nitrogenous bases adenine thymine guanine cytosine, hydrogen bonds, major and minor groove, labeled",
  "mitosis": "stages of mitosis prophase metaphase anaphase telophase cytokinesis in animal cell, chromosomes, spindle fibers, centrioles, labeled",
  "brain": "human brain sagittal section showing cerebrum, cerebellum, brainstem, medulla, pons, midbrain, thalamus, hypothalamus, corpus callosum, labeled",

  // Physics - Optics
  "concave mirror": "ray diagram concave mirror object beyond C, at C, between C and F, at F, between F and pole, showing real inverted image and virtual erect image, focus F, center C, principal axis labeled",
  "convex mirror": "ray diagram convex mirror showing virtual erect diminished image for any object position, focus F behind mirror, principal axis",
  "concave lens": "ray diagram concave diverging lens showing virtual erect diminished image, rays appear to diverge from focal point F, optical center, principal axis",
  "convex lens": "ray diagram convex converging lens object beyond 2F, at 2F, between 2F and F, at F, showing real inverted magnified and diminished images, labeled 2F, F, optical center",
  "prism": "dispersion of white light through triangular prism showing deviation, spectrum violet indigo blue green yellow orange red, angle of incidence and emergence",
  "glass slab": "refraction through rectangular glass slab showing lateral displacement, incident and emergent ray parallel",

  // Physics - Others
  "electric circuit": "series and parallel circuit diagram with battery, switch, bulb, resistor, ammeter, voltmeter using standard symbols, labeled",
  "transformer": "step up and step down transformer diagram showing primary coil, secondary coil, iron core, input output voltage",
  "electromagnetic spectrum": "electromagnetic spectrum diagram from radio waves to gamma rays with wavelength and frequency, visible light region highlighted",

  // Chemistry
  "atom": "Bohr model of atom showing nucleus with protons neutrons, electron shells K L M N, energy levels",
  "periodic table": "modern periodic table with periods and groups, s p d f blocks color coded, atomic number, element symbol",
};

const smartImageGenerator = (userText) => {
  const lower = userText.toLowerCase().trim();

  // 1. Check Database (Exact Match)
  for (const [key, prompt] of Object.entries(EDUCATIONAL_PROMPT_DATABASE)) {
    if (lower.includes(key) || lower.includes(key.replace(/ /g, ''))) {
      return prompt;
    }
  }

  // 2. Category Detection & Template Application
  const isBiology = /cell|organ|tissue|body|anatomy|muscle|bone|skeleton|plant|animal|life|bio/i.test(lower);
  const isPhysics = /force|energy|light|ray|lens|mirror|circuit|magnet|wave|motion|speed|gravity|physic/i.test(lower);
  const isChemistry = /atom|molecule|reaction|bond|element|compound|acid|base|chemical/i.test(lower);

  if (isBiology) {
    return `${userText}, accurate biological structure diagram, cross-section if applicable, clear labels, textbook style, educational, white background`;
  }
  if (isPhysics) {
    return `${userText}, accurate physics diagram, schematic style, clear symbols, vectors and forces labeled, educational, white background`;
  }
  if (isChemistry) {
    return `${userText}, accurate chemical structure or reaction diagram, molecular model, clear bonds and atoms, educational, white background`;
  }

  // 3. Generic Fallback
  return `${userText}, clean scientific educational textbook diagram, labeled, accurate, vector illustration, white background`;
};

// ==========================================
// Physics Background
// ==========================================
const PhysicsBackground = ({ gravityEnabled }) => {
  const canvasRef = useRef(null);
  const elementsRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const animRef = useRef();

  useEffect(() => {
    const colors = ['rgba(56,189,248,0.4)', 'rgba(168,85,247,0.4)', 'rgba(52,211,153,0.4)', 'rgba(255,255,255,0.1)'];
    elementsRef.current = Array.from({ length: 25 }).map(() => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 40 + 15, color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.05
    }));

    const onResize = () => { if (canvasRef.current) { canvasRef.current.width = innerWidth; canvasRef.current.height = innerHeight; } };
    window.addEventListener('resize', onResize); onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const step = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (mouseRef.current.active) {
        const gradient = ctx.createRadialGradient(mouseRef.current.x, mouseRef.current.y, 0, mouseRef.current.x, mouseRef.current.y, 150);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath(); ctx.arc(mouseRef.current.x, mouseRef.current.y, 150, 0, Math.PI * 2); ctx.fill();
      }

      elementsRef.current.forEach(el => {
        if (gravityEnabled) { el.vy -= 0.4; el.vx *= 0.98; }
        else { el.vy *= 0.95; el.vx *= 0.95; el.y += Math.sin(Date.now() * 0.001 + el.x) * 0.15; }

        const dx = el.x - mouseRef.current.x; const dy = el.y - mouseRef.current.y; const dist = Math.hypot(dx, dy);
        if (dist < 150) {
          const force = (150 - dist) * 0.08;
          const angle = Math.atan2(dy, dx);
          el.vx += Math.cos(angle) * force; el.vy += Math.sin(angle) * force;
        }

        el.x += el.vx; el.y += el.vy; el.rotation += el.rotSpeed; el.rotSpeed *= 0.98;

        if (el.y < 0 || el.y > canvas.height) el.vy *= -0.7;
        if (el.x < 0 || el.x > canvas.width) el.vx *= -0.7;
        el.x = Math.max(0, Math.min(canvas.width, el.x));
        el.y = Math.max(0, Math.min(canvas.height, el.y));

        ctx.save(); ctx.translate(el.x, el.y); ctx.rotate(el.rotation);
        ctx.fillStyle = el.color; ctx.beginPath();
        const s = el.size / 2;
        ctx.moveTo(-s + 10, -s); ctx.lineTo(s - 10, -s); ctx.quadraticCurveTo(s, -s, s, -s + 10);
        ctx.lineTo(s, s - 10); ctx.quadraticCurveTo(s, s, s - 10, s);
        ctx.lineTo(-s + 10, s); ctx.quadraticCurveTo(-s, s, -s, s - 10);
        ctx.lineTo(-s, -s + 10); ctx.quadraticCurveTo(-s, -s, -s + 10, -s);
        ctx.fill(); ctx.restore();
      });
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [gravityEnabled]);

  useEffect(() => {
    const onMove = (e) => { mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY; mouseRef.current.active = true; };
    const onLeave = () => { mouseRef.current.active = false; };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseleave', onLeave);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseleave', onLeave); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

// ==========================================
// Typewriter & Onboarding (unchanged)
// ==========================================
const Typewriter = ({ text }) => {
  const [d, setD] = useState('');
  useEffect(() => {
    let i = 0; setD(''); if (!text) return;
    const t = setInterval(() => { setD(text.substring(0, i + 1)); i++; if (i >= text.length) clearInterval(t); }, 20);
    return () => clearInterval(t);
  }, [text]);
  return <span>{d}</span>;
};

const Onboarding = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    setTilt({ x: (clientX - left - width / 2) / 25, y: (clientY - top - height / 2) / 25 });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm perspective-1000" onMouseMove={handleMouseMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
      <div className="w-full max-w-md p-8 bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl text-center transform transition-transform duration-100 ease-out animate-entrance" style={{ transform: `rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)` }}>
        <div className="flex justify-center mb-6"><div className="p-4 bg-blue-500/20 rounded-full animate-bounce-slow"><Icons.Cpu className="w-12 h-12 text-blue-400" /></div></div>
        <h2 className="text-3xl font-bold text-white mb-2">Nexus Login</h2>
        <p className="text-slate-400 mb-8 text-sm">Initialize AI Knowledge Grid</p>
        <form onSubmit={(e) => { e.preventDefault(); if (name && subject) onComplete(name, subject); }} className="space-y-4">
          <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" required />
          <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" required>
            <option value="" disabled>Select Subject</option>
            <option value="Physics">Physics</option>
            <option value="Biology">Biology</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Math">Mathematics</option>
            <option value="CS">Computer Science</option>
          </select>
          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg mt-4">Launch Nexus</button>
        </form>
      </div>
    </div>
  );
};

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
    body { font-family: 'Space Grotesk', sans-serif; }
    .glass-panel { background: rgba(17, 25, 40, 0.75); backdrop-filter: blur(14px) saturate(160%); border: 1px solid rgba(255,255,255,0.08); }
    .custom-scroll::-webkit-scrollbar { width: 6px; } .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
    @keyframes entrance { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .animate-entrance { animation: entrance 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    .animate-bounce-slow { animation: float 3s ease-in-out infinite; }
    .perspective-1000 { perspective: 1000px; }
  `}</style>
);

// ==========================================
// MAIN APP
// ==========================================
export default function AIChatbotStation() {
  const [user, setUser] = useState(null);
  const [activeBotId, setActiveBotId] = useState('scibot');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [gravityEnabled, setGravityEnabled] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [lastGeneratedImage, setLastGeneratedImage] = useState(null);
  const scrollRef = useRef(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const bot = AI_PERSONAS.find(p => p.id === activeBotId) || AI_PERSONAS[0];

  const handleLogin = (name, subject) => {
    setUser({ name, subject });
    setMessages([{ id: 'welcome', role: 'bot', content: `Welcome ${name}! Ready to explore ${subject}? Type anything or ask for a diagram!`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, isTyping]);

  const speakResponse = (text, msgId) => {
    if (!window.speechSynthesis) return;

    if (speakingMsgId === msgId) {
      // Stop if clicking the same message
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.replace(/!\[.*?\]\(.*?\)/g, 'Here is an image'));
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setSpeakingMsgId(msgId);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) return alert("Voice not supported");
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      handleSend(null, text);
    };
    recognition.start();
  };

  const callGeminiAPI = async (userText) => {
    const lower = userText.toLowerCase();
    if (lower === 'hi' || lower === 'hello') return "Hey there! What do you want to learn today?";

    setIsTyping(true);

    // Context Injection Logic
    let systemInstruction = `${bot.systemPrompt} Student: ${user.name}, Subject: ${user.subject}`;
    if (lastGeneratedImage && (lower.includes('describe') || lower.includes('explain') || lower.includes('what is this') || lower.includes('look at'))) {
      systemInstruction += ` [SYSTEM NOTE: The user is currently looking at a generated diagram of "${lastGeneratedImage}". Describe it scientifically as if you can see it.]`;
    }

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userText }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIsOffline(false);
      return data.candidates[0].content.parts[0].text;
    } catch (err) {
      setIsOffline(true);
      return "Offline mode active. I can still show diagrams and jokes!";
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (e, override) => {
    if (e) e.preventDefault();
    const txt = (override || input).trim();
    if (!txt) return;

    const userMsg = { id: Date.now(), role: 'user', content: txt, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const lower = txt.toLowerCase();
    // Refined Regex: Only triggers on explicit creation requests, ignoring "describe this image"
    const isImageRequest = /(?:generate|draw|create|show)\s+(?:me\s+)?(?:an?\s+)?(?:image|picture|diagram|illustration|sketch)|(?:diagram|illustration)\s+of/i.test(lower);

    if (isImageRequest) {
      setIsTyping(true);
      const smartPrompt = smartImageGenerator(txt);
      setLastGeneratedImage(smartPrompt); // Save context
      const finalPrompt = `${smartPrompt}, clean scientific textbook illustration, accurate diagram, bold clear labels with leader lines, white background, vector style, high resolution 4k, educational purpose, professional, no text outside image, no watermark`;
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?safe=false&nologo=true&enhance=true`;

      setTimeout(() => {
        const botMsg = {
          id: Date.now() + 1,
          role: 'bot',
          content: `Here’s your diagram:\n\n![${smartPrompt}](${imageUrl})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    const reply = await callGeminiAPI(txt);

    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', content: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setIsTyping(false);
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      <Styles />
      <PhysicsBackground gravityEnabled={gravityEnabled} />

      {!user ? (
        <Onboarding onComplete={handleLogin} />
      ) : (
        <div className="relative z-10 w-full h-full flex flex-col md:flex-row p-4 md:p-6 gap-4">
          {/* SIDEBAR */}
          <div className={`fixed inset-y-0 left-0 w-80 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 p-6 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:bg-slate-900/60 md:md:border md:rounded-3xl md:flex md:flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <span className={`p-2 rounded-xl bg-gradient-to-br ${bot.gradient} shadow-lg`}><Icons.Cpu className="text-white w-6 h-6" /></span>
                  <span>Nexus</span>
                </h1>
                <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-full"><Icons.User className="w-4 h-4 text-slate-400" /></div>
                    <div>
                      <div className="text-sm font-bold">{user.name}</div>
                      <div className="text-[10px] text-blue-400 uppercase tracking-wider">{user.subject} Track</div>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-2 bg-white/5 rounded-full hover:bg-white/10"><Icons.X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto custom-scroll">
              <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Select Persona</h3>
              {AI_PERSONAS.map((p) => {
                const IconComp = p.icon;
                return (
                  <button key={p.id} onClick={() => { setActiveBotId(p.id); setMobileMenuOpen(false); }} className={`w-full group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 border ${activeBotId === p.id ? 'bg-white/10 border-white/20 translate-x-1' : 'bg-transparent border-transparent hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`p-2 rounded-lg transition-colors duration-300 ${activeBotId === p.id ? p.bgHighlight + ' text-white' : 'bg-white/10 text-white/70'}`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-sm md:text-base">{p.name}</div>
                        <div className="text-[10px] md:text-xs text-white/50">{p.role}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button onClick={() => setGravityEnabled(!gravityEnabled)} className={`w-full p-4 rounded-xl flex items-center justify-between border transition-all mt-4 ${gravityEnabled ? 'bg-purple-500/20 border-purple-500 text-purple-200' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
              <div className="flex items-center gap-3"><Icons.Rocket className={gravityEnabled ? 'animate-bounce' : ''} /> <span className="text-sm font-bold">Antigravity</span></div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${gravityEnabled ? 'bg-purple-500' : 'bg-slate-600'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${gravityEnabled ? 'left-4.5' : 'left-0.5'}`} style={{ left: gravityEnabled ? '18px' : '2px' }} />
              </div>
            </button>
          </div>

          {/* OVERLAY FOR MOBILE */}
          {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

          {/* CHAT AREA */}
          <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col relative overflow-hidden shadow-2xl z-20">
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 hover:bg-white/5 rounded-lg"><Icons.Menu className="w-6 h-6" /></button>
                <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'} animate-pulse shadow-[0_0_10px_#22c55e]`}></div>
                <span className="text-sm font-bold text-slate-200 tracking-wide">{isOffline ? 'OFFLINE MODE' : 'SYSTEM ONLINE'}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                  <Icons.Info className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-300 font-medium">Tip: Type "Generate [topic]" for diagrams</span>
                </div>
                <button onClick={() => window.location.reload()} title="Logout"><Icons.Refresh className="w-5 h-5 text-slate-500 hover:text-white transition-colors" /></button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                      {msg.role === 'user' ? <Icons.User className="w-4 h-4" /> : <Icons.Bot className="w-5 h-5" />}
                    </div>
                    <div className={`px-5 py-3 rounded-2xl border relative group ${msg.role === 'user' ? 'bg-blue-600/20 border-blue-500/30 text-blue-100 rounded-tr-none' : 'bg-slate-800/80 border-white/10 text-slate-100 rounded-tl-none'}`}>
                      <div className="text-sm leading-relaxed">
                        {msg.role === 'bot' ? <MarkdownRenderer content={msg.content} /> : msg.content}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-[9px] opacity-40">{msg.timestamp}</div>
                        {msg.role === 'bot' && (
                          <button onClick={() => speakResponse(msg.content, msg.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-full ml-2" title={speakingMsgId === msg.id ? "Stop" : "Read Aloud"}>
                            {speakingMsgId === msg.id ? <div className="w-3 h-3 bg-red-400 rounded-sm animate-pulse" /> : <Icons.Volume2 className="w-3 h-3 text-slate-400 hover:text-white" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center"><Icons.Bot className="w-5 h-5" /></div>
                  <div className="bg-slate-800/80 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              )}
              <div className="h-2" />
            </div>

            <div className="p-6 pt-0">
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={`Ask ${bot.name} something...`}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-full px-6 py-4 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                />
                <button type="button" onClick={handleVoiceInput} className={`absolute right-12 top-2 p-2 rounded-full transition-all ${isListening ? 'bg-red-500 animate-pulse text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                  <Icons.Mic className="w-5 h-5" />
                </button>
                <button type="submit" disabled={!input.trim()} className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Icons.Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
