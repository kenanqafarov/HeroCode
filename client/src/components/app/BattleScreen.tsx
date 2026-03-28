import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleStore } from '@/stores/lessonStore';
import { BattleStats, BattleResult as BattleResultType } from '@/types/lesson-system';
import PixelCharacter from '../PixelCharacter';
import { Zap, Shield, Heart, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BattleScreenProps {
  moduleId: string;
  unitId: number;
  unitName: string;
  moduleTitle: string;
  playerCharacter: {
    gender: 'male' | 'female';
    emotion: string;
    clothing: string;
    hairColor: string;
    skin: string;
    clothingColor: string;
    username?: string;
  };
  onBattleEnd: (won: boolean) => void;
  isLoading?: boolean;
}

const BattleScreen = ({
  moduleId,
  unitId,
  unitName,
  moduleTitle,
  playerCharacter,
  onBattleEnd,
  isLoading
}: BattleScreenProps) => {
  const { active, player, battleLog, isAnimating, initiateBattle, playerAttack, enemyAttack, endBattle } = useBattleStore();

  const [battleStarted, setBattleStarted] = useState(false);
  const [battlePhase, setBattlePhase] = useState<'intro' | 'battle' | 'result'>('intro');
  const [round, setRound] = useState(1);
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [playerStats] = useState<BattleStats>({
    health: 100,
    maxHealth: 100,
    experience: 0,
    level: 1,
    attackPower: 25,
    defensePower: 15
  });

  const enemyStats = useMemo(() => ({
    health: 100,
    maxHealth: 100,
    experience: 500,
    level: 2,
    attackPower: 20,
    defensePower: 10
  }), []);

  // Generate random enemy based on module
  const generateEnemy = () => {
    const enemies: Record<string, { name: string; description: string; type: string }> = {
      'javascript-basics': {
        name: 'Syntax Serpent',
        description: 'A slithering code monster with sharp brackets for fangs',
        type: 'code-monster'
      },
      'react-basics': {
        name: 'Component Chimera',
        description: 'A mythical beast made of interconnected components',
        type: 'pixel-boss'
      },
      'typescript-advanced': {
        name: 'Type Tyrant',
        description: 'A powerful ruler of the type system realm',
        type: 'cyber-entity'
      },
      'node-backend': {
        name: 'Server Slayer',
        description: 'A menacing force from the depths of the backend',
        type: 'data-dragon'
      }
    };

    return enemies[moduleId] || {
      name: 'Code Guardian',
      description: 'A mysterious keeper of knowledge',
      type: 'pixel-boss'
    };
  };

  const enemy = generateEnemy();

  // Initialize battle
  useEffect(() => {
    if (!battleStarted && !isLoading) {
      setTimeout(() => {
        setBattleStarted(true);
        setBattlePhase('battle');
      }, 2000);
    }
  }, [battleStarted, isLoading]);

  const handlePlayerAttack = () => {
    if (isAnimating || enemyHP <= 0) return;

    const damage = Math.floor(Math.random() * 15 + 15); // 15-30
    setEnemyHP(Math.max(0, enemyHP - damage));

    // Show attack animation
    setTimeout(() => {
      if (enemyHP - damage > 0) {
        handleEnemyAttack();
      } else {
        endBattle(true);
        setBattlePhase('result');
      }
    }, 800);
  };

  const handleEnemyAttack = () => {
    const damage = Math.floor(Math.random() * 12 + 8); // 8-20
    setPlayerHP(Math.max(0, playerHP - damage));

    if (playerHP - damage <= 0) {
      endBattle(false);
      setBattlePhase('result');
    }
  };

  const handleDefend = () => {
    if (isAnimating) return;
    // Reduced damage on defend
    const damage = Math.floor(Math.random() * 6 + 2); // 2-8
    setPlayerHP(Math.max(0, playerHP - damage));

    if (playerHP - damage <= 0) {
      endBattle(false);
      setBattlePhase('result');
    }
  };

  const playerWon = battlePhase === 'result' && (enemyHP <= 0);
  const xpGained = playerWon ? 500 : 100;
  const starsGained = playerWon ? 3 : 0;

  // Animation variants
  const characterVariants = {
    attack: {
      x: [0, 20, -10, 0],
      scale: [1, 1.1, 0.95, 1],
      transition: { duration: 0.4 }
    },
    hit: {
      x: [-10, 10, -5, 0],
      transition: { duration: 0.3 }
    },
    idle: {
      y: [0, -5, 0],
      transition: { duration: 2, repeat: Infinity }
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-background via-purple-950/20 to-background z-50 flex flex-col overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <motion.div
        className="relative z-10 text-center py-6 border-b border-border/30 backdrop-blur-sm"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
      >
        <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
          ⚔️ BATTLE ARENA ⚔️
        </h1>
        <p className="text-xs text-muted-foreground">
          {moduleTitle} - {unitName}
        </p>
      </motion.div>

      {/* Intro Phase */}
      {battlePhase === 'intro' && (
        <motion.div
          className="relative z-10 flex-1 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-32 h-32 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-8"
            >
              <Sparkles className="w-16 h-16 text-destructive" />
            </motion.div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Get Ready!</h2>
            <p className="text-lg text-muted-foreground mb-4">Preparing to face</p>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-destructive to-accent bg-clip-text text-transparent">
              {enemy.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-4 max-w-md">
              {enemy.description}
            </p>
          </div>
        </motion.div>
      )}

      {/* Battle Phase */}
      {battlePhase === 'battle' && battleStarted && (
        <motion.div
          className="relative z-10 flex-1 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Battle Area */}
          <div className="flex-1 flex items-center justify-between px-4 md:px-12 py-8">
            {/* Player Side */}
            <motion.div
              className="flex flex-col items-center"
              animate="idle"
              variants={characterVariants}
            >
              <motion.div
                animate={isAnimating ? 'attack' : 'idle'}
                variants={characterVariants}
              >
                <div className="mb-4">
                  <PixelCharacter char={playerCharacter} />
                </div>
              </motion.div>
              <h3 className="text-sm font-bold text-foreground mb-2">
                {playerCharacter.username || 'You'}
              </h3>
              <div className="w-32 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>HP</span>
                  <span>{playerHP}/100</span>
                </div>
                <div className="w-full bg-border/30 rounded-full h-3 overflow-hidden border border-primary/30">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-green-500"
                    initial={{ width: '100%' }}
                    animate={{ width: `${playerHP}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>

            {/* VS */}
            <div className="text-center px-4">
              <div className="text-3xl font-black text-muted-foreground mb-2">VS</div>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-xs font-semibold text-accent"
              >
                ROUND {round}
              </motion.div>
            </div>

            {/* Enemy Side */}
            <motion.div
              className="flex flex-col items-center"
              animate={isAnimating ? 'hit' : 'idle'}
              variants={characterVariants}
            >
              <motion.div
                className="w-32 h-32 rounded-lg bg-gradient-to-br from-destructive/20 to-accent/20 border-2 border-destructive/50 flex items-center justify-center mb-4 relative overflow-hidden"
              >
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <span className="text-4xl">👹</span>
                </motion.div>
              </motion.div>
              <h3 className="text-sm font-bold text-destructive mb-2">{enemy.name}</h3>
              <div className="w-32 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>HP</span>
                  <span>{enemyHP}/100</span>
                </div>
                <div className="w-full bg-border/30 rounded-full h-3 overflow-hidden border border-destructive/30">
                  <motion.div
                    className="h-full bg-gradient-to-r from-destructive to-red-500"
                    initial={{ width: '100%' }}
                    animate={{ width: `${enemyHP}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Battle Log */}
          <div className="px-4 md:px-12 mb-4 max-h-20 overflow-y-auto bg-card/30 rounded-lg p-3 border border-border/20 backdrop-blur-sm">
            <div className="text-xs text-muted-foreground space-y-1">
              {battleLog.slice(-3).map((log, i) => (
                <motion.p key={i} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                  {log}
                </motion.p>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 md:px-12 pb-6 flex gap-3 justify-center">
            <motion.button
              onClick={handlePlayerAttack}
              disabled={isAnimating || playerHP <= 0 || enemyHP <= 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-destructive to-red-600 rounded-lg font-bold text-white flex items-center gap-2 hover:shadow-lg hover:shadow-destructive/50 transition-all disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              ATTACK
            </motion.button>

            <motion.button
              onClick={handleDefend}
              disabled={isAnimating || playerHP <= 0 || enemyHP <= 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-secondary to-blue-600 rounded-lg font-bold text-white flex items-center gap-2 hover:shadow-lg hover:shadow-secondary/50 transition-all disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              DEFEND
            </motion.button>

            <motion.button
              onClick={() => {
                /* Implement special ability */
              }}
              disabled={isAnimating || playerHP <= 0 || enemyHP <= 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-accent to-purple-600 rounded-lg font-bold text-white flex items-center gap-2 hover:shadow-lg hover:shadow-accent/50 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              SPECIAL
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Result Phase */}
      {battlePhase === 'result' && (
        <motion.div
          className="relative z-10 flex-1 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${
                playerWon
                  ? 'bg-primary/20'
                  : 'bg-destructive/20'
              }`}
            >
              {playerWon ? (
                <CheckCircle className="w-12 h-12 text-primary" />
              ) : (
                <XCircle className="w-12 h-12 text-destructive" />
              )}
            </motion.div>

            <h2 className={`text-4xl font-black mb-4 ${
              playerWon
                ? 'bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent'
                : 'text-destructive'
            }`}>
              {playerWon ? 'VICTORY!' : 'DEFEATED'}
            </h2>

            <div className="space-y-2 mb-8">
              {playerWon && (
                <>
                  <p className="text-lg text-foreground flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    +{xpGained} XP
                  </p>
                  <p className="text-lg text-foreground flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    {starsGained}/3 Stars
                  </p>
                </>
              )}
              {!playerWon && (
                <p className="text-muted-foreground">
                  Review the units and try again!
                </p>
              )}
            </div>

            <motion.button
              onClick={() => onBattleEnd(playerWon)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-primary to-accent rounded-lg font-bold text-white"
            >
              Continue
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BattleScreen;
