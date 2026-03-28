import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useLessonStore } from '@/stores/lessonStore';
import { LearningModule, Unit, PreQuiz as PreQuizType } from '@/types/lesson-system';
import PreQuiz from '../components/app/PreQuiz';
import BattleScreen from '../components/app/BattleScreen';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, Code, Brain, Zap, CheckCircle, ChevronRight, Send, MessageSquare, Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const ModuleDetail = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { currentModule, loadModule, startUnit, completePreQuiz } = useLessonStore();

  const [module, setModule] = useState<LearningModule | null>(null);
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [preQuiz, setPreQuiz] = useState<PreQuizType | null>(null);
  const [showPreQuiz, setShowPreQuiz] = useState(false);
  const [showBattle, setShowBattle] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userCharacter, setUserCharacter] = useState(null);

  // AI Features
  const [askQuestion, setAskQuestion] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load module and pre-quiz
  useEffect(() => {
    const loadModuleData = async () => {
      try {
        setLoading(true);

        const startRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/lesson-modules/${moduleId}/start`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!startRes.ok) throw new Error('Failed to start module');
        const startData = await startRes.json();

        setPreQuiz(startData.data.preQuiz);

        const userRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/me`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserCharacter(userData.data.character);
        }

        try {
          const preQuizRes = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/lesson-modules/${moduleId}/pre-quiz-submit`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ answers: {} })
            }
          );

          if (preQuizRes.ok) {
            const quizData = await preQuizRes.json();
            setModule(quizData.data.module);
            setCurrentUnit(quizData.data.firstUnit);
            setCurrentUnitIndex(0);
            setShowPreQuiz(false);
          }
        } catch (quizError) {
          console.error('Auto-submit pre-quiz failed:', quizError);
          setShowPreQuiz(true);
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to load module';
        toast.error(msg);
        console.error(msg);
      } finally {
        setLoading(false);
      }
    };

    loadModuleData();
  }, [moduleId]);

  const handlePreQuizComplete = async (answers: { [key: string]: string }, score: number) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/lesson-modules/${moduleId}/pre-quiz-submit`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ answers })
        }
      );

      if (!res.ok) throw new Error('Failed to submit pre-quiz');
      const data = await res.json();

      setModule(data.data.module);
      setCurrentUnit(data.data.firstUnit);
      setCurrentUnitIndex(0);
      setShowPreQuiz(false);
      completePreQuiz(data.data.knowledgeProfile);

      toast.success(`Pre-quiz score: ${Math.round(score)}%`);
    } catch (error) {
      toast.error('Failed to process pre-quiz results');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!currentUnit || Object.keys(quizAnswers).length === 0) {
      toast.error('Please answer all questions');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/lesson-modules/${moduleId}/unit/${currentUnit.unitId}/quiz-submit`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            answers: quizAnswers,
            timeTaken: 0
          })
        }
      );

      if (!res.ok) throw new Error('Failed to submit quiz');
      const data = await res.json();

      if (data.data.battleTime) {
        setShowBattle(true);
      } else if (data.data.nextUnit) {
        setCurrentUnit(data.data.nextUnit);
        setCurrentUnitIndex(currentUnitIndex + 1);
        setQuizAnswers({});
        setShowQuiz(false);
        toast.success(`+${data.data.xpEarned} XP`);
      }
    } catch (error) {
      toast.error('Failed to submit quiz');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBattleEnd = async (won: boolean) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/lesson-modules/${moduleId}/battle/result`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            unitId: currentUnit?.unitId,
            won,
            battleStats: { playerAccuracy: won ? 90 : 50, timeBonus: 0.8, finalScore: won ? 90 : 50 }
          })
        }
      );

      if (!res.ok) throw new Error('Failed to process battle');
      const data = await res.json();

      setShowBattle(false);

      if (won) {
        toast.success(`Battle won! +${data.data.xpEarned} XP`);
        if (data.data.nextUnit) {
          setCurrentUnit(data.data.nextUnit);
          setCurrentUnitIndex(currentUnitIndex + 1);
          setQuizAnswers({});
          setShowQuiz(false);
        } else if (data.data.moduleComplete) {
          toast.success('Module completed!');
          navigate('/lesson-modules');
        }
      } else {
        toast.info('Battle lost. Try again!');
      }
    } catch (error) {
      toast.error('Failed to process battle result');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) {
      toast.error('Please enter a question');
      return;
    }

    try {
      setLoading(true);
      const mockResponse = `Based on the content about "${currentUnit?.theory?.title || currentUnit?.title}", here's the answer to your question:\n\n${userQuestion}\n\nThis relates to the key concepts we discussed. For more details, please review the theory section.`;

      setTimeout(() => {
        setAiResponse(mockResponse);
        setUserQuestion('');
        setLoading(false);
        toast.success('AI Response received!');
      }, 1000);
    } catch (error) {
      toast.error('Failed to get AI response');
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!currentUnit) return;
    try {
      setSummarizing(true);

      // Get content from either theory.content or direct content field
      const content = currentUnit.theory?.content || (currentUnit as any).content || '';
      const title = currentUnit.theory?.title || currentUnit.title || 'Unit';
      const keyPoints = currentUnit.theory?.keyPoints || [];

      const keyPointsText = keyPoints.length > 0
        ? keyPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')
        : 'Key points not available';

      const mockSummary = `## 📚 ${title} — Xülasə\n\n**Əsas məqamlar:**\n${keyPointsText}\n\n**Mövzu haqqında:**\n${content.substring(0, 300).replace(/[#*`]/g, '')}...`;

      setTimeout(() => {
        setSummary(mockSummary);
        setShowSummary(true);
        setSummarizing(false);
        toast.success('Summary generated!');
      }, 1500);
    } catch (error) {
      toast.error('Failed to generate summary');
      setSummarizing(false);
    }
  };

  // Reusable markdown components config
  const markdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-black text-foreground mt-6 mb-3 first:mt-0">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-bold text-foreground mt-5 mb-2 pb-1 border-b border-border/30">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-base font-semibold text-foreground mt-3 mb-1">{children}</h4>
    ),
    p: ({ children }: any) => (
      <p className="text-muted-foreground leading-relaxed mb-3">{children}</p>
    ),
    strong: ({ children }: any) => (
      <strong className="text-foreground font-bold">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="text-primary/80 italic">{children}</em>
    ),
    ul: ({ children }: any) => (
      <ul className="space-y-1 mb-3 text-muted-foreground pl-5 list-disc">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="space-y-1 mb-3 text-muted-foreground pl-5 list-decimal">{children}</ol>
    ),
    li: ({ children }: any) => (
      <li className="text-muted-foreground leading-relaxed">{children}</li>
    ),
    code: ({ inline, children }: any) =>
      inline ? (
        <code className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-sm font-mono border border-primary/20">
          {children}
        </code>
      ) : (
        <code className="block bg-background/80 border border-border/40 rounded-lg p-4 font-mono text-sm text-primary overflow-x-auto whitespace-pre">
          {children}
        </code>
      ),
    pre: ({ children }: any) => (
      <pre className="bg-background/80 border border-border/40 rounded-lg overflow-x-auto mb-4 not-prose">
        {children}
      </pre>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-3 bg-primary/5 py-2 rounded-r-lg">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="border-border/30 my-5" />,
    a: ({ href, children }: any) => (
      <a href={href} className="text-primary hover:underline underline-offset-2" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className="border border-border/40 px-3 py-2 bg-primary/10 text-foreground font-semibold text-left">{children}</th>
    ),
    td: ({ children }: any) => (
      <td className="border border-border/40 px-3 py-2 text-muted-foreground">{children}</td>
    ),
  };

  if (loading && !module) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent"
        />
      </div>
    );
  }

  if (showPreQuiz && preQuiz) {
    return <PreQuiz quiz={preQuiz} moduleId={moduleId!} onComplete={handlePreQuizComplete} isLoading={loading} />;
  }

  if (showBattle && currentUnit && userCharacter) {
    return (
      <BattleScreen
        moduleId={moduleId!}
        unitId={currentUnit.unitId}
        unitName={currentUnit.title}
        moduleTitle={module?.title || 'Module'}
        playerCharacter={userCharacter}
        onBattleEnd={handleBattleEnd}
        isLoading={loading}
      />
    );
  }

  // Get content — supports both theory.content and direct content field from backend
  const unitContent: string =
    currentUnit?.theory?.content ||
    (currentUnit as any)?.content ||
    '';

  const unitTitle: string =
    currentUnit?.theory?.title ||
    currentUnit?.title ||
    '';

  const unitKeyPoints: string[] =
    currentUnit?.theory?.keyPoints ||
    [];

  const unitCodeExamples: string[] =
    currentUnit?.theory?.codeExamples ||
    [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80 pt-20 pb-12">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            {/* Header */}
            <motion.div
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={() => navigate('/lesson-modules')}
                  whileHover={{ x: -4 }}
                  className="p-2 hover:bg-card/50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-muted-foreground" />
                </motion.button>
                <div>
                  <h1 className="text-3xl font-black text-foreground">{module?.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Unit {currentUnitIndex + 1} of {module?.totalUnits || 0}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Progress Bar */}
            {module && (
              <div className="mb-8">
                <div className="w-full bg-border/30 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentUnitIndex + 1) / (module.totalUnits || 1)) * 100}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            )}

            {/* AI Feature Buttons */}
            {currentUnit && !showQuiz && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSummarize}
                  disabled={summarizing}
                  className="px-4 py-3 bg-gradient-to-r from-primary/80 to-primary rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50"
                >
                  {summarizing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Summarize this unit
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowQuiz(true)}
                  className="px-4 py-3 bg-gradient-to-r from-secondary/80 to-secondary rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-secondary/50 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  Take Quiz
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAskQuestion(!askQuestion)}
                  className="px-4 py-3 bg-gradient-to-r from-accent/80 to-accent rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-accent/50 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Have any doubt?
                </motion.button>
              </motion.div>
            )}

            {/* Main Content Area */}
            {currentUnit && (
              <div className="space-y-6">
                {/* AI Summary */}
                {showSummary && (
                  <motion.div
                    className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 rounded-xl p-6 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        AI Summary
                      </h3>
                      <motion.button
                        onClick={() => setShowSummary(false)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </motion.button>
                    </div>
                    <div className="text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {summary}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                )}

                {/* AI Question Section */}
                {askQuestion && (
                  <motion.div
                    className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/30 rounded-xl p-6 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-accent" />
                      Ask AI about this content
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        placeholder="Type your question..."
                        onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                        className="flex-1 px-4 py-2 bg-background border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAskQuestion}
                        disabled={loading || !userQuestion.trim()}
                        className="px-4 py-2 bg-primary rounded-lg text-white font-semibold hover:bg-primary/80 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                    </div>
                    {aiResponse && (
                      <motion.div
                        className="mt-4 p-4 bg-background/50 rounded-lg border border-border/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {aiResponse}
                        </ReactMarkdown>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Theory / Lesson Content */}
                {!showQuiz && (
                  <motion.div
                    className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl p-6 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{unitTitle}</h2>
                        <p className="text-sm text-muted-foreground">Read and understand before taking the quiz</p>
                      </div>
                    </div>

                    {/* Markdown Content */}
                    <div className="mb-6">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {unitContent}
                      </ReactMarkdown>
                    </div>

                    {/* Key Takeaways — only show if explicitly provided separate from content */}
                    {unitKeyPoints.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                          <Brain className="w-5 h-5 text-accent" />
                          Key Takeaways
                        </h3>
                        <div className="space-y-2">
                          {unitKeyPoints.map((point: string, i: number) => (
                            <motion.div
                              key={i}
                              className="p-3 bg-border/20 rounded-lg text-sm text-foreground flex items-start gap-3"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{point}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Code Examples — only show if explicitly provided separate from content */}
                    {unitCodeExamples.length > 0 && (
                      <div>
                        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                          <Code className="w-5 h-5 text-primary" />
                          Code Examples
                        </h3>
                        <div className="bg-background/50 border border-border/30 rounded-lg p-4 font-mono text-sm text-primary overflow-x-auto whitespace-pre">
                          {unitCodeExamples[0]}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Quiz Section */}
                {showQuiz && (
                  <motion.div
                    className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl p-6 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Zap className="w-6 h-6 text-primary" />
                      Unit Quiz - Practice Your Knowledge
                    </h2>

                    <div className="space-y-6">
                      {currentUnit.quiz.questions.map((q: any, idx: number) => (
                        <motion.div
                          key={q.id || q._id}
                          className="p-4 bg-border/20 rounded-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <p className="font-bold mb-4 text-foreground">
                            {idx + 1}. {q.question}
                          </p>
                          <div className="space-y-2">
                            {q.options?.map((opt: string) => (
                              <label
                                key={opt}
                                className="flex items-center p-3 bg-background/50 rounded-lg cursor-pointer hover:bg-border/30 transition-colors border border-border/30"
                              >
                                <input
                                  type="radio"
                                  name={q.id || q._id}
                                  value={opt}
                                  checked={quizAnswers[q.id || q._id] === opt}
                                  onChange={(e) =>
                                    setQuizAnswers({ ...quizAnswers, [q.id || q._id]: e.target.value })
                                  }
                                  className="mr-3 w-4 h-4"
                                />
                                <span className="text-muted-foreground">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <motion.button
                      onClick={handleQuizSubmit}
                      disabled={
                        Object.keys(quizAnswers).length < currentUnit.quiz.questions.length || loading
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-8 w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary rounded-lg font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg hover:shadow-primary/50 transition-all"
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Submit Answer
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <motion.div
          className={`${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden border-l border-border/30 bg-card/50 backdrop-blur-sm transition-all duration-300`}
          initial={{ x: 300 }}
          animate={{ x: 0 }}
        >
          {sidebarOpen && (
            <div className="p-6 h-full overflow-y-auto">
              <h3 className="text-lg font-bold text-foreground mb-6">What You Will Learn</h3>

              <div className="space-y-3">
                {module?.units?.map((unit: any, idx: number) => (
                  <motion.button
                    key={unit.unitId}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      setCurrentUnitIndex(idx);
                      setCurrentUnit(unit);
                      setShowQuiz(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      currentUnitIndex === idx
                        ? 'bg-primary/20 border border-primary/50 text-primary'
                        : 'bg-border/10 border border-border/30 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                          currentUnitIndex === idx
                            ? 'bg-primary text-background'
                            : 'bg-border text-muted-foreground'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{unit.title}</p>
                        <p className="text-xs mt-1 opacity-70">Difficulty: {unit.difficulty}/10</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-8 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                <p className="text-xs text-muted-foreground mb-2">Module Info</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Units:</span>
                    <span className="font-semibold text-foreground">{module?.totalUnits}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Time:</span>
                    <span className="font-semibold text-foreground">{module?.estimatedTime} min</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-primary/20">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      XP Available
                    </span>
                    <span className="font-bold text-primary">+{(module?.totalUnits || 1) * 250}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Toggle Sidebar Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed right-4 bottom-4 p-3 bg-primary rounded-lg text-white shadow-lg hover:shadow-primary/50 z-40"
        >
          <ChevronRight className={`w-5 h-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>
    </div>
  );
};

export default ModuleDetail;