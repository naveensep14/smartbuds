'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Flag } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Test, Question } from '@/types';
import { testService } from '@/lib/database';

export default function TestPage() {
  const params = useParams();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  // Load test from database
  useEffect(() => {
    const loadTest = async () => {
      if (params.id) {
        const testId = Array.isArray(params.id) ? params.id[0] : params.id;
        const fetchedTest = await testService.getById(testId);
        if (fetchedTest) {
          setTest(fetchedTest);
          setTimeRemaining(fetchedTest.duration * 60);
        }
        setLoading(false);
      }
    };
    loadTest();
  }, [params.id]);

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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Test Not Found</h1>
          <p className="text-gray-600 mb-4">The test you're looking for doesn't exist.</p>
          <Link href="/tests" className="btn-primary">
            Back to Tests
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const totalQuestions = test.questions.length;
  const answeredQuestions = Object.keys(selectedAnswers).length;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    setIsTestCompleted(true);
    setShowResults(true);
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

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="card text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-6">
              {score.percentage >= 80 ? '🎉' : score.percentage >= 60 ? '👍' : '📚'}
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-4">Test Completed!</h1>
            <div className="text-2xl font-semibold text-gray-800 mb-2">
              Score: {score.correct}/{score.total} ({score.percentage}%)
            </div>
            <p className="text-gray-600 mb-8">
              {score.percentage >= 80 ? 'Excellent work!' : 
               score.percentage >= 60 ? 'Good job! Keep practicing!' : 
               'Keep studying! You\'ll do better next time!'}
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-primary-50 rounded-lg p-4">
                <h3 className="font-semibold text-primary-700 mb-2">Correct Answers</h3>
                <p className="text-2xl font-bold text-primary-600">{score.correct}</p>
              </div>
              <div className="bg-secondary-50 rounded-lg p-4">
                <h3 className="font-semibold text-secondary-700 mb-2">Total Questions</h3>
                <p className="text-2xl font-bold text-secondary-600">{score.total}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <div 
                    className="w-12 h-12 rounded-lg bg-cover bg-center"
                    style={{
                      backgroundImage: 'url(/images/logo-square.jpg)'
                    }}
                  />
                </div>
                <h1 className="text-2xl font-bold text-gradient">SmartBuds</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-600">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{test.title}</h1>
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
    </div>
  );
} 