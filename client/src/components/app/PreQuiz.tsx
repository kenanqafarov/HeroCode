import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PreQuiz as PreQuizType, QuizQuestion } from '@/types/lesson-system';
import { toast } from 'sonner';
import { ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface PreQuizProps {
  quiz: PreQuizType;
  moduleId: string;
  onComplete: (answers: { [key: string]: string }, score: number) => void;
  isLoading?: boolean;
}

const PreQuiz = ({ quiz, moduleId, onComplete, isLoading }: PreQuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitting || isLoading) return;

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isSubmitting, isLoading]);

  // Auto-submit if time runs out
  useEffect(() => {
    if (timeLeft === 0 && Object.keys(answers).length > 0) {
      handleSubmitQuiz();
    }
  }, [timeLeft]);

  const handleSelectOption = (option: string) => {
    if (showFeedback || isSubmitting) return;
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (!selectedOption) {
      toast.error('Please select an answer');
      return;
    }

    // Store answer
    const newAnswers = { ...answers, [currentQuestion.id]: selectedOption };
    setAnswers(newAnswers);

    // Show feedback
    setShowFeedback(true);

    // Move to next question after delay
    setTimeout(() => {
      if (isLastQuestion) {
        handleSubmitQuiz();
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setShowFeedback(false);
      }
    }, 2000);
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(answers).length === 0) return;

    setIsSubmitting(true);
    try {
      // Calculate final score
      let score = 0;
      quiz.questions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) {
          score += 100 / quiz.questions.length;
        }
      });

      onComplete(answers, Math.round(score));
    } catch (error) {
      toast.error('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCorrect = answers[currentQuestion.id] === currentQuestion.correctAnswer;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-background via-background/95 to-background/80 z-50 flex flex-col">
      {/* Header */}
      <motion.div
        className="border-b border-border/30 backdrop-blur-sm sticky top-0 z-10"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {quiz.title}
            </h2>
            <p className="text-sm text-muted-foreground">{quiz.description}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className={timeLeft < 60 ? 'text-destructive font-semibold' : ''}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            <div className="w-full bg-border/30 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Question */}
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {currentQuestionIndex + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground flex-1 pt-1">
                    {currentQuestion.question}
                  </h3>
                </div>

                {/* Difficulty Badge */}
                <div className="ml-12 mb-6">
                  <span className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">
                    Difficulty: {'★'.repeat(Math.min(currentQuestion.difficulty, 5))}
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="ml-12 space-y-3">
                {currentQuestion.options?.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isCorrectOption = option === currentQuestion.correctAnswer;
                  const showResult = showFeedback && (isSelected || isCorrectOption);
                  const isWrong = showFeedback && isSelected && !isCorrectOption;

                  return (
                    <motion.button
                      key={idx}
                      onClick={() => handleSelectOption(option)}
                      disabled={showFeedback || isSubmitting}
                      className={`w-full group text-left transition-all duration-200 ${
                        showFeedback && isSelected
                          ? isCorrect
                            ? 'pointer-events-none'
                            : 'pointer-events-none'
                          : showFeedback
                            ? 'pointer-events-none'
                            : 'cursor-pointer'
                      }`}
                      whileHover={!showFeedback ? { x: 4 } : {}}
                      whileTap={!showFeedback ? { scale: 0.98 } : {}}
                    >
                      <div
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          isSelected
                            ? isCorrect
                              ? 'border-primary bg-primary/5'
                              : 'border-destructive bg-destructive/5'
                            : isCorrectOption && showFeedback
                              ? 'border-primary bg-primary/5'
                              : 'border-border/50 bg-card hover:border-primary/30 hover:bg-card/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{option}</span>

                          {showResult && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 200 }}
                            >
                              {isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-primary" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-destructive" />
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback */}
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`ml-12 p-4 rounded-lg border-l-4 ${
                    isCorrect
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-destructive bg-destructive/5 text-destructive'
                  }`}
                >
                  <p className="font-semibold mb-1">
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        className="border-t border-border/30 backdrop-blur-sm sticky bottom-0"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {Object.keys(answers).length} of {quiz.questions.length} answered
          </div>

          <motion.button
            onClick={handleNext}
            disabled={!selectedOption || showFeedback || isSubmitting || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg font-semibold text-primary-foreground flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span>Analyzing...</span>
              </>
            ) : isLastQuestion && showFeedback ? (
              <>
                <span>Complete Assessment</span>
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>{isLastQuestion && showFeedback ? 'Submit' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PreQuiz;
