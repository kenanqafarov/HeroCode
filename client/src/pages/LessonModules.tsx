import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronRight, X } from 'lucide-react';
import OnboardingModal from '../components/OnboardingModal';
import { MarkdownRenderer, getMarkdownPreview } from '../components/MarkdownRenderer';

interface Module {
  _id: string;
  title: string;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  content: string;
  tags: string[];
  createdAt: string;
}

interface LearnedLanguage {
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface UserProfile {
  _id: string;
  email: string;
  learnedLanguages: LearnedLanguage[];
  xp: number;
  level: number;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'https://herocodebackend-ym9g.onrender.com/api';

const LessonModules = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showContentPreview, setShowContentPreview] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE}/users/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
          
          // Check if user needs onboarding
          if (!data.data.learnedLanguages || data.data.learnedLanguages.length === 0) {
            setShowOnboarding(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    fetchUser();
  }, []);

  // Fetch modules
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        let url = `${API_BASE}/modules`;
        if (selectedLanguage) {
          url += `?language=${selectedLanguage}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch modules');
        const data = await response.json();

        if (data.success) {
          setModules(data.data);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load modules';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    if (!showOnboarding) {
      fetchModules();
    }
  }, [showOnboarding, selectedLanguage]);

  const handleOnboardingComplete = async (languages: LearnedLanguage[]) => {
    try {
      const response = await fetch(`${API_BASE}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ learnedLanguages: languages })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        setShowOnboarding(false);
        toast.success('Great! Your learning preferences have been saved.');
      }
    } catch (err) {
      toast.error('Failed to save preferences');
    }
  };

  const handleStartModule = (moduleId: string) => {
    navigate(`/lesson-modules/${moduleId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    hover: { y: -8, transition: { duration: 0.3 } }
  };

  // Get unique languages from user's learned languages
  const availableLanguages = user?.learnedLanguages.map(l => l.language) || [];

  return (
    <>
      <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80 pt-20 pb-12">
        {/* Hero Section */}
        <motion.div
          className="px-4 xl:px-24 mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Learning Modules
            </h1>
            <p className="text-gray-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
              Master programming languages with our structured learning paths. Choose a language and start your journey.
            </p>
          </div>

          {/* User Stats */}
          {user && (
            <motion.div
              className="bg-card border border-border/50 rounded-xl p-6 backdrop-blur-sm hover:border-blue-500/50 transition-colors max-w-2xl mx-auto mb-12"
              whileHover={{ borderColor: 'rgb(59, 130, 246)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-blue-500">Level {user.level}</div>
                  <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                    {user.xp} Total XP
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user.learnedLanguages.length} Languages
                  </div>
                  <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                    Learning: {user.learnedLanguages.map(l => l.language).join(', ')}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Language Filter */}
          {availableLanguages.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              <motion.button
                onClick={() => setSelectedLanguage(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedLanguage === null
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                All Languages
              </motion.button>
              {availableLanguages.map(language => (
                <motion.button
                  key={language}
                  onClick={() => setSelectedLanguage(language)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedLanguage === language
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {language}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Modules Grid */}
        {showOnboarding ? (
          <div className="text-center text-gray-600 dark:text-slate-400 py-12">
            <p>Complete the onboarding to see modules.</p>
          </div>
        ) : (
          <motion.div
            className="px-4 xl:px-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-card border border-border/30 rounded-xl p-6 h-64 animate-pulse"
                  />
                ))}
              </div>
            ) : modules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module, idx) => (
                  <motion.div
                    key={module._id}
                    variants={cardVariants}
                    onClick={() => handleStartModule(module._id)}
                    className="cursor-pointer group"
                  >
                    {/* Glowing background */}
                    <div
                      className={`absolute inset-0 rounded-xl blur-2xl transition-all duration-300 ${
                        idx % 2 === 0
                          ? 'bg-blue-500/10 group-hover:bg-blue-500/20'
                          : 'bg-purple-500/10 group-hover:bg-purple-500/20'
                      }`}
                    />

                    {/* Card */}
                    <motion.div
                      className="relative bg-gradient-to-br from-white dark:from-slate-800 to-gray-50 dark:to-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 h-full backdrop-blur-sm group-hover:border-blue-500/50 dark:group-hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between"
                      whileHover={{ y: -8 }}
                    >
                      {/* Header */}
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                              {module.title}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">
                              {module.description}
                            </p>
                          </div>
                        </div>

                        {/* Content Preview */}
                        {module.content && (
                          <div className="mt-3 p-3 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-xs text-gray-700 dark:text-slate-300 line-clamp-3">
                              {getMarkdownPreview(module.content, 120)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="space-y-3 border-t border-gray-200 dark:border-slate-700 pt-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-md capitalize text-gray-900 dark:text-white">
                            {module.difficulty}
                          </span>
                          <span className="text-gray-600 dark:text-slate-400">
                            {module.language}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedModule(module);
                              setShowContentPreview(true);
                            }}
                            className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg font-semibold transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            📖 Preview
                          </motion.button>

                          <motion.button
                            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                            onClick={() => handleStartModule(module._id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Start <ChevronRight className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-slate-400 mb-4">
                  No modules found for the selected filters.
                </p>
                <motion.button
                  onClick={() => setSelectedLanguage(null)}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All Modules
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Content Preview Modal */}
      <AnimatePresence>
        {showContentPreview && selectedModule && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowContentPreview(false)}
          >
            <motion.div
              className="bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedModule.title}</h2>
                  <div className="flex gap-3">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                      {selectedModule.language}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm capitalize">
                      {selectedModule.difficulty}
                    </span>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowContentPreview(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6 text-gray-400" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6">
                <MarkdownRenderer
                  content={selectedModule.content}
                  className="bg-slate-800/50 p-6 rounded-lg"
                />
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6 flex gap-3">
                <motion.button
                  onClick={() => setShowContentPreview(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
                <motion.button
                  onClick={() => {
                    setShowContentPreview(false);
                    handleStartModule(selectedModule._id);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Learning <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LessonModules;
