import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export interface LearnedLanguage {
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (languages: LearnedLanguage[]) => void;
}

const AVAILABLE_LANGUAGES = [
  'JavaScript',
  'Python',
  'Rust',
  'Go',
  'TypeScript',
  'Java',
  'C++',
  'C#',
  'Ruby',
  'PHP',
];

const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

const OnboardingModal = ({ isOpen, onComplete }: OnboardingModalProps) => {
  const [step, setStep] = useState<'select-languages' | 'select-levels'>('select-languages');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [languageLevels, setLanguageLevels] = useState<Record<string, 'beginner' | 'intermediate' | 'advanced'>>({});
  const [currentLevelLanguage, setCurrentLevelLanguage] = useState(0);

  const handleSelectLanguage = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== language));
      const newLevels = { ...languageLevels };
      delete newLevels[language];
      setLanguageLevels(newLevels);
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
      setLanguageLevels({ ...languageLevels, [language]: 'beginner' });
    }
  };

  const handleSetLevel = (language: string, level: 'beginner' | 'intermediate' | 'advanced') => {
    setLanguageLevels({ ...languageLevels, [language]: level });
  };

  const handleContinue = () => {
    if (selectedLanguages.length === 0) return;
    
    if (step === 'select-languages') {
      setStep('select-levels');
      setCurrentLevelLanguage(0);
    } else {
      // Complete onboarding
      const learnedLanguages = selectedLanguages.map(language => ({
        language,
        level: languageLevels[language] || 'beginner'
      }));
      onComplete(learnedLanguages);
    }
  };

  const handleBack = () => {
    if (step === 'select-levels') {
      setStep('select-languages');
    }
  };

  const handleNextLanguageLevel = () => {
    if (currentLevelLanguage < selectedLanguages.length - 1) {
      setCurrentLevelLanguage(currentLevelLanguage + 1);
    }
  };

  const handlePrevLanguageLevel = () => {
    if (currentLevelLanguage > 0) {
      setCurrentLevelLanguage(currentLevelLanguage - 1);
    }
  };

  if (!isOpen) return null;

  const currentLanguage = selectedLanguages[currentLevelLanguage];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {step === 'select-languages' ? (
            <motion.div
              key="languages"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Which languages do you want to learn?
              </h2>
              <p className="text-gray-600 dark:text-slate-400 mb-8">
                Select one or more programming languages to get started.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {AVAILABLE_LANGUAGES.map(language => (
                  <motion.button
                    key={language}
                    onClick={() => handleSelectLanguage(language)}
                    className={`p-4 rounded-xl font-semibold transition-all ${
                      selectedLanguages.includes(language)
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {language}
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-4">
                <motion.button
                  onClick={handleContinue}
                  disabled={selectedLanguages.length === 0}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    selectedLanguages.length === 0
                      ? 'bg-gray-300 dark:bg-slate-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  whileHover={{ scale: selectedLanguages.length > 0 ? 1.05 : 1 }}
                  whileTap={{ scale: selectedLanguages.length > 0 ? 0.95 : 1 }}
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="levels"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                What is your level in {currentLanguage}?
              </h2>
              <p className="text-gray-600 dark:text-slate-400 mb-8">
                Select your proficiency level. You can update this later.{' '}
                <span className="font-semibold">
                  ({currentLevelLanguage + 1} of {selectedLanguages.length})
                </span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {SKILL_LEVELS.map(level => (
                  <motion.button
                    key={level}
                    onClick={() => handleSetLevel(currentLanguage, level)}
                    className={`p-6 rounded-xl font-semibold transition-all text-center capitalize ${
                      languageLevels[currentLanguage] === level
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-lg mb-1">{level === 'beginner' ? '🌱' : level === 'intermediate' ? '⚡' : '🔥'}</div>
                    {level}
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-4">
                <motion.button
                  onClick={handlePrevLanguageLevel}
                  disabled={currentLevelLanguage === 0}
                  className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                    currentLevelLanguage === 0
                      ? 'bg-gray-300 dark:bg-slate-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-700'
                  }`}
                  whileHover={{ scale: currentLevelLanguage > 0 ? 1.05 : 1 }}
                  whileTap={{ scale: currentLevelLanguage > 0 ? 0.95 : 1 }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>

                <motion.button
                  onClick={handleNextLanguageLevel}
                  disabled={currentLevelLanguage === selectedLanguages.length - 1}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    currentLevelLanguage === selectedLanguages.length - 1
                      ? 'bg-gray-300 dark:bg-slate-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-700'
                  }`}
                  whileHover={{ scale: currentLevelLanguage < selectedLanguages.length - 1 ? 1.05 : 1 }}
                  whileTap={{ scale: currentLevelLanguage < selectedLanguages.length - 1 ? 0.95 : 1 }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  onClick={handleContinue}
                  className="flex-1 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Learning <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default OnboardingModal;
