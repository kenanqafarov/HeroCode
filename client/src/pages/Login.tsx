import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PixelCharacter, { EmotionType, ClothingType } from '../components/PixelCharacter';
import '@/pages/login.css';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'https://herocodebackend-ym9g.onrender.com/api';

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
  const navigate = useNavigate();
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
        saveUserToLocal({ email: loginData.email.trim() });
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
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.name.trim(),
        lastName: formData.surname.trim(),
        dateOfBirth: new Date(formData.birthDate).toISOString(),
        skillLevel: formData.skillLevel,
        reason: formData.reason.trim(),
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

      const updateRes = await fetch(`${API_BASE}/users/character`, {
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
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-6 left-6 z-50 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-slate-300"
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      <AnimatePresence mode="wait">
        {isLogin ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md relative z-10 p-10 sm:p-12 bg-white dark:bg-slate-900 rounded-2xl shadow-lg dark:shadow-none border border-gray-100 dark:border-slate-800"
          >
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                HeroCode
              </h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-2">Welcome back to the platform</p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm font-medium">
                {errorMessage}
              </div>
            )}

            <section className="mb-6">
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 block">
                Email
              </label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
            </section>

            <section className="mb-8">
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400 transition-colors"
                >
                  {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </section>

            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <button
              onClick={() => setIsLogin(false)}
              className="mt-6 w-full text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 font-medium transition-colors"
            >
              Don't have an account? Create one
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="creator"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-6xl relative z-10 flex flex-col lg:flex-row gap-8 bg-white dark:bg-slate-900 rounded-2xl shadow-lg dark:shadow-none border border-gray-100 dark:border-slate-800 overflow-hidden"
          >
            {/* Character Preview Section */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-slate-700">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Your Character</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Preview: {char.username}</p>
              </div>

              <div className="w-80 h-[480px] relative mb-8">
                <PixelCharacter char={char} />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateWithAI}
                disabled={loading}
                className="w-full max-w-xs px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </motion.button>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-3 text-center">
                Randomize appearance and clothing
              </p>
            </div>

            {/* Form Section */}
            <div className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-[90vh]">
              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Appearance Section */}
              <div className="mb-10">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Appearance</h3>

                <div className="space-y-8">
                  {/* Gender */}
                  <section>
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 block">
                      Gender
                    </label>
                    <div className="flex gap-3">
                      {(['male', 'female'] as const).map((g) => (
                        <motion.button
                          key={g}
                          onClick={() => setChar({ ...char, gender: g })}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all duration-300 ${
                            char.gender === g
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-gray-900 dark:text-white'
                              : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
                          }`}
                        >
                          {g === 'male' ? '♂️ Male' : '♀️ Female'}
                        </motion.button>
                      ))}
                    </div>
                  </section>

                  {/* Emotions */}
                  <section>
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 block">
                      Facial Expression
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {EMOTIONS.map((e) => (
                        <motion.button
                          key={e.value}
                          onClick={() => setChar({ ...char, emotion: e.value })}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                            char.emotion === e.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-gray-900 dark:text-white'
                              : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300'
                          }`}
                        >
                          <span>{e.emoji}</span>
                          <span>{e.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </section>

                  {/* Clothing */}
                  <section>
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 block">
                      Clothing Style
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CLOTHING.filter((c) => (char.gender === 'male' ? c.value !== 'dress' : true)).map((c) => (
                        <motion.button
                          key={c.value}
                          onClick={() => setChar({ ...char, clothing: c.value })}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`py-3 px-3 rounded-lg border-2 text-xs font-semibold transition-all duration-300 ${
                            char.clothing === c.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-gray-900 dark:text-white'
                              : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300'
                          }`}
                        >
                          {c.label}
                        </motion.button>
                      ))}
                    </div>
                  </section>

                  {/* Color Pickers */}
                  <div className="space-y-6">
                    <section>
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 block">
                        Hair Color
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {COLORS.hair.map((c) => (
                          <motion.button
                            key={c}
                            onClick={() => setChar({ ...char, hairColor: c })}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-lg border-2 transition-all duration-200"
                            style={{
                              backgroundColor: c,
                              borderColor: char.hairColor === c ? '#2563eb' : '#e5e7eb',
                              boxShadow: char.hairColor === c ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
                            }}
                          />
                        ))}
                      </div>
                    </section>

                    <section>
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 block">
                        Skin Tone
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {COLORS.skin.map((c) => (
                          <motion.button
                            key={c}
                            onClick={() => setChar({ ...char, skin: c })}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-full border-2 transition-all duration-200"
                            style={{
                              backgroundColor: c,
                              borderColor: char.skin === c ? '#2563eb' : '#e5e7eb',
                              boxShadow: char.skin === c ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
                            }}
                          />
                        ))}
                      </div>
                    </section>

                    <section>
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 block">
                        Outfit Color
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {COLORS.outfit.map((c) => (
                          <motion.button
                            key={c}
                            onClick={() => setChar({ ...char, clothingColor: c })}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            className="h-10 rounded-lg transition-all duration-200 border-2"
                            style={{
                              backgroundColor: c,
                              borderColor: char.clothingColor === c ? '#ffffff' : 'transparent',
                              boxShadow: char.clothingColor === c ? '0 0 12px rgba(255,255,255,0.3)' : 'none',
                            }}
                          />
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              {/* Account Section */}
              <div className="mb-10">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Account Details</h3>

                <div className="space-y-4">
                  <section>
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 block">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      maxLength={12}
                      value={char.username}
                      onChange={(e) => setChar({ ...char, username: e.target.value.toUpperCase() })}
                      placeholder="PLAYER_NAME"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    />
                    {char.username.trim().length < 3 && char.username.trim() && (
                      <p className="text-red-500 text-xs mt-1">Minimum 3 characters</p>
                    )}
                  </section>

                  <section>
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 block">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="unique_username"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    />
                    {formData.username.trim().length < 3 && formData.username.trim() && (
                      <p className="text-red-500 text-xs mt-1">Minimum 3 characters</p>
                    )}
                  </section>

                  <div className="grid grid-cols-2 gap-4">
                    <section>
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 block">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      />
                    </section>

                    <section>
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 block">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={formData.surname}
                        onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                        placeholder="Doe"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      />
                    </section>
                  </div>

                  <section>
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 block">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    />
                    {formData.email && !formData.email.includes('@') && (
                      <p className="text-red-500 text-xs mt-1">Please enter a valid email</p>
                    )}
                  </section>

                  <div className="grid grid-cols-2 gap-4">
                    <section>
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 block">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {formData.password && formData.password.length < 6 && (
                        <p className="text-red-500 text-xs mt-1">Minimum 6 characters</p>
                      )}
                    </section>

                    <section>
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 block">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
                      )}
                    </section>
                  </div>

                  <section>
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 block">
                      Birth Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    />
                  </section>

                  <section>
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 block">
                      Skill Level <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SKILL_LEVELS.map((level) => (
                        <motion.button
                          key={level.value}
                          onClick={() => setFormData({ ...formData, skillLevel: level.value })}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`py-2 px-3 rounded-lg border-2 text-xs font-semibold transition-all duration-300 ${
                            formData.skillLevel === level.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-gray-900 dark:text-white'
                              : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300'
                          }`}
                        >
                          {level.label}
                        </motion.button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 block">
                      Why are you joining? <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    >
                      <option value="" disabled>Select a reason...</option>
                      <option value="career">Build my career</option>
                      <option value="freelance">Take freelance work</option>
                      <option value="startup">Start my own company</option>
                      <option value="hobby">Learn as a hobby</option>
                      <option value="gaming">Game development</option>
                      <option value="other">Other</option>
                    </select>
                  </section>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-6 flex flex-col sm:flex-row gap-3 border-t border-gray-100 dark:border-slate-700">
                <button
                  onClick={() => setIsLogin(true)}
                  disabled={loading}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeploy}
                  disabled={loading || !isRegisterFormValid()}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Account'
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