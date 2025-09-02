'use client';

import { motion } from 'framer-motion';
import { X, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { Test } from '@/types';

interface TestPreviewModalProps {
  test: Test;
  onClose: () => void;
}

export default function TestPreviewModal({ test, onClose }: TestPreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Test Preview</h2>
                <p className="text-sm text-gray-600">Viewing: {test.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Test Info */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{test.title}</h1>
              <p className="text-gray-600 mb-3">{test.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  {test.subject}
                </span>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  {test.grade}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{test.duration} min</span>
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>{test.questions.length} questions</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="px-6 py-4">
          <div className="space-y-8">
            {test.questions.map((question, index) => (
              <motion.div
                key={question.id}
                className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Question {index + 1}
                  </h3>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm font-medium">
                    {question.options.length} options
                  </span>
                </div>
                
                <p className="text-lg text-gray-700 mb-6">{question.text}</p>
                
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        optionIndex === question.correctAnswer
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                          optionIndex === question.correctAnswer
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}>
                          {optionIndex === question.correctAnswer && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-lg">{option}</span>
                        {optionIndex === question.correctAnswer && (
                          <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                            Correct Answer
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {question.explanation && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
                    <p className="text-blue-700">{question.explanation}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Test created: {test.createdAt.toLocaleDateString()}
            </div>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Close Preview
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 