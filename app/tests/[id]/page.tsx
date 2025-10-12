'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Flag, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Test, Question, TestResult, CreateQuestionReportData } from '@/types';
import { testService, resultService } from '@/lib/database';
import { useAuth } from '@/lib/auth';
import TestReview from '@/components/TestReview';
import ReportQuestionModal from '@/components/ReportQuestionModal';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [testProgress, setTestProgress] = useState<TestProgress | null>(null);
  const [isResuming, setIsResuming] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [confidenceRatings, setConfidenceRatings] = useState<{ [key: string]: number }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  
  // Ref for debouncing progress saves
  const saveProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Derived values
  const currentQuestion = test?.questions[currentQuestionIndex];
  const totalQuestions = test?.questions.length || 0;
  const answeredQuestions = Object.keys(selectedAnswers).length;
  const flaggedCount = flaggedQuestions.size;

  // Save progress when answers change (debounced to avoid excessive API calls)
  const saveProgressDebounced = useCallback((delay: number = 2000) => {
    // Clear any existing timeout
    if (saveProgressTimeoutRef.current) {
      clearTimeout(saveProgressTimeoutRef.current);
    }
    
    // Set new timeout
    saveProgressTimeoutRef.current = setTimeout(async () => {
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
    }, delay);
  }, [user?.email, test, startTime, currentQuestionIndex, selectedAnswers]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveProgressTimeoutRef.current) {
        clearTimeout(saveProgressTimeoutRef.current);
      }
    };
  }, []);

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (!currentQuestion) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));
    
    // Save progress after a delay (debounced)
    saveProgressDebounced(2000);
  }, [currentQuestion, saveProgressDebounced]);

  const handleConfidenceChange = (questionId: string, confidence: number) => {
    setConfidenceRatings(prev => ({
      ...prev,
      [questionId]: confidence
    }));
  };

  const handleFlagQuestion = useCallback((questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // Save progress when navigating (debounced)
      saveProgressDebounced(2000);
    }
  }, [currentQuestionIndex, totalQuestions, saveProgressDebounced]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Save progress when navigating (debounced)
      saveProgressDebounced(2000);
    }
  }, [currentQuestionIndex, saveProgressDebounced]);

  const handleSubmitTest = useCallback(async () => {
    if (!test || !user) return;

    // Close confirmation dialog if open
    setShowSubmitConfirmation(false);
    
    // Clear any pending progress saves
    if (saveProgressTimeoutRef.current) {
      clearTimeout(saveProgressTimeoutRef.current);
    }

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
        await TestProgressService.saveProgress({
          userEmail: user.email,
          testId: test.id,
          currentQuestionIndex,
          selectedAnswers,
          startTime,
          timeSpent: timeTaken,
          isCompleted: true
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
  }, [test, user, selectedAnswers, startTime, currentQuestionIndex]);

  const handleSubmitAttempt = useCallback(() => {
    if (!test) return;
    
    const allQuestionsAnswered = answeredQuestions === totalQuestions;
    
    if (allQuestionsAnswered) {
      // All questions answered, submit directly
      handleSubmitTest();
    } else {
      // Not all questions answered, show confirmation
      setShowSubmitConfirmation(true);
    }
  }, [test, answeredQuestions, totalQuestions, handleSubmitTest]);

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

  // Keyboard navigation
  useEffect(() => {
    if (!test || !currentQuestion) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with form inputs
      }

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          if (currentQuestionIndex < totalQuestions - 1) {
            handleNextQuestion();
          }
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          if (currentQuestionIndex > 0) {
            handlePreviousQuestion();
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          e.preventDefault();
          const optionIndex = parseInt(e.key) - 1;
          if (optionIndex < currentQuestion.options.length) {
            handleAnswerSelect(optionIndex);
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (currentQuestionIndex === totalQuestions - 1) {
            handleSubmitAttempt();
          } else {
            handleNextQuestion();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestionIndex, totalQuestions, currentQuestion, handleAnswerSelect, handleNextQuestion, handlePreviousQuestion, handleSubmitAttempt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    if (!test) return { correct: 0, total: 0, percentage: 0 };
    
    const correct = test.questions.reduce((acc, question) => {
      const selectedAnswer = selectedAnswers[question.id];
      return acc + (selectedAnswer === question.correctAnswer ? 1 : 0);
    }, 0);
    
    return {
      correct,
      total: totalQuestions,
      percentage: Math.round((correct / totalQuestions) * 100)
    };
  };

  const handleSubmitReport = async (data: CreateQuestionReportData) => {
    try {
      console.log('📤 [TEST PAGE] Getting session...');
      // Get the current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ [TEST PAGE] Session error:', sessionError);
        throw new Error('Failed to get session: ' + sessionError.message);
      }
      
      if (!session) {
        console.error('❌ [TEST PAGE] No active session');
        throw new Error('No active session. Please log in again.');
      }

      console.log('📤 [TEST PAGE] Submitting report...');
      const response = await fetch('/api/reports/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });

      console.log('📤 [TEST PAGE] Response status:', response.status);
      
      const result = await response.json();
      console.log('📤 [TEST PAGE] Response data:', result);

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to submit report');
      }

      console.log('✅ [TEST PAGE] Report submitted successfully');
      setReportSubmitted(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setReportSubmitted(false);
      }, 5000);
      
      return result;
    } catch (error: any) {
      console.error('❌ [TEST PAGE] Error submitting report:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-3">
                  <Image
                    src="https://i.ibb.co/6RcwZjJr/logo-square.jpg"
                    alt="SuccessBuds Logo"
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading test...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Not Found</h1>
            <p className="text-gray-600 mb-8">The test you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/tests" className="btn-primary">
              Back to Tests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && testResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-3">
                  <Image
                    src="https://i.ibb.co/6RcwZjJr/logo-square.jpg"
                    alt="SuccessBuds Logo"
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
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
               'Keep studying! You&apos;ll do better next time!'}
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
              <button
                onClick={() => setShowReview(true)}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>Review Test</span>
              </button>
              <Link href="/tests" className="btn-secondary">
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
                <Image
                  src="https://i.ibb.co/6RcwZjJr/logo-square.jpg"
                  alt="SuccessBuds Logo"
                  width={48}
                  height={48}
                  className="rounded-lg object-cover"
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
            <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-600">{formatTime(timeRemaining)}</span>
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

        {/* Progress Analytics */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Progress</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{answeredQuestions}</div>
              <div className="text-sm text-gray-600">Answered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatTime(timeRemaining)}</div>
              <div className="text-sm text-gray-600">Time Left</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round((answeredQuestions / totalQuestions) * 100)}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
        </div>

        {/* Question Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Navigation</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 gap-2">
            {test.questions.map((question, index) => {
              const isAnswered = selectedAnswers[question.id] !== undefined;
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isCurrent
                      ? 'bg-orange-500 text-white ring-2 ring-orange-300'
                      : isAnswered
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  aria-label={`Question ${index + 1}${isAnswered ? ', answered' : ', not answered'}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span>Not answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Current</span>
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
            <h2 className="text-2xl font-bold text-gray-800">Question {currentQuestionIndex + 1}</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                aria-label="Report issue with this question"
              >
                <Flag className="w-4 h-4" />
                <span className="text-sm font-medium">Report Issue</span>
              </button>
            </div>
          </div>
          
          <p id="question-text" className="text-xl text-gray-800 mb-8 leading-relaxed">{currentQuestion?.text}</p>
          
          <div 
            className="space-y-4" 
            role="radiogroup" 
            aria-labelledby="question-text"
            aria-describedby="question-instructions"
          >
            <div id="question-instructions" className="sr-only">
              Select one option using number keys 1-4, arrow keys to navigate, or click to select.
            </div>
            {currentQuestion?.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`option-button ${
                  selectedAnswers[currentQuestion?.id] === index ? 'selected' : ''
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                role="radio"
                aria-checked={selectedAnswers[currentQuestion?.id] === index}
                aria-describedby={`option-${index}-text`}
                aria-label={`Option ${index + 1}: ${option}`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 mr-4 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600">{String.fromCharCode(65 + index)}</span>
                    {selectedAnswers[currentQuestion?.id] === index && (
                      <div className="absolute w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <span id={`option-${index}-text`} className="text-lg font-medium">{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Keyboard Shortcuts Help */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">Keyboard Shortcuts</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-700">
            <div>• <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">1-4</kbd> Select answer</div>
            <div>• <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">←→</kbd> Navigate questions</div>
            <div>• <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Enter</kbd> Next/Submit</div>
          </div>
        </div>

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

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {currentQuestionIndex < totalQuestions - 1 && (
              <button
                onClick={handleNextQuestion}
                className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
              >
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleSubmitAttempt}
              className="btn-success flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Submit Test</span>
            </button>
          </div>
        </div>
      </main>

      {/* Test Review Modal */}
      {showReview && test && testResult && (
        <TestReview
          test={test}
          testResult={testResult}
          onClose={() => setShowReview(false)}
        />
      )}

      {/* Report Question Modal */}
      {currentQuestion && (
        <ReportQuestionModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setReportSubmitted(false);
          }}
          onSubmit={handleSubmitReport}
          questionId={currentQuestion.id}
          questionText={currentQuestion.text}
          questionOptions={currentQuestion.options}
          correctAnswer={currentQuestion.correctAnswer}
          userAnswer={selectedAnswers[currentQuestion.id]}
          testId={test.id}
        />
      )}

      {/* Success Message */}
      {reportSubmitted && (
        <div className="fixed top-4 right-4 z-60 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Report submitted successfully!</p>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowSubmitConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Submit Incomplete Test?
                </h2>
                <p className="text-gray-600 mb-4">
                  You have only answered <strong>{answeredQuestions}</strong> out of <strong>{totalQuestions}</strong> questions.
                </p>
                <p className="text-gray-600 mb-6">
                  Unanswered questions will be marked as incorrect. Are you sure you want to submit?
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowSubmitConfirmation(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Continue Test
                  </button>
                  <button
                    onClick={handleSubmitTest}
                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    Submit Anyway
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}