'use client';

import { useState } from 'react';
import { MessageCircle, Send, CheckCircle, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface GradeBoardRequestProps {
  className?: string;
  compact?: boolean;
}

interface RequestFormData {
  requestedGrade: string;
  requestedBoard: string;
  message: string;
}

export default function GradeBoardRequest({ className = '', compact = false }: GradeBoardRequestProps) {
  const { user } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestFormData, setRequestFormData] = useState<RequestFormData>({
    requestedGrade: '',
    requestedBoard: '',
    message: '',
  });
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  const handleRequestInputChange = (field: keyof RequestFormData, value: string) => {
    setRequestFormData(prev => ({ ...prev, [field]: value }));
    setRequestError('');
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestFormData.requestedGrade.trim() || !requestFormData.requestedBoard.trim()) {
      setRequestError('Please provide both grade and board information.');
      return;
    }

    if (!user?.email) {
      setRequestError('Please log in to send a request.');
      return;
    }

    setIsRequestLoading(true);
    setRequestError('');

    try {
      const response = await fetch('/api/admin/grade-board-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.email.split('@')[0] || 'User',
          requestedGrade: requestFormData.requestedGrade.trim(),
          requestedBoard: requestFormData.requestedBoard.trim(),
          message: requestFormData.message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send request');
      }

      setRequestSuccess(true);
      setRequestFormData({
        requestedGrade: '',
        requestedBoard: '',
        message: '',
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setRequestSuccess(false);
        setShowRequestForm(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error sending request:', error);
      setRequestError('Failed to send request. Please try again.');
    } finally {
      setIsRequestLoading(false);
    }
  };

  if (compact) {
    return (
      <div className={`${className}`}>
        {!showRequestForm ? (
          <button
            type="button"
            onClick={() => setShowRequestForm(true)}
            className="inline-flex items-center space-x-1 text-xs text-navy hover:text-primary-700 transition-colors"
          >
            <MessageCircle className="w-3 h-3" />
            <span>Request Grade/Board</span>
          </button>
        ) : (
          <div className="bg-gray-50 rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-900">Request New Options</span>
              <button
                type="button"
                onClick={() => {
                  setShowRequestForm(false);
                  setRequestError('');
                  setRequestFormData({
                    requestedGrade: '',
                    requestedBoard: '',
                    message: '',
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={requestFormData.requestedGrade}
                onChange={(e) => handleRequestInputChange('requestedGrade', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-navy focus:border-transparent"
                placeholder="Grade"
              />
              <input
                type="text"
                value={requestFormData.requestedBoard}
                onChange={(e) => handleRequestInputChange('requestedBoard', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-navy focus:border-transparent"
                placeholder="Board"
              />
            </div>

            {requestError && (
              <div className="bg-red-50 border border-red-200 rounded p-2">
                <p className="text-red-800 text-xs">{requestError}</p>
              </div>
            )}

            {requestSuccess && (
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <p className="text-green-800 text-xs font-medium">Request sent!</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSendRequest}
              disabled={isRequestLoading || !requestFormData.requestedGrade.trim() || !requestFormData.requestedBoard.trim()}
              className="w-full bg-navy text-white py-1 px-2 rounded text-xs font-medium hover:bg-primary-700 focus:ring-1 focus:ring-navy focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-1"
            >
              {isRequestLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Don&apos;t see your grade or board?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          We&apos;re constantly adding new grades and boards. Let us know what you need!
        </p>
        {!showRequestForm && (
          <button
            type="button"
            onClick={() => setShowRequestForm(true)}
            className="inline-flex items-center space-x-2 bg-navy text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Request Grade/Board</span>
          </button>
        )}
      </div>

      {/* Request Form */}
      {showRequestForm && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Request New Options</h4>
            <button
              type="button"
              onClick={() => {
                setShowRequestForm(false);
                setRequestError('');
                setRequestFormData({
                  requestedGrade: '',
                  requestedBoard: '',
                  message: '',
                });
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requested Grade
              </label>
              <input
                type="text"
                value={requestFormData.requestedGrade}
                onChange={(e) => handleRequestInputChange('requestedGrade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy focus:border-transparent text-sm"
                placeholder="e.g., Grade 8, Class 9"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requested Board
              </label>
              <input
                type="text"
                value={requestFormData.requestedBoard}
                onChange={(e) => handleRequestInputChange('requestedBoard', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy focus:border-transparent text-sm"
                placeholder="e.g., Maharashtra Board, Karnataka Board"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Message (Optional)
            </label>
            <textarea
              value={requestFormData.message}
              onChange={(e) => handleRequestInputChange('message', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy focus:border-transparent text-sm"
              rows={3}
              placeholder="Tell us more about your requirements..."
            />
          </div>

          {requestError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{requestError}</p>
            </div>
          )}

          {requestSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-green-800 text-sm font-medium">
                  Request sent successfully! We&apos;ll review and add your grade/board soon.
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSendRequest}
            disabled={isRequestLoading || !requestFormData.requestedGrade.trim() || !requestFormData.requestedBoard.trim()}
            className="w-full bg-navy text-white py-2 px-4 rounded-md font-medium hover:bg-primary-700 focus:ring-2 focus:ring-navy focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center space-x-2"
          >
            {isRequestLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Request</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
