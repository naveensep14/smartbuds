'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TestCoverage {
  [subject: string]: {
    [board: string]: {
      [grade: string]: number;
    };
  };
}

interface CoverageData {
  coverage: TestCoverage;
  subjects: string[];
  grades: string[];
  boards: string[];
  totalTests: number;
}

export default function TestCoveragePage() {
  const router = useRouter();
  const [data, setData] = useState<CoverageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    fetchCoverageData();
  }, []);

  const fetchCoverageData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/test-coverage');
      
      if (!response.ok) {
        throw new Error('Failed to fetch test coverage data');
      }

      const coverageData = await response.json();
      setData(coverageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error || 'Failed to load data'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter data based on selections
  const filteredSubjects = selectedSubject === 'all' 
    ? data.subjects 
    : [selectedSubject];

  const filteredBoards = selectedBoard === 'all'
    ? data.boards
    : [selectedBoard];

  const getTestCount = (subject: string, board: string, grade: string): number => {
    return data.coverage[subject]?.[board]?.[grade] || 0;
  };

  const getTotalForSubjectBoard = (subject: string, board: string): number => {
    let total = 0;
    data.grades.forEach(grade => {
      total += getTestCount(subject, board, grade);
    });
    return total;
  };

  const getCellColor = (count: number): string => {
    if (count === 0) return 'bg-red-100 text-red-700 border-red-300';
    if (count < 20) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (count <= 30) return 'bg-green-100 text-green-800 border-green-400';
    return 'bg-blue-200 text-blue-900 border-blue-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Navigation */}
        <nav className="mb-6">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <button
              onClick={() => router.push('/admin')}
              className="hover:text-navy transition-colors font-medium"
            >
              ← Back to Admin
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-navy transition-colors font-medium"
            >
              Dashboard
            </button>
            <span className="text-gray-400">|</span>
            <span className="text-navy font-semibold">Test Coverage</span>
          </div>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📊 Test Coverage Dashboard
              </h1>
              <p className="text-gray-600">
                View test availability across all subjects, boards, and grades
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-navy">{data.totalTests}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
              >
                <option value="all">All Subjects</option>
                {data.subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Board
              </label>
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
              >
                <option value="all">All Boards</option>
                {data.boards.map(board => (
                  <option key={board} value={board}>{board}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 border-3 border-red-400 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-red-800 font-bold text-base">0</span>
              </div>
              <div>
                <div className="text-gray-900 font-semibold">No tests</div>
                <div className="text-gray-600 text-sm">(0)</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 border-3 border-yellow-400 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-yellow-900 font-bold text-xs">1-19</span>
              </div>
              <div>
                <div className="text-gray-900 font-semibold">Few tests</div>
                <div className="text-gray-600 text-sm">(1-19)</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 border-3 border-green-500 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-green-900 font-bold text-xs">20-30</span>
              </div>
              <div>
                <div className="text-gray-900 font-semibold">Good coverage</div>
                <div className="text-gray-600 text-sm">(20-30)</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-200 border-3 border-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-blue-900 font-bold text-sm">31+</span>
              </div>
              <div>
                <div className="text-gray-900 font-semibold">Excellent</div>
                <div className="text-gray-600 text-sm">(31+)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Coverage Grid - Comprehensive View */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-navy px-6 py-4">
            <h2 className="text-xl font-bold text-white">Complete Test Coverage Matrix</h2>
            <p className="text-sm text-gray-300 mt-1">All subjects, boards, and grades in one view</p>
          </div>

          <div className="p-6 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-700 sticky left-0 bg-gray-50 z-10">
                    Subject
                  </th>
                  <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-700">
                    Board
                  </th>
                  {data.grades.map(grade => (
                    <th key={grade} className="border-2 border-gray-300 px-3 py-3 text-center text-sm font-bold text-gray-700 min-w-[100px]">
                      {grade}
                    </th>
                  ))}
                  <th className="border-2 border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-700 bg-blue-50">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((subject, subjectIndex) => (
                  filteredBoards.map((board, boardIndex) => {
                    const total = getTotalForSubjectBoard(subject, board);
                    const isFirstBoardRow = boardIndex === 0;
                    
                    return (
                      <tr key={`${subject}-${board}`} className="hover:bg-gray-50 transition-colors">
                        {isFirstBoardRow && (
                          <td 
                            rowSpan={filteredBoards.length}
                            className="border-2 border-gray-300 px-4 py-3 text-sm font-bold text-gray-900 bg-gradient-to-r from-blue-50 to-white sticky left-0 z-10"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              {subject}
                            </div>
                          </td>
                        )}
                        <td className="border-2 border-gray-300 px-4 py-3 text-sm font-semibold text-gray-800 bg-gray-50">
                          {board}
                        </td>
                        {data.grades.map(grade => {
                          const count = getTestCount(subject, board, grade);
                          return (
                            <td key={grade} className="border-2 border-gray-300 px-3 py-3 text-center">
                              <div className={`inline-flex items-center justify-center px-3 py-2 rounded-lg font-bold text-base border-2 min-w-[60px] ${getCellColor(count)}`}>
                                {count}
                              </div>
                            </td>
                          );
                        })}
                        <td className="border-2 border-gray-300 px-4 py-3 text-center bg-blue-50">
                          <span className="inline-flex items-center justify-center px-3 py-2 rounded-lg font-bold text-base bg-blue-100 text-blue-800 border-2 border-blue-200 min-w-[60px]">
                            {total}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Breakdown by Subject */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Detailed Breakdown</h2>
          <div className="space-y-6">
            {filteredSubjects.map(subject => (
              <div key={subject} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-navy to-primary-700 px-6 py-4">
                  <h3 className="text-xl font-bold text-white">{subject}</h3>
                </div>

                <div className="p-6">
                  {filteredBoards.map(board => {
                    const total = getTotalForSubjectBoard(subject, board);
                    
                    return (
                      <div key={board} className="mb-6 last:mb-0">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {board} Board
                          </h4>
                          <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            {total} total tests
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                  Grade
                                </th>
                                <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                  Test Count
                                </th>
                                <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.grades.map(grade => {
                                const count = getTestCount(subject, board, grade);
                                
                                return (
                                  <tr key={grade} className="hover:bg-gray-50 transition-colors">
                                    <td className="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900">
                                      {grade}
                                    </td>
                                    <td className={`border border-gray-200 px-4 py-3 text-center`}>
                                      <span className={`inline-block px-4 py-2 rounded-lg font-bold text-lg border-2 ${getCellColor(count)}`}>
                                        {count}
                                      </span>
                                    </td>
                                    <td className="border border-gray-200 px-4 py-3 text-center text-sm">
                                      {count === 0 ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 font-medium">
                                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                          </svg>
                                          Missing
                                        </span>
                                      ) : count < 20 ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                          </svg>
                                          Few
                                        </span>
                                      ) : count <= 30 ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                          </svg>
                                          Good
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                          Excellent
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-navy to-primary-700 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push('/admin/pdf-upload')}
              className="bg-white text-navy px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md"
            >
              📚 Upload PDF & Generate Tests
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="bg-white text-navy px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md"
            >
              🔙 Back to Admin Panel
            </button>
            <button
              onClick={fetchCoverageData}
              className="bg-white bg-opacity-20 text-white border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-colors"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

