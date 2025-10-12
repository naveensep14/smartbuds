'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Flag, Filter, Search, Eye, CheckCircle, XCircle, Clock, AlertTriangle, MessageSquare, Trash2 } from 'lucide-react';
import { QuestionReport, IssueType, ReportStatus } from '@/types';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<QuestionReport | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    issueType: '',
    search: ''
  });

  const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
    incorrect_answer: 'Incorrect Answer',
    unclear_question: 'Unclear Question',
    typo_error: 'Typo or Grammar Error',
    wrong_explanation: 'Wrong Explanation',
    inappropriate_content: 'Inappropriate Content',
    technical_error: 'Technical Error',
    other: 'Other Issue'
  };

  const STATUS_LABELS: Record<ReportStatus, string> = {
    pending: 'Pending',
    reviewed: 'Reviewed',
    resolved: 'Resolved',
    dismissed: 'Dismissed'
  };

  const STATUS_COLORS: Record<ReportStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    dismissed: 'bg-gray-100 text-gray-800'
  };

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.issueType) params.append('issueType', filters.issueType);
      params.append('limit', '100');

      const response = await fetch(`/api/admin/reports?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load reports');
      }

      const data = await response.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const updateReportStatus = async (reportId: string, status: ReportStatus, adminNotes?: string) => {
    try {
      const response = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          status,
          adminNotes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update report');
      }

      // Reload reports
      await loadReports();
      setShowReportModal(false);
      setSelectedReport(null);
    } catch (err) {
      console.error('Error updating report:', err);
      alert('Failed to update report status');
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/reports', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      // Reload reports
      await loadReports();
      setShowReportModal(false);
      setSelectedReport(null);
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report');
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = !filters.search || 
      report.questionText.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.testTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-3 rounded-xl">
                <Flag className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">View Issues</h1>
                <p className="text-gray-600">Review and manage student-reported issues</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{reports.length}</div>
              <div className="text-sm text-gray-500">Total Reports</div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <select
              value={filters.issueType}
              onChange={(e) => setFilters(prev => ({ ...prev, issueType: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Issue Types</option>
              {Object.entries(ISSUE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reports..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* Reports List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {error ? (
            <div className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Reports</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadReports}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-8 text-center">
              <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600">
                {filters.status || filters.issueType || filters.search 
                  ? 'No reports match your current filters.'
                  : 'No issue reports have been submitted yet.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedReport(report);
                    setShowReportModal(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[report.status]}`}>
                          {STATUS_LABELS[report.status]}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {ISSUE_TYPE_LABELS[report.issueType]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(report.reportedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {report.questionText}
                      </h3>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="font-medium">{report.testTitle}</span>
                        <span>•</span>
                        <span>{report.testSubject} • {report.testGrade} • {report.testBoard}</span>
                        {report.testChapter && (
                          <>
                            <span>•</span>
                            <span>Chapter {report.testChapter}</span>
                          </>
                        )}
                      </div>
                      
                      {report.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {report.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Eye className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">View Details</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Report Detail Modal */}
        {showReportModal && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowReportModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Flag className="w-6 h-6 text-red-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Report Details</h2>
                  </div>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Report Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block ${STATUS_COLORS[selectedReport.status]}`}>
                      {STATUS_LABELS[selectedReport.status]}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Issue Type</label>
                    <div className="mt-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium inline-block">
                      {ISSUE_TYPE_LABELS[selectedReport.issueType]}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Reported At</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {new Date(selectedReport.reportedAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Test Details</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedReport.testTitle} • {selectedReport.testSubject} • {selectedReport.testGrade} • {selectedReport.testBoard}
                    </div>
                  </div>
                </div>

                {/* Question Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Question Details</h3>
                  <p className="text-gray-800 mb-4">{selectedReport.questionText}</p>
                  
                  <div className="space-y-2">
                    {selectedReport.questionOptions.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <span className="font-medium text-gray-600">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className={`${
                          index === selectedReport.correctAnswer ? 'text-green-600 font-medium' : 
                          index === selectedReport.userAnswer ? 'text-blue-600 font-medium' : 
                          'text-gray-700'
                        }`}>
                          {option}
                        </span>
                        {index === selectedReport.correctAnswer && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Correct
                          </span>
                        )}
                        {index === selectedReport.userAnswer && index !== selectedReport.correctAnswer && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            User Answer
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                {selectedReport.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Student Description</label>
                    <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-900">{selectedReport.description}</p>
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedReport.adminNotes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Admin Notes</label>
                    <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900">{selectedReport.adminNotes}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateReportStatus(selectedReport.id, 'reviewed')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark as Reviewed
                    </button>
                    <button
                      onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark as Resolved
                    </button>
                    <button
                      onClick={() => updateReportStatus(selectedReport.id, 'dismissed')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                  <button
                    onClick={() => deleteReport(selectedReport.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
