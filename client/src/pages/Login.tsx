import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Eye, EyeOff, Sparkles, Loader2, ArrowLeft, ArrowRight,
  Rocket, User, Lock, Calendar, Target, Palette, CheckCircle,
  Zap, Code2, Globe, Gamepad2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PixelCharacter, { EmotionType, ClothingType } from '../components/PixelCharacter';
import '@/pages/login.css';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'https://herocodebackend-ym9g.onrender.com/api';

/* ── Constants ──────────────────────────────────────────── */
const EMOTIONS: { value: EmotionType; label: string; emoji: string }[] = [
  { value: 'neutral', label: 'Cool', emoji: '😐' },
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'angry', label: 'Fierce', emoji: '😠' },
  { value: 'sad', label: 'Chill', emoji: '😢' },
  { value: 'surprised', label: 'Amazed', emoji: '😲' },
];

const CLOTHING: { value: ClothingType; label: string; icon: string }[] = [
  { value: 'tshirt', label: 'T-Shirt', icon: '👕' },
  { value: 'hoodie', label: 'Hoodie', icon: '🧥' },
  { value: 'jacket', label: 'Jacket', icon: '🥼' },
  { value: 'dress', label: 'Dress', icon: '👗' },
];

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', icon: '🌱', desc: 'Just starting out', color: '#22c55e' },
  { value: 'intermediate', label: 'Intermediate', icon: '⚡', desc: 'Know the fundamentals', color: '#3b82f6' },
  { value: 'advanced', label: 'Advanced', icon: '🔥', desc: 'Building real projects', color: '#f97316' },
  { value: 'expert', label: 'Expert', icon: '💎', desc: 'Master of the craft', color: '#a855f7' },
];

const REASONS = [
  { value: 'career', label: 'Build my career', icon: <Target size={16} /> },
  { value: 'freelance', label: 'Take freelance work', icon: <Globe size={16} /> },
  { value: 'startup', label: 'Start my own company', icon: <Rocket size={16} /> },
  { value: 'hobby', label: 'Learn as a hobby', icon: <Zap size={16} /> },
  { value: 'gaming', label: 'Game development', icon: <Gamepad2 size={16} /> },
  { value: 'other', label: 'Other reason', icon: <Code2 size={16} /> },
];

const HAIR_COLORS = ['#b96321', '#212121', '#6d4c41', '#f44336', '#ffffff', '#a855f7', '#fbbf24', '#14b8a6'];
const SKIN_TONES = ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3a21'];
const OUTFIT_COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#f97316', '#334155', '#ec4899', '#14b8a6'];

/* ── Floating hex SVG ───────────────────────────────────── */
const HexSVG = ({ size = 120, color = '#2563eb' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <polygon
      points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
      stroke={color} strokeWidth="1.5" fill="none"
    />
    <polygon
      points="50,18 80,34 80,66 50,82 20,66 20,34"
      stroke={color} strokeWidth="0.5" fill={color} fillOpacity="0.04"
    />
  </svg>
);

/* ── Slide variants ─────────────────────────────────────── */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
};
const transition = { type: 'spring' as const, stiffness: 280, damping: 30 };

/* ── Shared input component ─────────────────────────────── */
const HeroInput = ({
  label, type = 'text', value, onChange, placeholder, error, icon, right
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  error?: string; icon?: React.ReactNode; right?: React.ReactNode;
}) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(240,244,255,0.5)', marginBottom: 8, textTransform: 'uppercase', fontFamily: 'var(--hero-mono)' }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      {icon && (
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(240,244,255,0.3)', pointerEvents: 'none' }}>
          {icon}
        </span>
      )}
      <input
        className="hero-input"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: icon ? 44 : 18, paddingRight: right ? 48 : 18 }}
      />
      {right && (
        <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
          {right}
        </span>
      )}
    </div>
    {error && <p style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: 6 }}>{error}</p>}
  </div>
);

/* ══════════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════════ */
const HeroAuth = () => {
  const navigate = useNavigate();

  /* ── Mode: 'welcome' | 'login' | 'register' ─ */
  const [mode, setMode] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [step, setStep] = useState(0);      // 0–6 for register wizard
  const [dir, setDir] = useState(1);      // slide direction
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ── Login form ─────────────────────────────────────── */
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showLoginPw, setShowLoginPw] = useState(false);

  /* ── Register character ─────────────────────────────── */
  const [char, setChar] = useState({
    username: 'X_PLAYER_1',
    gender: 'male' as 'male' | 'female',
    hairColor: '#b96321',
    skin: '#ffdbac',
    clothingColor: '#3b82f6',
    emotion: 'neutral' as EmotionType,
    clothing: 'tshirt' as ClothingType,
  });

  /* ── Register form ──────────────────────────────────── */
  const [form, setForm] = useState({
    username: '', name: '', surname: '', email: '',
    password: '', confirmPassword: '', birthDate: '',
    skillLevel: '', reason: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);

  /* ── Global 3D Parallax ─────────────────────────────── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [-6, 6]), springConfig);
  const bgX = useSpring(useTransform(mouseX, [-1, 1], [-25, 25]), springConfig);
  const bgY = useSpring(useTransform(mouseY, [-1, 1], [-25, 25]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(nx);
      mouseY.set(ny);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  /* ── Card Shine Effect ──────────────────────────────── */
  const cardRef = useRef<HTMLDivElement>(null);
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    const shine = cardRef.current.querySelector('.hero-shine') as HTMLElement;
    if (shine) {
      shine.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
      shine.style.setProperty('--my', `${(y + 0.5) * 100}%`);
    }
  }, []);
  const onMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    const shine = cardRef.current.querySelector('.hero-shine') as HTMLElement;
    if (shine) {
      shine.style.setProperty('--mx', `50%`);
      shine.style.setProperty('--my', `50%`);
    }
  }, []);

  /* ── Token check ────────────────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (Date.now() < payload.exp * 1000) {/* still valid */ }
        else { localStorage.removeItem('token'); localStorage.removeItem('email'); }
      } catch { localStorage.removeItem('token'); }
    }
  }, []);

  const goStep = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
    setErrorMsg(null);
  };

  /* ── AI randomise ───────────────────────────────────── */
  const randomize = () => {
    const g = Math.random() < 0.5 ? 'male' : 'female';
    const clothes = CLOTHING.filter(c => g === 'female' || c.value !== 'dress');
    const ri = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
    setChar({
      username: `X_PLAYER_${Math.floor(Math.random() * 9000) + 100}`,
      gender: g,
      hairColor: ri(HAIR_COLORS),
      skin: ri(SKIN_TONES),
      clothingColor: ri(OUTFIT_COLORS),
      emotion: ri(EMOTIONS).value,
      clothing: ri(clothes).value as ClothingType,
    });
  };

  /* ── Step validators ────────────────────────────────── */
  const stepValid: Record<number, boolean> = {
    0: form.name.trim().length >= 2 && form.surname.trim().length >= 2 && form.username.trim().length >= 3,
    1: form.email.includes('@') && form.email.includes('.') && form.password.length >= 6 && form.password === form.confirmPassword,
    2: form.birthDate !== '' && form.reason !== '',
    3: form.skillLevel !== '',
    4: true,
    5: true,
  };

  /* ── Handle login ───────────────────────────────────── */
  const handleLogin = async () => {
    if (!loginData.email.trim() || !loginData.password.trim()) {
      setErrorMsg('Email and password are required'); return;
    }
    setLoading(true); setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginData.email.trim(), password: loginData.password }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Login failed'); }
      const data = await res.json();
      const token = data.accessToken || data.data?.accessToken;
      if (!token) throw new Error('No token received');
      localStorage.setItem('token', token);
      localStorage.setItem('email', loginData.email.trim());
      const meRes = await fetch(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      let userData = { email: loginData.email.trim() };
      if (meRes.ok) { 
        const mj = await meRes.json(); 
        userData = mj.data || mj;
        localStorage.setItem('currentUserData', JSON.stringify(userData)); 
        // Redirect to admin if user is admin
        if (userData.isAdmin) {
          window.location.href = '/admin';
          return;
        }
      } else { 
        localStorage.setItem('currentUserData', JSON.stringify(userData)); 
      }
      window.location.href = '/';
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  /* ── Handle register ────────────────────────────────── */
  const handleDeploy = async () => {
    if (loading) return;
    setLoading(true); setErrorMsg(null);
    try {
      const registerRes = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          firstName: form.name.trim(),
          lastName: form.surname.trim(),
          dateOfBirth: new Date(form.birthDate).toISOString(),
          skillLevel: form.skillLevel,
          reason: form.reason.trim(),
        }),
      });
      if (!registerRes.ok) { const e = await registerRes.json().catch(() => ({})); throw new Error(e.message || 'Registration failed'); }
      const rData = await registerRes.json();
      const token = rData.accessToken || rData.data?.accessToken;
      if (!token) throw new Error('No token received');
      localStorage.setItem('token', token);
      localStorage.setItem('email', form.email.trim());
      await fetch(`${API_BASE}/users/character`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          gender: char.gender, emotion: char.emotion, clothing: char.clothing,
          hairColor: char.hairColor, skin: char.skin, clothingColor: char.clothingColor,
          username: char.username.trim().toUpperCase(),
        }),
      });
      localStorage.setItem('currentUserData', JSON.stringify({
        username: form.username.trim(), firstName: form.name.trim(), lastName: form.surname.trim(),
        email: form.email.trim(), skillLevel: form.skillLevel,
        isAdmin: rData.data?.isAdmin || false
      }));
      // Redirect to admin if newly registered user is admin
      if (rData.data?.isAdmin) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  /* ══════════════════════════════════════════════════════
     RENDER HELPERS
     ══════════════════════════════════════════════════════ */

  /* Step 0 — Identity */
  const renderStep0 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <HeroInput label="First Name" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="John" icon={<User size={16} />}
        error={form.name && form.name.trim().length < 2 ? 'Min 2 characters' : undefined} />
      <HeroInput label="Last Name" value={form.surname} onChange={v => setForm({ ...form, surname: v })} placeholder="Doe" icon={<User size={16} />}
        error={form.surname && form.surname.trim().length < 2 ? 'Min 2 characters' : undefined} />
      <HeroInput label="Username" value={form.username} onChange={v => setForm({ ...form, username: v })} placeholder="hero_coder" icon={<Code2 size={16} />}
        error={form.username && form.username.trim().length < 3 ? 'Min 3 characters' : undefined} />
    </div>
  );

  /* Step 1 — Credentials */
  const renderStep1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <HeroInput label="Email" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="you@example.com" icon={<Globe size={16} />}
        error={form.email && !form.email.includes('@') ? 'Invalid email' : undefined} />
      <HeroInput label="Password" type={showPw ? 'text' : 'password'} value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder="Min 6 characters" icon={<Lock size={16} />}
        error={form.password && form.password.length < 6 ? 'Min 6 characters' : undefined}
        right={<button type="button" onClick={() => setShowPw(!showPw)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,244,255,0.4)', display: 'flex' }}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
      />
      <HeroInput label="Confirm Password" type={showCPw ? 'text' : 'password'} value={form.confirmPassword} onChange={v => setForm({ ...form, confirmPassword: v })} placeholder="Re-enter password" icon={<Lock size={16} />}
        error={form.confirmPassword && form.password !== form.confirmPassword ? "Passwords don't match" : undefined}
        right={<button type="button" onClick={() => setShowCPw(!showCPw)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,244,255,0.4)', display: 'flex' }}>{showCPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
      />
    </div>
  );

  /* Step 2 — Origin */
  const renderStep2 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <HeroInput label="Birth Date" type="date" value={form.birthDate} onChange={v => setForm({ ...form, birthDate: v })} icon={<Calendar size={16} />} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(240,244,255,0.5)', marginBottom: 12, textTransform: 'uppercase', fontFamily: 'var(--hero-mono)' }}>
          Why are you joining?
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {REASONS.map(r => (
            <motion.button key={r.value} type="button"
              onClick={() => setForm({ ...form, reason: r.value })}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className={`hero-char-btn ${form.reason === r.value ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {r.icon} {r.label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );

  /* Step 3 — Skill Level */
  const renderStep3 = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {SKILL_LEVELS.map(s => (
        <motion.button key={s.value} type="button"
          onClick={() => setForm({ ...form, skillLevel: s.value })}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          className={`hero-skill-card ${form.skillLevel === s.value ? 'active' : ''}`}
        >
          <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>{s.icon}</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0f4ff', marginBottom: 4 }}>{s.label}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(240,244,255,0.45)' }}>{s.desc}</div>
          {form.skillLevel === s.value && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              style={{ position: 'absolute', top: 10, right: 10, color: s.color }}>
              <CheckCircle size={16} />
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );

  /* Step 4 — Character Builder */
  const renderStep4 = () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {/* Left: controls */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Gender */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(240,244,255,0.45)', marginBottom: 10, textTransform: 'uppercase', fontFamily: 'var(--hero-mono)' }}>Gender</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['male', 'female'] as const).map(g => (
              <motion.button key={g} type="button" onClick={() => setChar({ ...char, gender: g })}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className={`hero-char-btn ${char.gender === g ? 'active' : ''}`} style={{ flex: 1 }}>
                {g === 'male' ? '♂️ Male' : '♀️ Female'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Display Name */}
        <HeroInput label="Hero Name" value={char.username}
          onChange={v => setChar({ ...char, username: v.toUpperCase().slice(0, 12) })}
          placeholder="X_HERO_1" icon={<Sparkles size={16} />} />

        {/* Emotion */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(240,244,255,0.45)', marginBottom: 10, textTransform: 'uppercase', fontFamily: 'var(--hero-mono)' }}>Expression</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EMOTIONS.map(e => (
              <motion.button key={e.value} type="button" onClick={() => setChar({ ...char, emotion: e.value })}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className={`hero-char-btn ${char.emotion === e.value ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {e.emoji} {e.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Clothing */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(240,244,255,0.45)', marginBottom: 10, textTransform: 'uppercase', fontFamily: 'var(--hero-mono)' }}>Clothing</label>
          <div style={{ display: 'grid', gridTemplateColumns: char.gender === 'female' ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 8 }}>
            {CLOTHING.filter(c => char.gender === 'female' || c.value !== 'dress').map(c => (
              <motion.button key={c.value} type="button" onClick={() => setChar({ ...char, clothing: c.value })}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className={`hero-char-btn ${char.clothing === c.value ? 'active' : ''}`}>
                {c.icon} {c.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Hair color */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(240,244,255,0.45)', marginBottom: 10, textTransform: 'uppercase', fontFamily: 'var(--hero-mono)' }}>Hair</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {HAIR_COLORS.map(c => (
              <motion.button key={c} type="button" onClick={() => setChar({ ...char, hairColor: c })}
                whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                className={`hero-swatch ${char.hairColor === c ? 'active' : ''}`}
                style={{ backgroundColor: c, borderRadius: '50%' }} />
            ))}
          </div>
        </div>

        {/* Skin tone */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(240,244,255,0.45)', marginBottom: 10, textTransform: 'uppercase', fontFamily: 'var(--hero-mono)' }}>Skin Tone</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SKIN_TONES.map(c => (
              <motion.button key={c} type="button" onClick={() => setChar({ ...char, skin: c })}
                whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                className={`hero-swatch ${char.skin === c ? 'active' : ''}`}
                style={{ backgroundColor: c, borderRadius: '50%' }} />
            ))}
          </div>
        </div>

        {/* Outfit color */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(240,244,255,0.45)', marginBottom: 10, textTransform: 'uppercase', fontFamily: 'var(--hero-mono)' }}>Outfit Color</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {OUTFIT_COLORS.map(c => (
              <motion.button key={c} type="button" onClick={() => setChar({ ...char, clothingColor: c })}
                whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                className={`hero-swatch ${char.clothingColor === c ? 'active' : ''}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        {/* AI Randomise */}
        <motion.button type="button" onClick={randomize}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="hero-btn-primary" style={{ width: '100%', marginTop: 4 }}>
          <Sparkles size={16} style={{ display: 'inline', marginRight: 8 }} /> Randomize with AI
        </motion.button>
      </div>

      {/* Right: preview */}
      <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 200, height: 280, position: 'relative' }}>
          <PixelCharacter char={char} />
        </div>
        <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 10, padding: '6px 14px', fontFamily: 'var(--hero-mono)', fontSize: '0.7rem', color: '#93c5fd', letterSpacing: '0.1em' }}>
          {char.username}
        </div>
      </div>
    </div>
  );

  /* Step 5 — Review */
  const renderStep5 = () => {
    const skillObj = SKILL_LEVELS.find(s => s.value === form.skillLevel);
    const reasonObj = REASONS.find(r => r.value === form.reason);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { label: 'Name', value: `${form.name} ${form.surname}` },
          { label: 'Username', value: `@${form.username}` },
          { label: 'Email', value: form.email },
          { label: 'Hero Name', value: char.username },
          { label: 'Skill', value: skillObj ? `${skillObj.icon} ${skillObj.label}` : '—' },
          { label: 'Goal', value: reasonObj?.label ?? '—' },
        ].map(item => (
          <div key={item.label} className="hero-review-item">
            <span style={{ minWidth: 90, fontSize: '0.75rem', fontWeight: 600, color: 'rgba(240,244,255,0.4)', fontFamily: 'var(--hero-mono)', textTransform: 'uppercase' }}>{item.label}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f0f4ff' }}>{item.value}</span>
          </div>
        ))}
        {/* Mini character */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <div style={{ width: 120, height: 160, position: 'relative' }}>
            <PixelCharacter char={char} />
          </div>
        </div>
        {errorMsg && <div className="hero-error">{errorMsg}</div>}
      </div>
    );
  };

  /* ── Step metadata ──────────────────────────────────── */
  const STEPS = [
    { title: 'Who Are You?', sub: 'Tell us your identity', icon: <User size={22} />, render: renderStep0 },
    { title: 'Secure Your Realm', sub: 'Set up your credentials', icon: <Lock size={22} />, render: renderStep1 },
    { title: 'Your Origin Story', sub: 'Background & motivation', icon: <Calendar size={22} />, render: renderStep2 },
    { title: 'Power Level', sub: 'Where are you in your journey?', icon: <Zap size={22} />, render: renderStep3 },
    { title: 'Forge Your Hero', sub: 'Customize your pixel character', icon: <Palette size={22} />, render: renderStep4 },
    { title: 'Ready to Deploy?', sub: 'Review your hero and launch', icon: <Rocket size={22} />, render: renderStep5 },
  ];

  const totalSteps = STEPS.length; // 0..5
  const progress = mode === 'register' ? ((step + 1) / totalSteps) * 100 : 0;

  /* ════════════════════════════════════════════════════
     JSX RETURN
     ════════════════════════════════════════════════════ */
  return (
    <div className="hero-login-page">

      {/* ── Animated grid background ── */}
      <div className="hero-grid-bg" />
      <div className="hero-noise" />

      {/* ── Floating hex decorations ── */}
      <motion.div style={{ x: bgX, y: bgY, position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        {[
          { x: '8%', y: '10%', size: 180, color: '#2563eb', dur: 7, delay: 0 },
          { x: '85%', y: '5%', size: 120, color: '#06b6d4', dur: 9, delay: 1.5 },
          { x: '75%', y: '70%', size: 200, color: '#2563eb', dur: 11, delay: 0.5 },
          { x: '5%', y: '65%', size: 100, color: '#7c3aed', dur: 8, delay: 2 },
          { x: '45%', y: '88%', size: 130, color: '#06b6d4', dur: 10, delay: 1 },
        ].map((h, i) => (
          <motion.div key={i} className="hero-hex"
            style={{ left: h.x, top: h.y }}
            animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
            transition={{ duration: h.dur, repeat: Infinity, delay: h.delay, ease: 'easeInOut' }}>
            <HexSVG size={h.size} color={h.color} />
          </motion.div>
        ))}
      </motion.div>

      {/* ── Progress bar (register only) ── */}
      {mode === 'register' && (
        <div className="hero-progress-track">
          <div className="hero-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* ── Back button ── */}
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (mode === 'welcome') navigate('/');
          else if (mode === 'login') { setMode('welcome'); setErrorMsg(null); }
          else if (mode === 'register') {
            if (step === 0) { setMode('welcome'); setErrorMsg(null); }
            else goStep(step - 1);
          }
        }}
        style={{
          position: 'fixed', top: 20, left: 20, zIndex: 200,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center',
          color: 'rgba(240,244,255,0.7)', backdropFilter: 'blur(12px)',
        }}>
        <ArrowLeft size={18} />
      </motion.button>

      {/* ── Main content ── */}
      <div style={{
        position: 'relative', zIndex: 10, minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
        perspective: '1200px'
      }}>
        <motion.div style={{
          rotateX, rotateY, transformStyle: 'preserve-3d',
          width: '100%', display: 'flex', justifyContent: 'center'
        }}>
          <AnimatePresence mode="wait" custom={dir}>

            {/* ══ WELCOME SCREEN ══ */}
            {mode === 'welcome' && (
              <motion.div key="welcome"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                style={{ textAlign: 'center', maxWidth: 680, width: '100%' }}>

                {/* Logo badge */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 100, padding: '6px 18px', marginBottom: 32 }}>
                  <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e', display: 'inline-block' }} />
                  <span style={{ fontFamily: 'var(--hero-mono)', fontSize: '0.75rem', letterSpacing: '0.12em', color: '#93c5fd' }}>HEROCODE PROTOCOL v2.0</span>
                </motion.div>

                <motion.h1 className="hero-headline"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)', marginBottom: 24 }}>
                  HERO<br />CODE
                </motion.h1>

                <motion.p className="hero-subtext"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                  style={{ marginBottom: 48 }}>
                  The platform where developers become legends.<br />
                  Battle-tested skills. Real projects. Epic community.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>

                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setMode('register'); setStep(0); setDir(1); }}
                    className="hero-btn-primary"
                    style={{ fontSize: '1.05rem', padding: '18px 48px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Rocket size={20} /> Enter HeroCode
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setMode('login'); setErrorMsg(null); }}
                    className="hero-btn-ghost"
                    style={{ fontSize: '0.95rem', padding: '14px 40px' }}>
                    Already a Hero? Sign In
                  </motion.button>
                </motion.div>

                {/* Floating stats */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                  style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 60 }}>
                  {[['10K+', 'Heroes'], ['500+', 'Challenges'], ['99%', 'Uptime']].map(([val, lab]) => (
                    <div key={lab} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg,#fff,#93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(240,244,255,0.35)', fontFamily: 'var(--hero-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{lab}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* ══ LOGIN SCREEN ══ */}
            {mode === 'login' && (
              <motion.div key="login"
                custom={1}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={transition}
                style={{ width: '100%', maxWidth: 460 }}>
                <div className="hero-card hero-tilt" ref={cardRef}
                  onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
                  style={{ padding: '44px 40px', position: 'relative', overflow: 'hidden' }}>
                  <div className="hero-shine" />

                  {/* Header */}
                  <div style={{ marginBottom: 36, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--hero-mono)', letterSpacing: '0.15em', color: 'rgba(240,244,255,0.4)', marginBottom: 12, textTransform: 'uppercase' }}>
                      PORTAL ACCESS
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg,#fff 40%,#93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>
                      Welcome Back
                    </h2>
                    <p style={{ color: 'rgba(240,244,255,0.4)', fontSize: '0.9rem' }}>Enter your credentials to continue</p>
                  </div>

                  {errorMsg && <div className="hero-error" style={{ marginBottom: 20 }}>{errorMsg}</div>}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <HeroInput label="Email" type="email" value={loginData.email}
                      onChange={v => setLoginData({ ...loginData, email: v })}
                      placeholder="you@example.com" icon={<Globe size={16} />} />
                    <HeroInput label="Password" type={showLoginPw ? 'text' : 'password'}
                      value={loginData.password} onChange={v => setLoginData({ ...loginData, password: v })}
                      placeholder="••••••••" icon={<Lock size={16} />}
                      right={<button type="button" onClick={() => setShowLoginPw(!showLoginPw)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,244,255,0.4)', display: 'flex' }}>
                        {showLoginPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>}
                    />
                  </div>

                  <motion.button onClick={handleLogin} disabled={loading}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="hero-btn-primary"
                    style={{ width: '100%', marginTop: 28, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={18} /></>}
                  </motion.button>

                  <button onClick={() => { setMode('register'); setStep(0); setErrorMsg(null); }}
                    style={{ width: '100%', marginTop: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,244,255,0.4)', fontSize: '0.875rem', fontFamily: 'var(--hero-font)', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,244,255,0.8)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,244,255,0.4)')}>
                    Don't have an account? <span style={{ color: '#60a5fa', fontWeight: 600 }}>Create one →</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══ REGISTER WIZARD ══ */}
            {mode === 'register' && (
              <motion.div key={`register-${step}`}
                custom={dir}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={transition}
                style={{ width: '100%', maxWidth: step === 4 ? 720 : 520 }}>
                <div className="hero-card" style={{ padding: '40px 36px', position: 'relative', overflow: 'hidden' }}>

                  {/* Step label */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                    <div>
                      <p className="hero-step-label" style={{ marginBottom: 6 }}>
                        Step {step + 1} of {totalSteps}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: 'rgba(37,99,235,0.9)' }}>{STEPS[step].icon}</span>
                        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f0f4ff' }}>{STEPS[step].title}</h2>
                      </div>
                      <p style={{ color: 'rgba(240,244,255,0.4)', fontSize: '0.85rem', marginTop: 4 }}>{STEPS[step].sub}</p>
                    </div>
                    {/* Dot progress */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {STEPS.map((_, i) => (
                        <div key={i} style={{
                          width: i === step ? 20 : 8, height: 8, borderRadius: 100,
                          background: i <= step ? 'linear-gradient(90deg, #2563eb, #06b6d4)' : 'rgba(255,255,255,0.1)',
                          transition: 'all 0.3s',
                          boxShadow: i === step ? '0 0 10px rgba(37,99,235,0.6)' : 'none',
                        }} />
                      ))}
                    </div>
                  </div>

                  {/* Error */}
                  {errorMsg && <div className="hero-error" style={{ marginBottom: 20 }}>{errorMsg}</div>}

                  {/* Step content */}
                  <div style={{ minHeight: step === 4 ? 'auto' : 280 }}>
                    {STEPS[step].render()}
                  </div>

                  {/* Nav buttons */}
                  <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                    {step > 0 && (
                      <motion.button type="button" onClick={() => goStep(step - 1)}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="hero-btn-ghost" style={{ flex: 1 }}>
                        <ArrowLeft size={16} style={{ display: 'inline', marginRight: 6 }} /> Back
                      </motion.button>
                    )}
                    {step < totalSteps - 1 ? (
                      <motion.button type="button"
                        onClick={() => { if (stepValid[step]) goStep(step + 1); }}
                        disabled={!stepValid[step]}
                        whileHover={{ scale: stepValid[step] ? 1.02 : 1 }}
                        whileTap={{ scale: stepValid[step] ? 0.98 : 1 }}
                        className="hero-btn-primary"
                        style={{ flex: step > 0 ? 2 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        Continue <ArrowRight size={16} />
                      </motion.button>
                    ) : (
                      <motion.button type="button" onClick={handleDeploy} disabled={loading}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="hero-btn-primary"
                        style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '1rem' }}>
                        {loading ? <><Loader2 size={18} className="animate-spin" /> Deploying...</> : <><Rocket size={18} /> Launch Hero</>}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroAuth;