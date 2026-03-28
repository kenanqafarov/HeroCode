import { create } from 'zustand';
import {
  LessonState,
  BattleState,
  GamificationState,
  LearningModule,
  Unit,
  PreQuiz,
  KnowledgeProfile,
  ModuleProgress,
  PlayerStats
} from '@/types/lesson-system';

/**
 * Lesson Learning State Store (Zustand)
 * Manages the entire lesson/module progression and gamification
 */
interface LessonStore extends LessonState {
  // Lesson Controls
  loadModule: (module: LearningModule) => void;
  startUnit: (unit: Unit, index: number) => void;
  completePreQuiz: (profile: KnowledgeProfile) => void;
  nextUnit: () => void;
  repeatUnit: () => void;
  
  // Updates
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  setProgress: (progress: ModuleProgress) => void;
  setKnowledgeProfile: (profile: KnowledgeProfile) => void;
}

export const useLessonStore = create<LessonStore>((set, get) => ({
  // Initial state
  currentModule: null,
  currentUnit: null,
  currentUnitIndex: 0,
  preQuizComplete: false,
  knowledgeProfile: null,
  moduleProgress: null,
  isLoading: false,
  error: undefined,

  // Actions
  loadModule: (module) =>
    set({
      currentModule: module,
      currentUnitIndex: 0,
      currentUnit: null,
      preQuizComplete: false,
      isLoading: false
    }),

  startUnit: (unit, index) =>
    set({
      currentUnit: unit,
      currentUnitIndex: index
    }),

  completePreQuiz: (profile) =>
    set({
      preQuizComplete: true,
      knowledgeProfile: profile
    }),

  nextUnit: () => {
    const { currentModule, currentUnitIndex } = get();
    if (!currentModule || currentUnitIndex + 1 >= currentModule.units.length) return;
    set({
      currentUnitIndex: currentUnitIndex + 1,
      currentUnit: currentModule.units[currentUnitIndex + 1]
    });
  },

  repeatUnit: () => {
    const { currentModule, currentUnitIndex } = get();
    if (!currentModule) return;
    set({
      currentUnit: currentModule.units[currentUnitIndex]
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setProgress: (progress) => set({ moduleProgress: progress }),
  setKnowledgeProfile: (profile) => set({ knowledgeProfile: profile })
}));

/**
 * Battle State Store
 * Manages all battle mechanics and animations
 */
interface BattleStore extends BattleState {
  // Battle Control
  initiateBattle: (enemy: any, player: any) => void;
  playerAttack: (damage: number) => void;
  enemyAttack: (damage: number) => void;
  endBattle: (won: boolean) => void;
  resetBattle: () => void;

  // UI Updates
  setAnimating: (animating: boolean) => void;
  addBattleLog: (message: string) => void;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  // Initial state
  active: false,
  player: undefined,
  enemy: undefined,
  battleLog: [],
  currentRound: 0,
  isPlayerTurn: true,
  battleResult: undefined,
  isAnimating: false,

  // Actions
  initiateBattle: (enemy, player) =>
    set({
      active: true,
      enemy,
      player,
      battleLog: [`Battle started: ${player.character.name} vs ${enemy.name}!`],
      currentRound: 1,
      isPlayerTurn: true,
      isAnimating: false
    }),

  playerAttack: (damage) => {
    const { enemy, battleLog } = get();
    if (!enemy) return;

    const newHealth = Math.max(0, enemy.health - damage);
    set({
      enemy: { ...enemy, health: newHealth },
      battleLog: [...battleLog, `You dealt ${damage} damage!`],
      isPlayerTurn: false,
      isAnimating: true
    });
  },

  enemyAttack: (damage) => {
    const { player, battleLog } = get();
    if (!player) return;

    const newHealth = Math.max(0, player.health - damage);
    set({
      player: { ...player, health: newHealth },
      battleLog: [...battleLog, `Enemy dealt ${damage} damage!`],
      isPlayerTurn: true,
      isAnimating: false
    });
  },

  endBattle: (won) =>
    set({
      active: false,
      battleResult: {
        won,
        playerDamage: 0,
        enemyDamage: 0,
        xpEarned: won ? 500 : 0,
        starsEarned: won ? 3 : 0,
        battleDuration: 0,
        playerFinalHealth: get().player?.health || 0
      }
    }),

  resetBattle: () =>
    set({
      active: false,
      player: undefined,
      enemy: undefined,
      battleLog: [],
      currentRound: 0,
      isPlayerTurn: true,
      battleResult: undefined,
      isAnimating: false
    }),

  setAnimating: (animating) => set({ isAnimating: animating }),

  addBattleLog: (message) => {
    const { battleLog } = get();
    set({ battleLog: [...battleLog, message] });
  }
}));

/**
 * Gamification State Store
 * Tracks XP, levels, achievements, and unlocked content
 */
interface GamificationStore extends GamificationState {
  // XP & Level
  addXP: (amount: number) => void;
  levelUp: () => void;
  
  // Achievements
  unlockAchievement: (achievementId: string) => void;
  
  // Modules
  unlockModule: (moduleId: string) => void;
  
  // Initialization
  loadPlayerStats: (stats: PlayerStats) => void;
}

export const useGamificationStore = create<GamificationStore>((set, get) => ({
  // Initial state
  playerStats: {
    totalXP: 0,
    level: 1,
    modulesCompleted: 0,
    totalUnitsCompleted: 0,
    averageScore: 0,
    longestStreak: 0,
    achievements: [],
    badges: []
  },
  achievements: [],
  levelProgress: 0,
  nextLevelXP: 1000,
  unlockedModules: ['javascript-basics', 'web-development'],

  // Actions
  addXP: (amount) => {
    const { playerStats, nextLevelXP } = get();
    const newXP = playerStats.totalXP + amount;
    const newLevel = Math.floor(newXP / nextLevelXP) + 1;
    const levelProgress = (newXP % nextLevelXP) / nextLevelXP;

    set({
      playerStats: {
        ...playerStats,
        totalXP: newXP,
        level: newLevel
      },
      levelProgress
    });
  },

  levelUp: () => {
    const { playerStats } = get();
    set({
      playerStats: {
        ...playerStats,
        level: playerStats.level + 1
      },
      nextLevelXP: (playerStats.level + 1) * 1000
    });
  },

  unlockAchievement: (achievementId) => {
    const { achievements } = get();
    if (!achievements.find(a => a.id === achievementId)) {
      set({
        achievements: [
          ...achievements,
          {
            id: achievementId,
            name: `Achievement #${achievementId}`,
            description: 'Earned for completing a challenge',
            icon: '🏆',
            rarity: 'common',
            unlockedAt: new Date(),
            requirement: { type: 'completion', value: 1 }
          }
        ]
      });
    }
  },

  unlockModule: (moduleId) => {
    const { unlockedModules } = get();
    if (!unlockedModules.includes(moduleId)) {
      set({
        unlockedModules: [...unlockedModules, moduleId]
      });
    }
  },

  loadPlayerStats: (stats) =>
    set({
      playerStats: stats,
      levelProgress: (stats.totalXP % 1000) / 1000,
      unlockedModules: stats.achievements.length > 0 ? ['javascript-basics', 'react-basics'] : ['javascript-basics']
    })
}));

/**
 * Combined Hook: Use all lesson stores together
 */
export const useLessonSystems = () => ({
  lesson: useLessonStore(),
  battle: useBattleStore(),
  gamification: useGamificationStore()
});
