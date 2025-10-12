'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, X, CheckCircle, XCircle, Clock, BarChart3, Eye, ArrowLeft, ArrowRight, Flag } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/lib/auth';
import { Test, Question, TestResult, CreateQuestionReportData } from '@/types';
import ReportQuestionModal from './ReportQuestionModal';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TestReviewProps {
  test: Test;
  testResult: TestResult;
  onClose?: () => void;
}

export default function TestReview({ test, testResult, onClose }: TestReviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const { refreshSession } = useAuth();

  const currentQuestion = test.questions[currentQuestionIndex];
  const userAnswer = testResult.answers.find(a => a.questionId === currentQuestion.id);
  const isCorrect = userAnswer?.isCorrect || false;
  const selectedAnswerIndex = userAnswer?.selectedAnswer;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const handleSubmitReport = async (data: CreateQuestionReportData) => {
    try {
      console.log('🔍 [FRONTEND] Starting report submission...');
      
      // Try to refresh session first
      let session = await refreshSession();
      
      // If refresh fails, try to get current session
      if (!session) {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        console.log('🔍 [FRONTEND] Session present:', !!currentSession);
        console.log('🔍 [FRONTEND] Session error:', sessionError);
        
        if (sessionError) {
          console.log('❌ [FRONTEND] Session error:', sessionError);
          throw new Error('Session error: ' + sessionError.message);
        }
        
        session = currentSession;
      }
      
      if (!session) {
        console.log('❌ [FRONTEND] No active session');
        throw new Error('No active session. Please log in again.');
      }

      console.log('🔍 [FRONTEND] Token length:', session.access_token.length);
      console.log('🔍 [FRONTEND] Report data:', {
        testId: data.testId,
        questionId: data.questionId,
        issueType: data.issueType
      });

      const response = await fetch('/api/reports/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });

      console.log('🔍 [FRONTEND] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ [FRONTEND] Error response:', errorText);
        throw new Error('Failed to submit report');
      }

      const result = await response.json();
      console.log('✅ [FRONTEND] Report submitted successfully:', result);
      setReportSubmitted(true);
      return result;
    } catch (error) {
      console.error('❌ [FRONTEND] Error submitting report:', error);
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Test Review</h2>
              <p className="text-sm text-gray-600">{test.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Score Display */}
            <div className={`px-4 py-2 rounded-lg border ${getScoreBgColor(testResult.score)}`}>
              <div className="flex items-center space-x-2">
                <BarChart3 className={`w-5 h-5 ${getScoreColor(testResult.score)}`} />
                <span className={`font-semibold ${getScoreColor(testResult.score)}`}>
                  {testResult.score}%
                </span>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Left Sidebar - Question Navigation */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Questions</h3>
                <button
                  onClick={() => setShowAnswerKey(!showAnswerKey)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    showAnswerKey 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  {showAnswerKey ? 'Hide' : 'Show'} Answer Key
                </button>
              </div>
              
              <div className="space-y-2">
                {test.questions.map((question, index) => {
                  const answer = testResult.answers.find(a => a.questionId === question.id);
                  const isCorrect = answer?.isCorrect || false;
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        isCurrent 
                          ? 'bg-orange-100 border-2 border-orange-300' 
                          : 'bg-white border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">
                          Q{index + 1}
                        </span>
                        <div className="flex items-center space-x-1">
                          {isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          {showAnswerKey && (
                            <span className="text-xs font-medium text-gray-600">
                              {String.fromCharCode(65 + question.correctAnswer)}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {question.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content - Question Review */}
          <div className="flex-1 flex flex-col">
            {/* Question Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    Question {currentQuestionIndex + 1} of {test.questions.length}
                  </span>
                  <div className="flex items-center space-x-2">
                    {isCorrect ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-600 font-medium">Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-600 font-medium">Incorrect</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                    <span className="text-sm font-medium">Report Issue</span>
                  </button>
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.min(test.questions.length - 1, currentQuestionIndex + 1))}
                    disabled={currentQuestionIndex === test.questions.length - 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  {currentQuestion.text}
                </h3>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswerIndex === index;
                    const isCorrectAnswer = index === currentQuestion.correctAnswer;
                    const isWrongSelected = isSelected && !isCorrectAnswer;
                    
                    let optionClass = "p-4 rounded-lg border transition-all";
                    
                    if (showAnswerKey) {
                      if (isCorrectAnswer) {
                        optionClass += " bg-green-50 border-green-300 text-green-800";
                      } else if (isWrongSelected) {
                        optionClass += " bg-red-50 border-red-300 text-red-800";
                      } else {
                        optionClass += " bg-gray-50 border-gray-200 text-gray-600";
                      }
                    } else {
                      if (isSelected) {
                        optionClass += " bg-orange-50 border-orange-300 text-orange-800";
                      } else {
                        optionClass += " bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100";
                      }
                    }

                    return (
                      <div key={index} className={optionClass}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            showAnswerKey 
                              ? (isCorrectAnswer ? 'border-green-500 bg-green-500' : 
                                 isWrongSelected ? 'border-red-500 bg-red-500' : 'border-gray-300')
                              : (isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300')
                          }`}>
                            {showAnswerKey ? (
                              isCorrectAnswer ? (
                                <CheckCircle className="w-4 h-4 text-white" />
                              ) : isWrongSelected ? (
                                <XCircle className="w-4 h-4 text-white" />
                              ) : null
                            ) : isSelected ? (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            ) : null}
                          </div>
                          <span className="font-medium">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span className="flex-1">{option}</span>
                          {showAnswerKey && isCorrectAnswer && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              Correct Answer
                            </span>
                          )}
                          {showAnswerKey && isWrongSelected && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                              Your Answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Section */}
                {showAnswerKey && (
                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Explanation</h4>
                    <p className="text-blue-700 mb-3">
                      {isCorrect 
                        ? "✓ Great job! You selected the correct answer." 
                        : `The correct answer is ${String.fromCharCode(65 + currentQuestion.correctAnswer)}. ${
                            selectedAnswerIndex !== undefined 
                              ? `You selected ${String.fromCharCode(65 + selectedAnswerIndex)}.` 
                              : "You didn't select an answer."
                          }`
                      }
                    </p>
                    {currentQuestion.explanation && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-blue-900 font-medium mb-1">Detailed Explanation:</p>
                        <p className="text-blue-800">{currentQuestion.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Time taken: {Math.floor(testResult.timeTaken / 60)}m {testResult.timeTaken % 60}s
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/tests"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Back to Tests
                  </Link>
                  <Link
                    href="/my-results"
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    View All Results
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Report Question Modal */}
      <ReportQuestionModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setReportSubmitted(false);
        }}
        onSubmit={handleSubmitReport}
        questionId={currentQuestion.id}
        questionText={currentQuestion.text || 'No question text available'}
        questionOptions={currentQuestion.options}
        correctAnswer={currentQuestion.correctAnswer}
        userAnswer={selectedAnswerIndex}
        testId={test.id}
      />

      {/* Success Message */}
      {reportSubmitted && (
        <div className="fixed top-4 right-4 z-60 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Report submitted successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
}
