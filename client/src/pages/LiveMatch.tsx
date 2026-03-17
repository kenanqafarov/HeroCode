import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import {
  Sword, Database, Zap, Shield, Braces,
  CircuitBoard, FileCode2, Terminal, ArrowLeft, X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const glowColor = '#22ff99';

const orbitItems = [
  { Icon: Braces, color: glowColor },
  { Icon: Sword, color: '#ff4d73' },
  { Icon: CircuitBoard, color: '#a855f7' },
  { Icon: FileCode2, color: '#facc15' },
  { Icon: Terminal, color: glowColor },
  { Icon: Database, color: '#10b981' },
  { Icon: Zap, color: '#eab308' },
  { Icon: Shield, color: '#3b82f6' },
];

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';
const SOCKET_URL = ((import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const statusPhrases = [
  "NEURAL NETWORKS SCANNING...",
  "HUNTING FOR OPPONENT...",
  "SEARCHING WORTHY RIVAL...",
  "ANALYZING COMBAT PATTERNS...",
  "SYNCING ENEMY SIGNATURE...",
  "CALCULATING MATCH ODDS...",
  "STABILIZING CONNECTION...",
  "TARGET ACQUIRED → LOCKING...",
  "AWAITING PLAYER CONFIRMATION...",
  "PREPARING FOR BATTLE..."
];

const LiveMatch = () => {
  const [searching, setSearching] = useState(false);
  const [statusText, setStatusText] = useState("SYSTEM CHECK...");
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // =============================================
  //  1. Komponent yüklənəndə dərhal /my-match yoxla
  //     (əgər artıq aktiv matç varsa → dərhal oyuna keç)
  // =============================================
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('queue-status', ({ message }: { message: string }) => {
      if (message) setStatusText(message.toUpperCase());
    });

    socket.on('match-found', ({ matchId }: { matchId: string }) => {
      if (matchId) {
        navigate(`/live-match/game/${matchId}`, { replace: true });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [navigate]);

  useEffect(() => {
    const checkExistingMatch = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/matchmaking/my-match`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
          return;
        }

        if (res.ok) {
          const payload = await res.json();
          const match = payload?.data ?? payload;
          const matchId = match?.id || match?._id;
          if (matchId && match?.status === 'Active') {
            navigate(`/live-match/game/${matchId}`, { replace: true });
          }
        }
      } catch (err) {
        console.error('Initial my-match check failed:', err);
      }
    };

    checkExistingMatch();
  }, [navigate]);

  // =============================================
  //  2. Status mesajları dövrü (searching zamanı)
  // =============================================
  useEffect(() => {
    if (!searching) return;

    let i = 0;
    intervalRef.current = setInterval(() => {
      setStatusText(statusPhrases[i % statusPhrases.length]);
      i = (i + 1) % statusPhrases.length;
    }, 1800);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [searching]);

  // =============================================
  //  3. Polling — yalnız searching=true olduqda
  // =============================================
  useEffect(() => {
    if (!searching) return;

    const checkMatch = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/matchmaking/my-match`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
          return;
        }

        if (res.ok) {
          const payload = await res.json();
          const match = payload?.data ?? payload;
          const matchId = match?.id || match?._id;

          // Aktiv matç tapılıbsa → oyuna yönləndir
          if (matchId && match?.status === 'Active') {
            navigate(`/live-match/game/${matchId}`, { replace: true });
            return;
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    // İlk sorğunu dərhal göndər
    checkMatch();

    // Hər 4 saniyədən bir təkrarla
    pollingRef.current = setInterval(checkMatch, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [searching, navigate]);

  // =============================================
  //  Queue-yə qoşulma
  // =============================================
  const joinQueue = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return false;
    }

    try {
      if (!socketRef.current) {
        return false;
      }

      if (!socketRef.current.connected) {
        socketRef.current.connect();
      }

      socketRef.current.emit('join-queue');
      setSearching(true);

      // 75 saniyədən sonra avtomatik dayandır (timeout)
      setTimeout(() => {
        setSearching(false);
      }, 75000);

      return true;
    } catch (err) {
      console.error('Join queue error:', err);
      return false;
    }
  };

  const leaveQueue = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('leave-queue');
      }
    } catch (err) {
      console.error('Leave queue error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleFindMatch = async () => {
    const success = await joinQueue();
    if (!success) {
      alert("Queue-yə qoşulma alınmadı. İnternet bağlantınızı yoxlayın.");
    }
  };

  const handleCancel = () => {
    leaveQueue();
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050806] text-white font-['JetBrains_Mono',monospace] flex items-center justify-center p-4">

      {/* Background grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `linear-gradient(${glowColor}1a 1px, transparent 1px), linear-gradient(90deg, ${glowColor}1a 1px, transparent 1px)`,
            backgroundSize: '44px 44px',
            perspective: '1200px',
            transform: 'rotateX(65deg) translateY(-120px)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050806] via-transparent via-40% to-[#050806]" />
      </div>

      {searching && (
        <motion.div
          initial={{ top: '-15%' }}
          animate={{ top: '115%' }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#22ff99]/70 to-transparent z-50 pointer-events-none"
        />
      )}

      <AnimatePresence mode="wait">
        {!searching ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex flex-col items-center gap-14 text-center"
          >
            <div className="space-y-5">
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="text-sm tracking-[0.6em] text-[#22ff99]/90 font-light"
              >
                NEURAL CORE: ACTIVE
              </motion.div>
              <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-[-0.04em] bg-gradient-to-br from-white via-gray-200 to-gray-600 bg-clip-text text-transparent drop-shadow-xl">
                HERO<span className="text-[#22ff99]">Code</span>
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 md:gap-10">
              <motion.button
                onClick={handleFindMatch}
                whileHover={{ scale: 1.06, boxShadow: `0 0 50px ${glowColor}55` }}
                whileTap={{ scale: 0.94 }}
                className="group relative px-14 sm:px-20 py-7 bg-transparent border-2 border-[#22ff99]/80 hover:border-[#22ff99] overflow-hidden rounded-md min-w-[260px] sm:min-w-[320px]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#22ff99]/30 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-400" />
                <span className="relative z-10 text-[#22ff99] group-hover:text-black font-black text-xl sm:text-2xl tracking-[0.25em] transition-colors duration-300">
                  INITIATE COMBAT
                </span>
              </motion.button>

              <motion.button
                onClick={handleGoBack}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="group relative px-10 py-6 bg-transparent border border-gray-700 hover:border-gray-400 overflow-hidden rounded-md min-w-[180px]"
              >
                <div className="absolute inset-0 bg-gray-800/20 translate-y-full group-hover:translate-y-0 transition-transform duration-400" />
                <div className="relative z-10 flex items-center justify-center gap-3 text-gray-300 group-hover:text-white font-medium text-lg">
                  <ArrowLeft size={20} />
                  BACK
                </div>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="searching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center gap-12 w-full max-w-xl"
          >
            <div className="relative w-72 sm:w-80 h-72 sm:h-80 flex items-center justify-center">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-[#22ff99]/15"
                  style={{ width: `${120 + i * 70}px`, height: `${120 + i * 70}px` }}
                  animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                  transition={{ duration: 14 + i * 7, repeat: Infinity, ease: "linear" }}
                />
              ))}

              <div className="text-center z-20">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Terminal size={64} className="mx-auto text-[#22ff99] mb-6 drop-shadow-[0_0_25px_#22ff99aa]" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-widest text-[#22ff99]/95 leading-tight">
                  {statusText}
                </h2>
              </div>

              {orbitItems.map(({ Icon, color }, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 24, repeat: Infinity, ease: "linear", delay: i * -3 }}
                >
                  <motion.div
                    style={{ color, top: '4%', left: '50%', transform: 'translateX(-50%)' }}
                    className="absolute p-3 bg-[#050806]/80 border border-current/60 rounded-lg shadow-[0_0_14px_currentColor/40] backdrop-blur-sm"
                  >
                    <Icon size={26} />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Progress */}
            <div className="w-80 sm:w-[480px] space-y-3">
              <div className="flex justify-between text-xs text-[#22ff99]/70 uppercase tracking-wider">
                <span>QUEUE STATUS: ACTIVE</span>
                <span>PING: 18–42ms</span>
              </div>

              <div className="relative h-6 bg-black/70 border border-[#22ff99]/50 rounded overflow-hidden shadow-inner">
                <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-40">
                  {[...Array(30)].map((_, i) => (
                    <div key={i} className="w-px h-full bg-[#22ff99]/40" />
                  ))}
                </div>

                <motion.div
                  className="h-full bg-gradient-to-r from-[#22ff99]/30 to-[#22ff99] shadow-[0_0_20px_#22ff99aa]"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 60, ease: "linear" }}
                />

                <motion.div
                  animate={{ x: ['-150%', '150%'] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "circInOut" }}
                  className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                />
              </div>

              <div className="text-center text-sm text-gray-500/90 italic tracking-tight">
                {`>_ AWAITING SECOND PLAYER CONNECTION...`}
              </div>
            </div>

            <motion.button
              onClick={handleCancel}
              whileHover={{ scale: 1.07, boxShadow: '0 0 40px rgba(239, 68, 68, 0.5)' }}
              whileTap={{ scale: 0.92 }}
              className="group relative px-16 py-6 bg-transparent border-2 border-red-500/70 hover:border-red-400 overflow-hidden rounded-md mt-4"
            >
              <div className="absolute inset-0 bg-red-600/30 translate-y-full group-hover:translate-y-0 transition-transform duration-350" />
              <div className="relative z-10 flex items-center gap-4 text-red-400 group-hover:text-red-100 font-black tracking-widest text-xl">
                <X size={24} />
                CANCEL SEARCH
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveMatch;