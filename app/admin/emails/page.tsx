'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, User, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import NavigationHeader from '@/components/NavigationHeader';

interface SupportRequest {
  id: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'replied';
}

export default function AdminEmailPage() {
  const { user, isAdmin } = useAuth();
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mock data for demonstration - in real app, this would come from your database
  useEffect(() => {
    // This would typically fetch from your database
    const mockRequests: SupportRequest[] = [
      {
        id: '1',
        userEmail: 'student@example.com',
        userName: 'John Doe',
        subject: 'Cannot access Chapter 2 tests',
        message: 'I completed Chapter 1 but cannot see Chapter 2 tests. Please help.',
        timestamp: new Date().toISOString(),
        status: 'pending'
      },
      {
        id: '2',
        userEmail: 'parent@example.com',
        userName: 'Sarah Smith',
        subject: 'Progress tracking not working',
        message: 'My child\'s test results are not showing up in the dashboard.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'replied'
      }
    ];
    setSupportRequests(mockRequests);
  }, []);

  const handleSendReply = async () => {
    if (!selectedRequest || !replyMessage.trim()) {
      setMessage({ type: 'error', text: 'Please enter a reply message' });
      return;
    }

    setIsSending(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: selectedRequest.userEmail,
          userName: selectedRequest.userName,
          subject: replySubject || selectedRequest.subject,
          message: replyMessage,
          adminName: user?.user_metadata?.full_name || 'SuccessBuds Support'
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Reply sent successfully!' });
        setReplyMessage('');
        setReplySubject('');
        
        // Update the request status
        setSupportRequests(prev => 
          prev.map(req => 
            req.id === selectedRequest.id 
              ? { ...req, status: 'replied' as const }
              : req
          )
        );
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send reply' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send reply. Please try again.' });
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Email Management</h1>
          <p className="text-gray-600">Manage and reply to support requests from users</p>
        </div>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Support Requests List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Support Requests ({supportRequests.length})
              </h2>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {supportRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedRequest?.id === request.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => {
                    setSelectedRequest(request);
                    setReplySubject(`Re: ${request.subject}`);
                    setMessage(null);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">{request.subject}</h3>
                        {request.status === 'replied' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{request.userName} ({request.userEmail})</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{request.message}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimestamp(request.timestamp)}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'replied' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status === 'replied' ? 'Replied' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Reply Interface */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Send className="w-5 h-5 mr-2" />
                Reply to User
              </h2>
            </div>
            
            <div className="p-6">
              {selectedRequest ? (
                <div className="space-y-4">
                  {/* User Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Original Request</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>From:</strong> {selectedRequest.userName} ({selectedRequest.userEmail})</p>
                      <p><strong>Subject:</strong> {selectedRequest.subject}</p>
                      <p><strong>Message:</strong></p>
                      <div className="bg-white p-3 rounded border text-gray-700">
                        {selectedRequest.message}
                      </div>
                    </div>
                  </div>

                  {/* Reply Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reply Subject
                      </label>
                      <input
                        type="text"
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter reply subject"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reply Message
                      </label>
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Type your reply here..."
                      />
                    </div>
                    
                    <button
                      onClick={handleSendReply}
                      disabled={isSending || !replyMessage.trim()}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isSending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Reply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a support request to reply</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

