import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Select, { SingleValue } from 'react-select';
import Editor from '@monaco-editor/react';
import PixelCharacter, { EmotionType, ClothingType } from '../components/PixelCharacter';

const ReactSelect = Select as any;
const MonacoEditor = Editor as any;

// ── Types & Interfaces ──────────────────────────────────────────────────────────
interface MatchData {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Health: number;
  player2Health: number;
  startedAt: string;
  endedAt: string | null;
  status: string;
  winnerId: string | null;
}

interface UserCharacter {
  skin?: string;
  hairColor?: string;
  clothingColor?: string;
  gender?: string;
  emotion?: string;
  clothing?: string;
}

interface UserData {
  id: string;
  username: string;
  character?: UserCharacter;
}

interface CharProps {
  skin: string;
  hairColor: string;
  clothingColor: string;
  gender: 'male' | 'female';
  emotion: EmotionType;
  clothing: ClothingType;
}

interface TestCaseRaw {
  input: string | number | any;
  output: any;
}

interface Question {
  id?: string;
  title?: string;
  description: string;
  hint?: string;
  functionSignature?: string;
  testCases?: TestCaseRaw[] | string;
  [key: string]: any;
}

type LanguageOption = { value: string; label: string };

const languageOptions: LanguageOption[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
];

const defaultCharProps: CharProps = {
  skin: '#f5cba7',
  hairColor: '#8d6e63',
  clothingColor: '#4caf50',
  gender: 'male',
  emotion: 'neutral' as EmotionType,
  clothing: 'tshirt' as ClothingType,
};

// localStorage açarı
const QUESTION_INDEX_KEY = 'heroCode_currentQuestionIndex';

export default function HeroCode() {
  const [match, setMatch] = useState<MatchData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [opponent, setOpponent] = useState<UserData | null>(null);
  const [playerHP, setPlayerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string[]>([]);
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHit, setIsHit] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testsPassed, setTestsPassed] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const addOutput = (msg: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const prefix = type === 'success' ? '🟢' : type === 'error' ? '🔴' : type === 'warning' ? '🟡' : 'ℹ️';
    setOutput((prev) => [...prev, `[${time}] ${prefix} ${msg}`]);
  };

  useEffect(() => {
    const templates: Record<string, string> = {
      javascript: `// HeroCode Challenge\nfunction attack(a) {\n  // Kodunuzu bura yazın\n  return a * 2;\n}`,
      typescript: `function attack(a: number): number {\n  // Kodunuzu bura yazın\n  return a * 2;\n}`,
      python: `def attack(a):\n    # Kodunuzu bura yazın\n    return a * 2`,
    };
    setCode(templates[language] || templates.javascript);
  }, [language]);

  useEffect(() => {
    const savedIndex = localStorage.getItem(QUESTION_INDEX_KEY);
    if (savedIndex !== null) {
      const parsed = parseInt(savedIndex, 10);
      if (!isNaN(parsed)) {
        setCurrentQuestionIndex(parsed);
      }
    }

    const fetchAllData = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('currentUserData');

      if (!token || !storedUser) {
        setError("AUTH_REQUIRED: Daxil olmaq mütləqdir.");
        setLoading(false);
        return;
      }

      try {
        const user: UserData = JSON.parse(storedUser);
        setCurrentUser(user);

        await loadMatchAndOpponent(token, user.id, true);

        const { data: qData } = await axios.get<any[]>(
          'https://renderdeployback.onrender.com/api/Matchmaking/start-game-questions',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Raw suallar:", qData);
        const loadedQuestions = Array.isArray(qData) ? qData : [];
        setQuestions(loadedQuestions);

        if (loadedQuestions.length > 0) {
          setCurrentQuestionIndex((prev) => {
            const safeIndex = Math.min(prev, loadedQuestions.length - 1);
            localStorage.setItem(QUESTION_INDEX_KEY, String(safeIndex));
            return safeIndex;
          });

          addOutput(`Tapşırıq yükləndi: ${loadedQuestions[0].description || loadedQuestions[0].title || '(ad yoxdur)'}`, 'info');
        }

      } catch (err: any) {
        console.error("Fetch xətası:", err);
        setError(`SİSTEM XƏTASI: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    pollingRef.current = setInterval(() => {
      const token = localStorage.getItem('token');
      const userId = currentUser?.id;
      if (token && userId) {
        loadMatchAndOpponent(token, userId, false);
      }
    }, 3500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const loadMatchAndOpponent = async (token: string, userId: string, showOutput: boolean = true) => {
    try {
      const { data: matchData } = await axios.get<MatchData>(
        'https://renderdeployback.onrender.com/api/Matchmaking/my-match',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMatch(matchData);

      const isPlayer1 = matchData.player1Id === userId;

      setPlayerHP(isPlayer1 ? matchData.player1Health : matchData.player2Health);
      setOpponentHP(isPlayer1 ? matchData.player2Health : matchData.player1Health);

      if (matchData.winnerId && showOutput) {
        const isWinner = matchData.winnerId === userId;
        addOutput(
          isWinner ? "OYUN BİTDİ — SİZ QƏLƏBƏ QAZANDINIZ!" : "OYUN BİTDİ — RƏQİB QƏLƏBƏ QAZANDI",
          isWinner ? 'success' : 'error'
        );
      }

      const opponentId = isPlayer1 ? matchData.player2Id : matchData.player1Id;

      if (!opponent || opponent.id !== opponentId) {
        const { data: oppData } = await axios.get<UserData>(
          `https://renderdeployback.onrender.com/api/Users/${opponentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOpponent(oppData);
      }
    } catch (err: any) {
      console.error("Match yeniləmə xətası:", err);
    }
  };

  const getCharProps = (user: UserData | null): CharProps => {
    if (!user?.character) return defaultCharProps;
    const c = user.character;
    return {
      skin: c.skin && c.skin !== 'None' ? c.skin : defaultCharProps.skin,
      hairColor: c.hairColor && c.hairColor !== 'None' ? c.hairColor : defaultCharProps.hairColor,
      clothingColor: c.clothingColor && c.clothingColor !== 'None' ? c.clothingColor : defaultCharProps.clothingColor,
      gender: (c.gender === 'female' || c.gender === 'male') ? (c.gender as 'male' | 'female') : defaultCharProps.gender,
      emotion: (c.emotion?.toLowerCase() as EmotionType) || defaultCharProps.emotion,
      clothing: (c.clothing as ClothingType) || defaultCharProps.clothing,
    };
  };

  const parseTestCases = (testCasesField: any): TestCaseRaw[] => {
    if (Array.isArray(testCasesField)) return testCasesField;
    if (typeof testCasesField === 'string') {
      try {
        return JSON.parse(testCasesField);
      } catch (e) {
        console.error("testCases parse xətası:", e);
        return [];
      }
    }
    return [];
  };

  const runTests = () => {
    if (questions.length === 0) {
      addOutput("Heç bir sual yüklənməyib", 'error');
      return;
    }

    if (currentQuestionIndex >= questions.length) {
      addOutput("Bütün suallar bitib", 'warning');
      return;
    }

    const q = questions[currentQuestionIndex];
    const rawTestCases = q.testCases || q.tests || q.cases || q.examples || [];
    const testCases = parseTestCases(rawTestCases);

    addOutput(`Testlər işə salınır → ${q.functionSignature || '(signature yoxdur)'}`);
    addOutput(`Tapşırıq: ${q.description || q.title || '(təsvir yoxdur)'}`);

    if (testCases.length === 0) {
      addOutput("XƏTA: Heç bir test case tapılmadı və ya parse olunmadı", 'error');
      setTestsPassed(false);
      return;
    }

    setTestsPassed(false);

    if (language === 'python') {
      addOutput("Python üçün lokal test hələlik simulyasiya rejimindədir", 'warning');
      setTestsPassed(true);
      return;
    }

    try {
      const functionRegex = /function\s+attack\s*\(\s*([^)]*)\s*\)\s*{([\s\S]*?)}/i;
      const match = code.match(functionRegex);

      if (!match) {
        addOutput("XƏTA: 'function attack( ... ) { ... }' tapılmadı!", 'error');
        setTestsPassed(false);
        return;
      }

      const paramsStr = match[1].trim();
      const body = match[2].trim();

      const paramNames = paramsStr.split(',').map(p => p.trim()).filter(p => p.length > 0);

      if (paramNames.length === 0) {
        addOutput("XƏTA: Funksiyada parametr tapılmadı", 'error');
        setTestsPassed(false);
        return;
      }

      const executable = new Function(
        ...paramNames,
        body + `;\nreturn attack(${paramNames.join(', ')});`
      );

      let allPassed = true;

      testCases.forEach((test, idx) => {
        try {
          let inputs = Array.isArray(test.input) ? test.input : [test.input];
          inputs = inputs.map((val: any) => (typeof val === 'string' && !isNaN(Number(val))) ? Number(val) : val);

          const result = executable(...inputs);
          const stringResult = String(result).trim();
          const expected = String(test.output ?? '').trim();

          const passed = stringResult === expected;

          addOutput(
            `Test ${idx + 1}: input = ${JSON.stringify(test.input)} → ${passed ? 'PASSED' : 'FAILED'} (gözlənilən: ${expected})`,
            passed ? 'success' : 'error'
          );

          if (!passed) allPassed = false;
        } catch (e: any) {
          addOutput(`Test ${idx + 1} xətası: ${e.message}`, 'error');
          allPassed = false;
        }
      });

      setTestsPassed(allPassed);

      if (allPassed) {
        addOutput('BÜTÜN TESTLƏR UĞURLA KEÇDİ → Cast Fatality aktivdir', 'success');
      } else {
        addOutput('Bəzi testlər keçmədi. Kodu düzəldin.', 'error');
      }
    } catch (err: any) {
      addOutput(`Kompilyasiya xətası: ${err.message}`, 'error');
      setTestsPassed(false);
    }
  };

  const submitAttack = async () => {
    if (!testsPassed) {
      addOutput('Əvvəlcə bütün testləri keçməlisiniz!', 'error');
      return;
    }

    setIsHit(true);
    addOutput('FATİL ZƏRBƏ ATILIR...', 'success');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://renderdeployback.onrender.com/api/Matchmaking/attack',
        10,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      addOutput('Zərbə uğurla göndərildi! Rəqibə 10 zərər vuruldu.', 'success');

      if (token && currentUser?.id) {
        await loadMatchAndOpponent(token, currentUser.id, true);
      }

      setCurrentQuestionIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex < questions.length) {
          localStorage.setItem(QUESTION_INDEX_KEY, String(nextIndex));
          addOutput(`Növbəti tapşırıq yükləndi (#${nextIndex + 1})`, 'success');
          return nextIndex;
        } else {
          addOutput('Bütün tapşırıqlar tamamlandı! Qələbəyə yaxınlaşırsınız.', 'success');
          localStorage.removeItem(QUESTION_INDEX_KEY);
          return prev;
        }
      });

    } catch (err: any) {
      addOutput(`Attack xətası: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setTimeout(() => setIsHit(false), 600);
    }
  };

  const handleLeaveMatch = async () => {
    if (leaving) return;
    if (!window.confirm('Oyundan çıxmaq istədiyinizə əminsiniz?')) return;

    setLeaving(true);
    addOutput('MATCH-dən çıxılır...', 'info');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://renderdeployback.onrender.com/api/Matchmaking/leave-match',
        {},
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      addOutput('Uğurla çıxdınız!', 'success');
      localStorage.removeItem(QUESTION_INDEX_KEY);
      setTimeout(() => window.location.href = '/profile', 1400);
    } catch (err: any) {
      addOutput(`Çıxış xətası: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setLeaving(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex] || null;

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-yellow-500 font-mono italic">
        <motion.div animate={{ opacity: [1, 0.4, 1] }} className="text-6xl mb-4 font-black">HEROCODE</motion.div>
        <p className="mt-4 tracking-[0.3em] text-sm uppercase">ARENA YÜKLƏNİR...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-red-500 font-mono p-10">
        <div className="border-2 border-red-600 p-8">
          <h1 className="text-3xl font-black mb-4">SİSTEM XƏTASI</h1>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 border border-red-600 hover:bg-red-600 hover:text-white transition-all">
            REBOOT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex h-screen overflow-hidden bg-[#050505] text-gray-100 font-mono ${isHit ? 'animate-shake' : ''}`}>

      {/* BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a1a2e_0%,#000_100%)]" />
        <div className="absolute bottom-0 w-full h-1/2 perspective-1000">
          <div
            className="w-full h-[200%] origin-top animate-grid-flow"
            style={{
              background: 'linear-gradient(90deg, rgba(34,197,94,0.1) 1px, transparent 1px), linear-gradient(0deg, rgba(34,197,94,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              transform: 'rotateX(60deg)',
            }}
          />
        </div>
      </div>

      {/* LEFT PANEL */}
      <div className="relative z-10 w-5/12 flex flex-col border-r border-yellow-600/20 bg-black/60 backdrop-blur-md">

        <div className="p-4 border-b border-yellow-600/30 flex items-center justify-between gap-4">
          <h1 className="text-xl font-black italic text-yellow-500 whitespace-nowrap">HEROCODE</h1>

          <div className="flex items-center gap-3">
            <ReactSelect
              options={languageOptions}
              value={languageOptions.find((o) => o.value === language)}
              onChange={(opt: SingleValue<LanguageOption>) => opt && setLanguage(opt.value)}
              className="w-40 text-sm"
              styles={{
                control: (base: any) => ({ ...base, backgroundColor: '#000', borderColor: '#854d0e', color: '#fff' }),
                singleValue: (base: any) => ({ ...base, color: '#eab308' }),
                menu: (base: any) => ({ ...base, backgroundColor: '#000', border: '1px solid #854d0e' }),
                option: (base: any, state: any) => ({
                  ...base,
                  backgroundColor: state.isFocused ? '#854d0e' : 'transparent',
                  color: '#fff',
                }),
              }}
            />

            <button
              onClick={handleLeaveMatch}
              disabled={leaving}
              className={`
                px-4 py-1.5 text-sm font-bold uppercase tracking-wide rounded
                border border-red-700/70 text-red-400 hover:text-red-300
                hover:bg-red-900/30 transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-1.5
              `}
            >
              {leaving ? <>Çıxılır...</> : <>OYUNDAN ÇIX</>}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-950/70 to-black p-4 border-b border-yellow-700/40 min-h-[140px] max-h-[180px] overflow-y-auto">
          {questions.length === 0 ? (
            <p className="text-yellow-600 italic">Tapşırıqlar yüklənir və ya mövcud deyil...</p>
          ) : currentQuestion ? (
            <>
              <h3 className="font-black text-yellow-400 mb-2">
                Tapşırıq {currentQuestionIndex + 1} / {questions.length}
              </h3>
              <p className="text-sm text-gray-200 mb-2 leading-relaxed">
                {currentQuestion.description || currentQuestion.title || '(təsvir yoxdur)'}
              </p>
              {currentQuestion.hint && (
                <p className="text-xs text-yellow-500 italic mt-1">İpucu: {currentQuestion.hint}</p>
              )}
              <pre className="text-yellow-300 text-xs bg-black/60 p-2 rounded border border-yellow-900/50 font-mono overflow-x-auto mt-2">
                {currentQuestion.functionSignature || '// funksiya imzası yoxdur'}
              </pre>
            </>
          ) : (
            <p className="text-green-500">Bütün tapşırıqlar tamamlandı!</p>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(v: string | undefined) => setCode(v || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'Fira Code, monospace',
              cursorStyle: 'block',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="relative z-10 w-7/12 flex flex-col">

        <div className="p-8">
          <div className="flex justify-between items-end gap-10">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-yellow-500 font-black uppercase">{currentUser?.username || 'PLAYER'}</span>
                <span>{playerHP}%</span>
              </div>
              <div className="h-5 bg-gray-900 border border-gray-700 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                  animate={{ width: `${playerHP}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>

            <div className="text-3xl font-black text-white/80 italic tracking-widest">VS</div>

            <div className="flex-1 text-right">
              <div className="flex justify-between mb-1">
                <span>{opponentHP}%</span>
                <span className="text-red-500 font-black uppercase">{opponent?.username || 'RIVAL'}</span>
              </div>
              <div className="h-5 bg-gray-900 border border-gray-700 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-700 to-red-500 ml-auto"
                  animate={{ width: `${opponentHP}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative flex items-center justify-around pointer-events-none gap-10 md:gap-16">

  {/* Sol – Öz personaj */}
  <motion.div
    initial={{ x: -100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay: 0.3, duration: 0.7 }}
    className="w-24 h-24 md:w-36 md:h-36 flex items-center justify-center transform-gpu"
  >
    <div className="scale-[1.8] md:scale-[2.1]">
      <PixelCharacter char={getCharProps(currentUser)} />
    </div>
  </motion.div>

  {/* Sağ – Rəqib (mirror) */}
  <motion.div
    animate={{
      scale: isHit ? [1, 1.10, 1] : 1,
      filter: isHit ? 'brightness(2.3) saturate(1.5)' : 'brightness(1)',
    }}
    transition={{
      duration: isHit ? 0.5 : 0.3,
      scale: isHit ? { times: [0, 0.5, 1] } : undefined,
    }}
    className="w-24 h-24 md:w-36 md:h-36 flex items-center justify-center scale-x-[-1] transform-gpu"
  >
    <div className="scale-[1.8] md:scale-[2.1]">
      <PixelCharacter char={getCharProps(opponent)} />
    </div>
  </motion.div>

</div>

        <div className="h-1/3 bg-black/90 border-t border-yellow-900/50 flex flex-col relative z-30">
          <div className="flex p-3 gap-3 bg-zinc-950 border-b border-zinc-800">
            <button
              onClick={runTests}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold uppercase tracking-wide rounded border border-zinc-700 transition-colors"
            >
              TEST SPELL
            </button>

            <button
              onClick={submitAttack}
              disabled={!testsPassed || opponentHP <= 0 || playerHP <= 0}
              className={`
                flex-[2] py-2.5 text-black font-black uppercase tracking-widest rounded
                shadow-[0_0_20px_rgba(234,179,8,0.4)]
                transition-all
                ${testsPassed
                  ? 'bg-yellow-500 hover:bg-yellow-400 active:scale-95'
                  : 'bg-yellow-800/50 cursor-not-allowed opacity-60'}
              `}
            >
              {testsPassed ? 'CAST FATALITY' : 'TEST KEÇMƏLİDİR'}
            </button>
          </div>

          <div ref={outputRef} className="flex-1 p-4 overflow-y-auto text-xs text-yellow-200/90 font-mono whitespace-pre-wrap">
            <AnimatePresence>
              {output.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-1.5 border-l-2 border-yellow-800/50 pl-2.5 leading-relaxed"
                >
                  {line}
                </motion.div>
              ))}
            </AnimatePresence>

            {output.length === 0 && (
              <div className="text-zinc-600 italic">Kodu yazın və Test Spell düyməsinə basın...</div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes grid-flow { 0% { background-position: 0 0; } 100% { background-position: 0 60px; } }
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          25%  { transform: translate(-5px, 5px); }
          50%  { transform: translate(5px, -5px); }
          75%  { transform: translate(-3px, 3px); }
        }
        .animate-grid-flow { animation: grid-flow 2.4s linear infinite; }
        .animate-shake     { animation: shake 0.5s ease-in-out; }
        .perspective-1000  { perspective: 1000px; }
      `}</style>
    </div>
  );
}