'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Flag, MessageSquare } from 'lucide-react';
import { IssueType, CreateQuestionReportData } from '@/types';

interface ReportQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateQuestionReportData) => Promise<void>;
  questionId: string;
  questionText: string;
  questionOptions: string[];
  correctAnswer: number;
  userAnswer?: number;
  testId: string;
}

const ISSUE_TYPES: { value: IssueType; label: string; description: string }[] = [
  {
    value: 'incorrect_answer',
    label: 'Incorrect Answer',
    description: 'The correct answer marked is wrong'
  },
  {
    value: 'unclear_question',
    label: 'Unclear Question',
    description: 'The question is confusing or ambiguous'
  },
  {
    value: 'typo_error',
    label: 'Typo or Grammar Error',
    description: 'There are spelling or grammar mistakes'
  },
  {
    value: 'wrong_explanation',
    label: 'Wrong Explanation',
    description: 'The explanation provided is incorrect'
  },
  {
    value: 'inappropriate_content',
    label: 'Inappropriate Content',
    description: 'Content is not suitable for the grade level'
  },
  {
    value: 'technical_error',
    label: 'Technical Error',
    description: 'The question or options are not displaying correctly'
  },
  {
    value: 'other',
    label: 'Other Issue',
    description: 'Any other problem with this question'
  }
];

export default function ReportQuestionModal({
  isOpen,
  onClose,
  onSubmit,
  questionId,
  questionText,
  questionOptions,
  correctAnswer,
  userAnswer,
  testId
}: ReportQuestionModalProps) {
  const [selectedIssueType, setSelectedIssueType] = useState<IssueType | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 [MODAL] Form submitted');
    
    if (!selectedIssueType) {
      console.log('❌ [MODAL] No issue type selected');
      setError('Please select an issue type');
      return;
    }

    console.log('🔍 [MODAL] Starting submission...');
    setIsSubmitting(true);
    setError('');

    try {
      const reportData = {
        testId,
        questionId,
        questionText,
        questionOptions,
        correctAnswer,
        userAnswer,
        issueType: selectedIssueType as IssueType,
        description: description.trim() || undefined
      };
      
      console.log('🔍 [MODAL] Calling onSubmit with data:', reportData);
      await onSubmit(reportData);
      console.log('✅ [MODAL] onSubmit completed successfully');

      // Reset form
      setSelectedIssueType('');
      setDescription('');
      onClose();
    } catch (err: any) {
      console.error('❌ [MODAL] Error in handleSubmit:', err);
      const errorMessage = err?.message || 'Failed to submit report. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedIssueType('');
      setDescription('');
      setError('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Flag className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Report Question Issue</h2>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Question Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Question:</h3>
                <p className="text-sm text-gray-900 mb-3">{questionText}</p>
                
                <div className="space-y-1">
                  {questionOptions.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <span className="font-medium text-gray-600">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className={`${
                        index === correctAnswer ? 'text-green-600 font-medium' : 
                        index === userAnswer ? 'text-blue-600 font-medium' : 
                        'text-gray-700'
                      }`}>
                        {option}
                      </span>
                      {index === correctAnswer && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Correct
                        </span>
                      )}
                      {index === userAnswer && index !== correctAnswer && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Your Answer
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Issue Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What issue did you find? *
                  </label>
                  <div className="space-y-2">
                    {ISSUE_TYPES.map((issue) => (
                      <label
                        key={issue.value}
                        className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedIssueType === issue.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="issueType"
                          value={issue.value}
                          checked={selectedIssueType === issue.value}
                          onChange={(e) => setSelectedIssueType(e.target.value as IssueType)}
                          className="mt-1 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {issue.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {issue.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide more details about the issue..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {description.length}/500 characters
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedIssueType}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <Flag className="w-4 h-4" />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
