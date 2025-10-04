'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Flag, Menu, X, Printer } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Test, Question, TestResult } from '@/types';
import { testService, resultService } from '@/lib/database';
import { useAuth } from '@/lib/auth';
import PrintableTest from '@/components/PrintableTest';
import { TestProgressService, TestProgress } from '@/lib/test-progress';

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printMode, setPrintMode] = useState<'test' | 'answer-key'>('test');
  const [testProgress, setTestProgress] = useState<TestProgress | null>(null);
  const [isResuming, setIsResuming] = useState(false);

  // Load test from database
  useEffect(() => {
    const loadTest = async () => {
      if (params.id && user?.email) {
        const testId = Array.isArray(params.id) ? params.id[0] : params.id;
        
        // Load test data
        const fetchedTest = await testService.getById(testId);
        if (fetchedTest) {
          setTest(fetchedTest);
          setTimeRemaining(fetchedTest.duration * 60);
          
          // Check for existing progress
          try {
            const existingProgress = await TestProgressService.getProgress(user.email, testId);
            if (existingProgress && !existingProgress.isCompleted) {
              setTestProgress(existingProgress);
              setIsResuming(true);
              // Restore progress
              setCurrentQuestionIndex(existingProgress.currentQuestionIndex);
              setSelectedAnswers(existingProgress.selectedAnswers);
              setStartTime(existingProgress.startTime);
              // Calculate remaining time based on time spent
              const timeSpent = TestProgressService.calculateTimeSpent(existingProgress.startTime);
              const remainingTime = (fetchedTest.duration * 60) - timeSpent;
              setTimeRemaining(Math.max(0, remainingTime));
            }
          } catch (error) {
            console.log('Progress tracking not available - database table may not exist yet');
            // Continue without progress tracking
          }
        }
        setLoading(false);
      }
    };
    loadTest();
  }, [params.id, user]);

  // Timer effect - must be called before any conditional returns
  useEffect(() => {
    if (timeRemaining > 0 && !isTestCompleted && test) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTestCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, isTestCompleted, test]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-3">
                  <img
                    src="https://i.ibb.co/6RcwZjJr/logo-square.jpg"
                    alt="SuccessBuds Logo"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <h1 className="text-2xl font-bold text-gradient">SuccessBuds</h1>
                </Link>
              </div>
              <nav className="hidden md:flex space-x-8">
              </nav>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
            
            {/* Mobile menu */}
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="md:hidden border-t border-gray-100 pt-4 pb-2"
              >
                <div className="flex flex-col space-y-3">
                  <Link 
                    href="/tests" 
                    className="text-orange-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Take Tests
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </header>

        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading test...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-3">
                  <img
                    src="https://i.ibb.co/6RcwZjJr/logo-square.jpg"
                    alt="SuccessBuds Logo"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <h1 className="text-2xl font-bold text-gradient">SuccessBuds</h1>
                </Link>
              </div>
              <nav className="hidden md:flex space-x-8">
              </nav>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
            
            {/* Mobile menu */}
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="md:hidden border-t border-gray-100 pt-4 pb-2"
              >
                <div className="flex flex-col space-y-3">
                  <Link 
                    href="/tests" 
                    className="text-orange-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Take Tests
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </header>

        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Test Not Found</h1>
            <p className="text-gray-600 mb-4">The test you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/tests" className="btn-primary">
              Back to Tests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const totalQuestions = test.questions.length;
  const answeredQuestions = Object.keys(selectedAnswers).length;

  // Save progress when answers change
  const saveProgress = async () => {
    if (user?.email && test) {
      const timeSpent = TestProgressService.calculateTimeSpent(startTime);
      await TestProgressService.saveProgress({
        userEmail: user.email,
        testId: test.id,
        currentQuestionIndex,
        selectedAnswers,
        startTime,
        timeSpent,
        isCompleted: false
      });
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));
    
    // Save progress after a short delay to avoid too many saves
    setTimeout(saveProgress, 500);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // Save progress when navigating
      setTimeout(saveProgress, 100);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Save progress when navigating
      setTimeout(saveProgress, 100);
    }
  };

  const handleSubmitTest = async () => {
    if (!test || !user) return;

    try {
      // Calculate test results
      const totalQuestions = test.questions.length;
      let correctAnswers = 0;
      const answers = test.questions.map(question => {
        const selectedAnswer = selectedAnswers[question.id];
        const isCorrect = selectedAnswer === question.correctAnswer;
        if (isCorrect) correctAnswers++;
        
        return {
          questionId: question.id,
          selectedAnswer: selectedAnswer ?? -1,
          isCorrect
        };
      });

      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      const timeTaken = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

      // Create test result
      const resultData = {
        testId: test.id,
        studentName: user.email || 'Anonymous',
        score,
        totalQuestions,
        correctAnswers,
        timeTaken,
        answers
      };

      // Save to database
      console.log('Saving test result:', resultData);
      const savedResult = await resultService.create(resultData);
      console.log('Saved result:', savedResult);
      
      if (savedResult) {
        setTestResult(savedResult);
        
        // Mark progress as completed
        if (user.email) {
          await TestProgressService.markCompleted(user.email, test.id);
        }
        
        setIsTestCompleted(true);
        setShowResults(true);
      } else {
        console.error('Failed to save test result');
        // Still show results even if save failed
        setTestResult({
          id: Date.now().toString(),
          ...resultData,
          completedAt: new Date()
        });
        setIsTestCompleted(true);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      // Still show results even if save failed
      setIsTestCompleted(true);
      setShowResults(true);
    }
  };

  const toggleFlagQuestion = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    let correct = 0;
    test.questions.forEach((question: Question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: totalQuestions,
      percentage: Math.round((correct / totalQuestions) * 100)
    };
  };

  if (showResults && testResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-3">
                  <img
                    src="https://i.ibb.co/6RcwZjJr/logo-square.jpg"
                    alt="SuccessBuds Logo"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <h1 className="text-2xl font-bold text-gradient">SuccessBuds</h1>
                </Link>
              </div>
              <nav className="hidden md:flex space-x-8">
              </nav>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
            
            {/* Mobile menu */}
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="md:hidden border-t border-gray-100 pt-4 pb-2"
              >
                <div className="flex flex-col space-y-3">
                  <Link 
                    href="/tests" 
                    className="text-orange-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Take Tests
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="card text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-6">
              {testResult.score >= 80 ? '🎉' : testResult.score >= 60 ? '👍' : '📚'}
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-4">Test Completed!</h1>
            <div className="text-2xl font-semibold text-gray-800 mb-2">
              Score: {testResult.correctAnswers}/{testResult.totalQuestions} ({testResult.score}%)
            </div>
            <p className="text-gray-600 mb-8">
              {testResult.score >= 80 ? 'Excellent work!' : 
               testResult.score >= 60 ? 'Good job! Keep practicing!' : 
               'Keep studying! You\'ll do better next time!'}
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-semibold text-orange-700 mb-2">Correct Answers</h3>
                <p className="text-2xl font-bold text-orange-600">{testResult.correctAnswers}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-700 mb-2">Total Questions</h3>
                <p className="text-2xl font-bold text-red-600">{testResult.totalQuestions}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tests" className="btn-primary">
                Take Another Test
              </Link>
              <Link href="/" className="btn-secondary">
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <img
                  src="https://i.ibb.co/6RcwZjJr/logo-square.jpg"
                  alt="SuccessBuds Logo"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <h1 className="text-2xl font-bold text-gradient">SuccessBuds</h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/tests" className="text-orange-600 font-semibold">
                Take Tests
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-orange-600 transition-colors">
                Admin Panel
              </Link>
            </nav>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden border-t border-gray-100 pt-4 pb-2"
            >
              <div className="flex flex-col space-y-3">
                <Link 
                  href="/tests" 
                  className="text-orange-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Take Tests
                </Link>
                <Link 
                  href="/admin" 
                  className="text-gray-600 hover:text-orange-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
            <h1 className="text-2xl font-bold text-gray-800">{test.title}</h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setPrintMode('test');
                  setShowPrintModal(true);
                }}
                className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Test</span>
              </button>
              <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-600">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 mb-4">{test.description}</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                {test.subject}
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                {test.grade}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
          </div>
        </div>

        {/* Resume Notification */}
        {isResuming && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Resuming Test</h3>
                <p className="text-blue-600 text-sm">
                  You have {answeredQuestions} answered questions. Continuing from question {currentQuestionIndex + 1}.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Question */}
        <motion.div
          key={currentQuestionIndex}
          className="question-card mb-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Question {currentQuestionIndex + 1}</h2>
            <button
              onClick={toggleFlagQuestion}
              className={`p-2 rounded-lg transition-colors ${
                flaggedQuestions.has(currentQuestion.id)
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'
              }`}
            >
              <Flag className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-lg text-gray-700 mb-8">{currentQuestion.text}</p>
          
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`option-button ${
                  selectedAnswers[currentQuestion.id] === index ? 'selected' : ''
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 mr-4 flex items-center justify-center">
                    {selectedAnswers[currentQuestion.id] === index && (
                      <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-lg">{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="text-center w-full sm:w-auto">
            <div className="text-sm text-gray-600 mb-2">
              Progress: {answeredQuestions}/{totalQuestions} questions answered
            </div>
            <div className="w-full sm:w-64 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              onClick={handleSubmitTest}
              className="btn-success flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Submit Test</span>
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <span>Next</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </main>

      {/* Print Modal */}
      <AnimatePresence>
        {showPrintModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPrintModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Print {printMode === 'test' ? 'Test' : 'Answer Key'}
                  </h2>
                  <button
                    onClick={() => setShowPrintModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Print Options */}
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={() => setPrintMode('test')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      printMode === 'test'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Print Test
                  </button>
                  <button
                    onClick={() => setPrintMode('answer-key')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      printMode === 'answer-key'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Print Answer Key
                  </button>
                </div>

                {/* Printable Content */}
                <PrintableTest 
                  test={test} 
                  showAnswers={printMode === 'answer-key'} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 