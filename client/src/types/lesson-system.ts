/**
 * HeroCode Gamified Learning System - TypeScript Types & Interfaces
 * Web3/Awwwards aesthetic gaming + adaptive learning
 */

// ============= QUIZ & CONTENT TYPES =============

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'code-complete' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: number; // 1-10 scale
  topic?: string;
}

export interface Quiz {
  questions: QuizQuestion[];
  passingScore: number; // 0-100
  timeLimit: number; // in seconds
}

export interface TheoryContent {
  title: string;
  content: string; // Main theory explanation
  keyPoints: string[];
  codeExamples: string[];
  analogies: string;
}

export interface InteractiveElement {
  type: 'visualization' | 'code-sandbox' | 'interactive-quiz' | 'story' | 'diagram';
  description: string;
  data?: Record<string, any>;
}

export interface Unit {
  unitId: number;
  title: string;
  difficulty: number; // 1-10
  narrative: string; // Story element
  theory: TheoryContent;
  interactiveContent: InteractiveElement;
  quiz: Quiz;
}

export interface BattleInfo {
  enemyName: string;
  enemyDescription: string;
  enemyVisualType: 'code-monster' | 'pixel-boss' | 'cyber-entity' | 'data-dragon';
  winConditions: {
    minAccuracy: number; // percentage
    minTimeBonus: number; // 0-1 scale
    starsPerLevel: number; // usually 3
  };
}

export interface AdaptationRules {
  increaseDifficultyIf: string;
  decreaseDifficultyIf: string;
  skipTopicIf: string;
  emphasizeIf: string;
}

export interface LearningModule {
  moduleId: string;
  title: string;
  description: string;
  topic: string; // e.g., 'javascript', 'react', 'unity'
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  totalUnits: number;
  estimatedTime: number; // in minutes
  units: Unit[];
  battleInfo: BattleInfo;
  adaptationRules: AdaptationRules;
  createdAt: Date;
  version: number;
}

// ============= QUIZ & ASSESSMENT TYPES =============

export interface PreQuizQuestion extends QuizQuestion {
  reasoning: string; // Why this tests their knowledge
}

export interface PreQuiz {
  quizId: string;
  title: string;
  description: string;
  questions: PreQuizQuestion[];
  passingScore: number;
  timeLimit: number;
}

export interface QuizSubmission {
  quizId: string;
  answers: { [questionId: string]: string };
  score: number;
  timeTaken: number;
  submittedAt: Date;
}

// ============= KNOWLEDGE PROFILE TYPES =============

export interface LearningStylePreference {
  style: 'visual' | 'textual' | 'interactive';
  confidence: number; // 0-1
}

export interface PacePreference {
  pace: 'slow' | 'medium' | 'fast';
  reason?: string;
}

export interface AdaptationData {
  preferredPace: PacePreference;
  learningStyle: LearningStylePreference;
  difficultyMultiplier: number;
  mistakesCount: number;
  topicsConfidence: { [topic: string]: number };
}

export interface KnowledgeProfile {
  moduleId: string;
  knownTopics: string[];
  weakTopics: string[];
  lastQuizScore: number;
  quizAttempts: number;
  totalTimeSpent: number;
  adaptationData: AdaptationData;
  lastUpdated: Date;
}

// ============= PROGRESS TRACKING TYPES =============

export interface UnitProgress {
  unitId: number;
  completed: boolean;
  score: number; // quiz score
  timeTaken: number; // seconds
  attempts: number;
  starsEarned: number; // 0-3
  xpEarned: number;
  completedAt?: Date;
}

export interface ModuleProgress {
  moduleId: string;
  currentUnit: number;
  unitsCompleted: UnitProgress[];
  totalXP: number;
  starsEarned: number; // total across all units
  averageScore: number;
  totalTimeSpent: number;
  isCompleted: boolean;
  completedAt?: Date;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

// ============= BATTLE SYSTEM TYPES =============

export interface BattleStats {
  health: number;
  maxHealth: number;
  experience: number;
  level: number;
  attackPower: number;
  defensePower: number;
}

export interface PlayerBattle extends BattleStats {
  character: {
    name: string;
    appearance: Record<string, string>;
    emotion: string;
  };
  inventory: string[];
}

export interface EnemyBattle extends BattleStats {
  name: string;
  visualType: string;
  statusEffects: string[];
}

export interface BattleAction {
  type: 'attack' | 'defend' | 'special' | 'item';
  power: number;
  description: string;
  animationDuration: number; // ms
}

export interface BattleResult {
  won: boolean;
  playerDamage: number;
  enemyDamage: number;
  xpEarned: number;
  starsEarned: number; // 0-3
  battleDuration: number;
  playerFinalHealth: number;
}

// ============= GAMIFICATION TYPES =============

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  requirement: {
    type: string;
    value: number;
  };
}

export interface LevelReward {
  level: number;
  xpRequired: number;
  unlocks: {
    modules?: string[];
    achievements?: string[];
    cosmetics?: string[];
  };
}

export interface PlayerStats {
  totalXP: number;
  level: number;
  modulesCompleted: number;
  totalUnitsCompleted: number;
  averageScore: number;
  longestStreak: number; // daily active days
  achievements: Achievement[];
  badges: string[];
}

// ============= API REQUEST/RESPONSE TYPES =============

export interface GetModulesResponse {
  success: boolean;
  data: {
    availableModules: ModuleCard[];
    unlockedModules: string[];
    lockedModules: ModuleCard[];
  };
}

export interface ModuleCard {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: number;
  isLocked: boolean;
  progress?: number; // 0-100
  userStats?: {
    bestScore: number;
    attempts: number;
    timeSpent: number;
  };
  thumbnail?: string;
}

export interface StartModuleRequest {
  moduleId: string;
}

export interface StartModuleResponse {
  success: boolean;
  data: {
    preQuiz: PreQuiz;
    sessionId: string;
  };
}

export interface SubmitQuizResponse {
  success: boolean;
  data: {
    score: number;
    passed: boolean;
    nextUnit?: Unit;
    xpEarned: number;
    starsEarned: number;
    detailedFeedback: {
      correctAnswers: number;
      totalQuestions: number;
      incorrectTopics: string[];
    };
  };
}

export interface BattleResultRequest {
  moduleId: string;
  unitId: number;
  won: boolean;
  battleStats: {
    playerAccuracy: number;
    timeBonus: number;
    finalScore: number;
  };
}

export interface BattleResultResponse {
  success: boolean;
  data: {
    xpEarned: number;
    starsEarned: number; // 0-3
    levelUp?: {
      newLevel: number;
      rewards: string[];
    };
    nextUnit?: Unit;
    moduleComplete?: boolean;
  };
}

// ============= UI/FRONTEND STATE TYPES =============

export interface LessonState {
  currentModule: LearningModule | null;
  currentUnit: Unit | null;
  currentUnitIndex: number;
  preQuizComplete: boolean;
  knowledgeProfile: KnowledgeProfile | null;
  moduleProgress: ModuleProgress | null;
  sessionId?: string;
  isLoading: boolean;
  error?: string;
}

export interface BattleState {
  active: boolean;
  player?: PlayerBattle;
  enemy?: EnemyBattle;
  battleLog: string[];
  currentRound: number;
  isPlayerTurn: boolean;
  battleResult?: BattleResult;
  isAnimating: boolean;
}

export interface GamificationState {
  playerStats: PlayerStats;
  achievements: Achievement[];
  levelProgress: number; // 0-1
  nextLevelXP: number;
  unlockedModules: string[];
}

// ============= NOTIFICATION TYPES =============

export interface LessonNotification {
  type: 'achievement' | 'level-up' | 'skill-discovered' | 'module-unlocked';
  title: string;
  message: string;
  icon?: string;
  duration: number;
  action?: () => void;
}
