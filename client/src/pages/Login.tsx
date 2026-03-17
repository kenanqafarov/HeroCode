import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import PixelCharacter, { EmotionType, ClothingType } from '@/components/PixelCharacter';
import '@/pages/login.css';

const API_BASE = 'http://localhost:5000/api';

const EMOTIONS: { value: EmotionType; label: string; emoji: string }[] = [
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'angry', label: 'Angry', emoji: '😠' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'surprised', label: 'Surprised', emoji: '😲' },
];

const CLOTHING: { value: ClothingType; label: string }[] = [
  { value: 'tshirt', label: 'T-SHIRT' },
  { value: 'hoodie', label: 'HOODIE' },
  { value: 'jacket', label: 'JACKET' },
  { value: 'dress', label: 'DRESS' },
];

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const HeroAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [char, setChar] = useState({
    username: 'X_PLAYER_1',
    gender: 'male' as 'male' | 'female',
    hairColor: '#b96321',
    skin: '#ffdbac',
    clothingColor: '#3b82f6',
    emotion: 'neutral' as EmotionType,
    clothing: 'tshirt' as ClothingType,
  });

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    skillLevel: '',
    reason: '',
  });

  const COLORS = {
    hair: ['#b96321', '#212121', '#6d4c41', '#f44336', '#ffffff', '#a855f7', '#fbbf24', '#14b8a6'],
    skin: ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3a21'],
    outfit: ['#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#f97316', '#334155', '#ec4899', '#14b8a6'],
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      if (Date.now() >= exp) {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        return false;
      }
      return true;
    } catch (e) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      return false;
    }
  };

  useEffect(() => {
    if (checkTokenExpiration()) {
      console.log('Token hələ keçərlidir');
    }

    const interval = setInterval(() => {
      if (!checkTokenExpiration()) {
        setIsLogin(true);
        setErrorMessage('Sessiya vaxtı bitdi. Yenidən daxil olun.');
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getRandomItem = <T,>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const handleGenerateWithAI = () => {
    const randomGender = Math.random() < 0.5 ? 'male' : 'female';
    const availableClothing = CLOTHING.filter((c) =>
      randomGender === 'male' ? c.value !== 'dress' : true
    );

    setChar({
      username: `X_PLAYER_${Math.floor(Math.random() * 9000) + 100}`,
      gender: randomGender,
      hairColor: getRandomItem(COLORS.hair),
      skin: getRandomItem(COLORS.skin),
      clothingColor: getRandomItem(COLORS.outfit),
      emotion: getRandomItem(EMOTIONS).value,
      clothing: getRandomItem(availableClothing).value as ClothingType,
    });
  };

  const isRegisterFormValid = () => {
    const birthYear = formData.birthDate ? new Date(formData.birthDate).getFullYear() : 0;
    const currentYear = new Date().getFullYear();
    const age = birthYear ? currentYear - birthYear : 0;

    return (
      char.username.trim().length >= 3 &&
      formData.username.trim().length >= 3 &&
      formData.name.trim().length >= 2 &&
      formData.surname.trim().length >= 2 &&
      formData.email.includes('@') &&
      formData.email.includes('.') &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      formData.birthDate !== '' &&
      age >= 10 &&
      age <= 99 &&
      formData.skillLevel !== '' &&
      formData.reason !== ''
    );
  };

  const saveUserToLocal = (userData: any) => {
    localStorage.setItem('currentUserData', JSON.stringify(userData));
  };

  const handleLogin = async () => {
    if (!loginData.email.trim() || !loginData.password.trim()) {
      setErrorMessage('Email və parol daxil edin');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email.trim(),
          password: loginData.password,
        }),
      });

      if (!loginRes.ok) {
        const err = await loginRes.json().catch(() => ({}));
        throw new Error(err.message || 'Giriş uğursuzdur');
      }

      const loginDataResponse = await loginRes.json();
      const token = loginDataResponse.accessToken || loginDataResponse.data?.accessToken;

      if (!token) {
        throw new Error('Token alınmadı');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('email', loginData.email.trim());

      const meRes = await fetch(`${API_BASE}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (meRes.ok) {
        const meJson = await meRes.json();
        const userData = meJson.data || meJson;
        saveUserToLocal(userData);
      } else {
        console.warn('GET /users/me uğursuz oldu → status:', meRes.status);
        saveUserToLocal({
          email: loginData.email.trim(),
        });
      }

      alert(`Giriş uğurludur! Xoş gəldin!`);
      window.location.href = '/profile';

    } catch (err: any) {
      console.error('Login xətası:', err);
      setErrorMessage(err.message || 'Xəta baş verdi, yenidən cəhd edin');
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (loading) return;

    setErrorMessage(null);

    if (!isRegisterFormValid()) {
      setErrorMessage('Bütün məcburi sahələri düzgün doldurun!');
      return;
    }

    setLoading(true);

    try {
      const registerPayload = {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.name.trim(),
        lastName: formData.surname.trim(),
        dateOfBirth: new Date(formData.birthDate).toISOString(),
      };

      const registerRes = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload),
      });

      if (!registerRes.ok) {
        const errData = await registerRes.json().catch(() => ({}));
        throw new Error(errData.message || 'Qeydiyyat uğursuz oldu');
      }

      const registerResponse = await registerRes.json();
      const token = registerResponse.accessToken || registerResponse.data?.accessToken;

      if (!token) {
        throw new Error('Access token tapılmadı. Backend cavabını yoxlayın.');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('email', formData.email.trim());

      const characterPayload = {
        gender: char.gender,
        emotion: char.emotion,
        clothing: char.clothing,
        hairColor: char.hairColor,
        skin: char.skin,
        clothingColor: char.clothingColor,
        username: char.username.trim().toUpperCase(),
      };

      const updateRes = await fetch(`${API_BASE}/user/character`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(characterPayload),
      });

      if (!updateRes.ok) {
        const errData = await updateRes.json().catch(() => ({}));
        console.warn('Character update xətası:', errData.message || 'Personaj yenilənmədi');
        // davam edirik, amma xəbərdarlıq edirik
      }

      const userData = {
        username: formData.username.trim(),
        firstName: formData.name.trim(),
        lastName: formData.surname.trim(),
        email: formData.email.trim(),
        dateOfBirth: formData.birthDate,
        skillLevel: formData.skillLevel,
        reason: formData.reason,
        character: {
          ...characterPayload,
          username: char.username.trim().toUpperCase(),
        },
      };

      saveUserToLocal(userData);

      alert(`UĞURLU! ${char.username.toUpperCase()} yaradıldı və sistemə qoşuldu! 🚀`);

      setFormData({
        username: '',
        name: '',
        surname: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthDate: '',
        skillLevel: '',
        reason: '',
      });

      setChar({
        username: 'X_PLAYER_1',
        gender: 'male',
        hairColor: '#b96321',
        skin: '#ffdbac',
        clothingColor: '#3b82f6',
        emotion: 'neutral',
        clothing: 'tshirt',
      });

      window.location.href = '/profile';

    } catch (err: any) {
      console.error('Register xətası:', err);
      setErrorMessage(err.message || 'Xəta baş verdi, yenidən cəhd edin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="scanline-overlay absolute inset-0 z-0 pointer-events-none" />

      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {isLogin ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md relative z-10 cyber-card p-10 sm:p-12"
          >
            <div className="text-center mb-10">
              <h1 className="text-5xl font-black text-foreground italic tracking-tighter font-['Orbitron']">
                HERO<span className="text-primary">CODE</span>
              </h1>
              <p className="text-[10px] text-muted-foreground mt-3 tracking-[0.4em] uppercase">
                Secure Login Terminal
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-950/60 border border-red-600/50 rounded-xl text-red-200 text-sm font-medium">
                {errorMessage}
              </div>
            )}

            <section className="mb-6">
              <label className="text-[10px] text-muted-foreground uppercase font-black mb-2 block tracking-widest">
                Email
              </label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="user@domain.com"
                className="cyber-input mb-4"
              />
            </section>

            <section className="mb-8">
              <label className="text-[10px] text-muted-foreground uppercase font-black mb-2 block tracking-widest">
                Password
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="••••••••"
                  className="cyber-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </section>

            <button
              onClick={handleLogin}
              disabled={loading}
              className={`cyber-button-primary w-full flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Giriş edilir...
                </>
              ) : (
                'Sessiyanı Başlat'
              )}
            </button>

            <button
              onClick={() => setIsLogin(false)}
              className="mt-8 w-full text-[10px] text-muted-foreground hover:text-primary uppercase tracking-[0.2em] transition-all underline underline-offset-8 decoration-border"
            >
              Yeni İstifadəçi Yarat
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="creator"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-6xl relative z-10 flex flex-col lg:flex-row cyber-card overflow-hidden"
          >
            <div className="w-full lg:w-1/2 bg-[hsl(var(--terminal-bg))] p-10 lg:p-12 flex flex-col items-center justify-center border-r border-border relative">
              <div className="absolute top-8 left-10 flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <p className="text-primary text-xs font-black tracking-widest uppercase font-['Orbitron']">
                  Subyekt: {char.username}
                </p>
              </div>

              <div className="w-80 h-[480px] relative mt-8">
                <PixelCharacter char={char} />
              </div>

              <div className="mt-8 w-full max-w-xs group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-emerald-400 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateWithAI}
                  disabled={loading}
                  className="relative w-full flex items-center justify-center gap-3 py-4 bg-[#0a0a0c] border border-primary/50 rounded-xl text-primary font-['Orbitron'] text-xs font-black uppercase tracking-[0.2em] overflow-hidden shadow-2xl transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  <Sparkles className="w-4 h-4 animate-pulse text-primary" />

                  <span className="relative z-10 drop-shadow-[0_0_8px_rgba(82,255,168,0.8)]">
                    AI ilə Yarat
                  </span>

                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
                  </div>
                </motion.button>

                <div className="mt-3 flex flex-col items-center gap-1">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                  <p className="text-[9px] text-primary/60 font-medium text-center uppercase tracking-[0.15em] leading-relaxed">
                    Neural şəbəkə görünüşü və geyimi randomlaşdıracaq
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-10 lg:p-14 overflow-y-auto max-h-[90vh]">
              {errorMessage && (
                <div className="mb-6 p-4 bg-red-950/60 border border-red-600/50 rounded-xl text-red-200 text-sm font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="mb-12">
                <h2 style={{ fontSize: '20px' }} className="text-primary text-sm font-black uppercase tracking-widest font-['Orbitron'] mb-8 pb-4 border-b border-border">
                  ▸ GÖRÜNÜŞ
                </h2>

                <div className="space-y-10">
                  <section>
                    <label className="text-[10px] text-muted-foreground uppercase font-black mb-4 block tracking-widest">
                      Base Model
                    </label>
                    <div className="flex gap-4">
                      {(['male', 'female'] as const).map((g) => (
                        <button
                          key={g}
                          onClick={() => setChar({ ...char, gender: g })}
                          className={`flex-1 py-4 rounded-xl border-2 text-xs font-black uppercase transition-all duration-300 ${
                            char.gender === g
                              ? 'border-primary bg-primary/10 text-foreground shadow-[0_0_25px_hsl(var(--primary)/0.2)]'
                              : 'border-border text-muted-foreground hover:border-muted-foreground'
                          }`}
                        >
                          {g.toUpperCase()}_UNIT
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <label className="text-[10px] text-muted-foreground uppercase font-black mb-4 block tracking-widest">
                      Facial Expression
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {EMOTIONS.map((e) => (
                        <motion.button
                          key={e.value}
                          onClick={() => setChar({ ...char, emotion: e.value })}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-3 rounded-xl border-2 text-sm transition-all duration-300 flex items-center gap-2 ${
                            char.emotion === e.value
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border text-muted-foreground hover:border-muted-foreground'
                          }`}
                        >
                          <span className="text-lg">{e.emoji}</span>
                          <span className="text-[10px] font-black uppercase">{e.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <label className="text-[10px] text-muted-foreground uppercase font-black mb-4 block tracking-widest">
                      Clothing Style
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {CLOTHING.filter((c) => (char.gender === 'male' ? c.value !== 'dress' : true)).map((c) => (
                        <motion.button
                          key={c.value}
                          onClick={() => setChar({ ...char, clothing: c.value })}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`py-4 rounded-xl border-2 text-xs font-black uppercase transition-all duration-300 ${
                            char.clothing === c.value
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border text-muted-foreground hover:border-muted-foreground'
                          }`}
                        >
                          {c.label}
                        </motion.button>
                      ))}
                    </div>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <section>
                      <label className="text-[10px] text-muted-foreground uppercase font-black mb-4 block tracking-widest">
                        Hair Color
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {COLORS.hair.map((c) => (
                          <motion.button
                            key={c}
                            onClick={() => setChar({ ...char, hairColor: c })}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-11 h-11 rounded-xl border-2 transition-colors duration-200"
                            style={{
                              backgroundColor: c,
                              borderColor: char.hairColor === c ? 'hsl(var(--primary))' : 'transparent',
                              boxShadow: char.hairColor === c ? '0 0 15px hsl(var(--primary)/0.4)' : 'none',
                            }}
                          />
                        ))}
                      </div>
                    </section>

                    <section>
                      <label className="text-[10px] text-muted-foreground uppercase font-black mb-4 block tracking-widest">
                        Skin Tone
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {COLORS.skin.map((c) => (
                          <motion.button
                            key={c}
                            onClick={() => setChar({ ...char, skin: c })}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-11 h-11 rounded-full border-2 transition-colors duration-200"
                            style={{
                              backgroundColor: c,
                              borderColor: char.skin === c ? 'hsl(var(--primary))' : 'transparent',
                              boxShadow: char.skin === c ? '0 0 15px hsl(var(--primary)/0.4)' : 'none',
                            }}
                          />
                        ))}
                      </div>
                    </section>
                  </div>

                  <section>
                    <label className="text-[10px] text-muted-foreground uppercase font-black mb-4 block tracking-widest">
                      Outfit Color
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                      {COLORS.outfit.map((c) => (
                        <motion.button
                          key={c}
                          onClick={() => setChar({ ...char, clothingColor: c })}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="h-14 rounded-xl transition-all duration-200 border-2"
                          style={{
                            backgroundColor: c,
                            borderColor: char.clothingColor === c ? '#ffffff' : 'transparent',
                            boxShadow: char.clothingColor === c ? '0 0 20px rgba(255,255,255,0.3)' : 'none',
                          }}
                        />
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              <div className="mb-8">
                <h2 style={{ fontSize: '20px' }} className="text-primary text-sm font-black uppercase tracking-widest font-['Orbitron'] mb-8 pb-4 border-b border-border">
                  ▸ Başlıq Mətni
                </h2>

                <div className="space-y-6">
                  <section>
                    <label className="text-[10px] text-muted-foreground uppercase font-black mb-2 block tracking-widest">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      maxLength={12}
                      value={char.username}
                      onChange={(e) => setChar({ ...char, username: e.target.value.toUpperCase() })}
                      className="cyber-input"
                      placeholder="DISPLAY NAME..."
                    />
                    {char.username.trim().length < 3 && char.username.trim() && (
                      <p className="text-red-500 text-[10px] mt-1 uppercase">Ən azı 3 simvol olmalıdır</p>
                    )}
                  </section>

                  <section>
                    <label className="text-[10px] text-muted-foreground uppercase font-black mb-2 block tracking-widest">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="cyber-input"
                      placeholder="unique_username"
                    />
                    {formData.username.trim().length < 3 && formData.username.trim() && (
                      <p className="text-red-500 text-[10px] mt-1 uppercase">Ən azı 3 simvol olmalıdır</p>
                    )}
                  </section>

                  <section>
                    <label className="text-[10px] text-muted-foreground uppercase font-black mb-2 block tracking-widest">
                      Ad <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="cyber-input"
                      placeholder="Adınız"
                    />
                  </section>

                  <section>
                    <label className="text-[10px] text-muted-foreground uppercase font-black mb-2 block tracking-widest">
                      Soyad <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={formData.surname}
                      onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                      className="cyber-input"
                      placeholder="Soyadınız"
                    />
                  </section>

                  <section>
                    <label className="text-[10px] text-muted-foreground uppercase font-black mb-2 block tracking-widest">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="cyber-input"
                      placeholder="email@domain.com"
                    />
                    {formData.email && !formData.email.includes('@') && (
                      <p className="text-red-500 text-[10px] mt-1 uppercase">Düzgün email daxil edin</p>
                    )}
                  </section>

                  <section>
                    <label className="text-[10px] text-muted-foreground uppercase font-black mb-2 block tracking-widest">
                      Parol <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="cyber-input pr-12"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {formData.password && formData.password.length < 6 && (
                      <p className="text-red-500 text-[10px] mt-1 uppercase">Ən azı 6 simvol olmalıdır</p>
                    )}
                  </section>

                  <section>
                    <label className="text-[10px] text-muted-foreground uppercase font-black mb-2 block tracking-widest">
                      Parolu təsdiqlə <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="cyber-input pr-12"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-red-500 text-[10px] mt-1 uppercase">Parollar uyğun gəlmir</p>
                    )}
                  </section>

                  <section>
                    <label className="text-[10px] text-muted-foreground uppercase font-black mb-2 block tracking-widest">
                      Doğum tarixi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="cyber-input"
                    />
                  </section>

                  <section>
                    <label className="text-[10px] text-muted-foreground uppercase font-black mb-4 block tracking-widest">
                      Bacarıq səviyyəsi <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {SKILL_LEVELS.map((level) => (
                        <motion.button
                          key={level.value}
                          onClick={() => setFormData({ ...formData, skillLevel: level.value })}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`py-4 rounded-xl border-2 text-xs font-black uppercase transition-all duration-300 ${
                            formData.skillLevel === level.value
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border text-muted-foreground hover:border-muted-foreground'
                          }`}
                        >
                          {level.label}
                        </motion.button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <label className="text-[10px] text-muted-foreground uppercase font-black mb-2 block tracking-widest">
                      Məqsəd / Səbəb <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="cyber-input appearance-none cursor-pointer w-full"
                    >
                      <option value="" disabled>Seçin...</option>
                      <option value="career">Karyera qurmaq</option>
                      <option value="freelance">Frilans işlər</option>
                      <option value="startup">Öz startapımı qurmaq</option>
                      <option value="hobby">Hobbi kimi öyrənmək</option>
                      <option value="gaming">Oyun inkişaf etdirmək</option>
                      <option value="other">Digər</option>
                    </select>
                  </section>

                  <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl mt-8">
                    <h4 className="text-primary text-xs font-black mb-3 uppercase tracking-widest font-['Orbitron']">
                      Sistem Statusu
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                      {isRegisterFormValid()
                        ? 'Bütün məlumatlar tamam → Deploy oluna bilər'
                        : 'Bəzi məcburi sahələr boş və ya səhvdir'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row gap-5 border-t border-border">
                <button
                  onClick={() => setIsLogin(true)}
                  disabled={loading}
                  className="cyber-button-ghost sm:w-auto w-full"
                >
                  Ləğv et
                </button>

                <button
                  onClick={handleDeploy}
                  disabled={loading || !isRegisterFormValid()}
                  className={`flex-1 flex items-center justify-center gap-2 cyber-button-primary ${
                    loading || !isRegisterFormValid() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deploy olunur...
                    </>
                  ) : (
                    'Deploy Et və Sistemə Qoşul'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroAuth;