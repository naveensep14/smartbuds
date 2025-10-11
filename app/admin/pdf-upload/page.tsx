'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PDFUploadFormData {
  title: string;
  description: string;
  subject: string;
  grade: string;
  board: string;
  duration: number;
  file: File | null;
  customPrompt: string;
  chapter: number;
}

export default function PDFUploadPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PDFUploadFormData>({
    title: '',
    description: '',
    subject: '',
    grade: '',
    board: 'CBSE',
    duration: 30,
    file: null,
    customPrompt: '',
    chapter: 1,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [currentConcept, setCurrentConcept] = useState('');
  const [generatedTests, setGeneratedTests] = useState<any[]>([]);
  const [selectedTests, setSelectedTests] = useState<Set<number>>(new Set());
  const [editingTest, setEditingTest] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{testIndex: number, questionIndex: number} | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof PDFUploadFormData, value: string | number | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }
    
    // Check file size (50MB limit for File API support)
    if (file && file.size > 50 * 1024 * 1024) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`PDF file is too large (${fileSizeMB} MB). Please use a PDF file smaller than 50 MB.`);
      return;
    }
    
    handleInputChange('file', file);
    setError(''); // Clear any previous errors
  };

  const handleTestSelection = (index: number) => {
    const newSelected = new Set(selectedTests);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTests(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTests.size === generatedTests.length) {
      setSelectedTests(new Set());
    } else {
      setSelectedTests(new Set(generatedTests.map((_, index) => index)));
    }
  };

  const handleClearAll = () => {
    setGeneratedTests([]);
    setSelectedTests(new Set());
    setEditingTest(null);
    setEditingQuestion(null);
    setLogs([]);
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleEditTest = (testIndex: number) => {
    setEditingTest(testIndex);
  };

  const handleEditQuestion = (testIndex: number, questionIndex: number) => {
    setEditingQuestion({ testIndex, questionIndex });
  };

  const handleUpdateTest = (testIndex: number, updatedTest: any) => {
    setGeneratedTests(prev => prev.map((test, index) => 
      index === testIndex ? updatedTest : test
    ));
    setEditingTest(null);
  };

  const handleUpdateQuestion = (testIndex: number, questionIndex: number, updatedQuestion: any) => {
    setGeneratedTests(prev => prev.map((test, index) => 
      index === testIndex 
        ? {
            ...test,
            questions: test.questions.map((q: any, qIndex: number) => 
              qIndex === questionIndex ? updatedQuestion : q
            )
          }
        : test
    ));
    setEditingQuestion(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    console.log('🎯 [FRONTEND LOG] Submit handler started');
    console.log('🎯 [FRONTEND LOG] Form data:', {
      file: formData.file?.name || 'No file',
      fileSize: formData.file?.size || 'No file',
      subject: formData.subject,
      grade: formData.grade,
      chapter: formData.chapter,
      board: formData.board,
      duration: formData.duration,
      customPrompt: formData.customPrompt ? formData.customPrompt.substring(0, 50) + '...' : 'None'
    });
    
    if (!formData.file) {
      console.error('❌ [FRONTEND LOG] No file selected');
      setError('Please select a PDF file to upload.');
      return;
    }

    if (!formData.subject || !formData.grade || !formData.chapter) {
      console.error('❌ [FRONTEND LOG] Missing required fields:', {
        subject: formData.subject,
        grade: formData.grade,
        chapter: formData.chapter
      });
      setError('Please fill in all required fields.');
      return;
    }

    console.log('✅ [FRONTEND LOG] Validation passed, starting upload process');
    setIsUploading(true);
    setUploadProgress(0);
    setCurrentStep('Preparing upload...');
    setError('');
    setLogs([]);
    addLog('🚀 Starting PDF upload and AI processing...');

    try {
      // Step 1: Prepare upload (0-15%)
      setCurrentStep('📁 Preparing PDF file for upload...');
      setUploadProgress(5);
      addLog('📁 Preparing PDF file for upload...');
      
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      uploadData.append('subject', formData.subject);
      uploadData.append('grade', formData.grade);
      uploadData.append('board', formData.board);
      uploadData.append('duration', formData.duration.toString());
      uploadData.append('customPrompt', formData.customPrompt);
      uploadData.append('chapter', formData.chapter.toString());
      
      setUploadProgress(15);

      // Step 2: Upload file (15-30%)
      setCurrentStep('📤 Uploading PDF file to server...');
      setUploadProgress(20);
      addLog('📤 Uploading PDF file to server...');

      // Upload and process PDF
      console.log('🚀 [FRONTEND LOG] Starting fetch request to /api/admin/upload-pdf');
      const fileEntry = uploadData.get('file');
      const fileSize = fileEntry instanceof File ? fileEntry.size : 'No file';
      console.log('🚀 [FRONTEND LOG] FormData size:', fileSize);
      console.log('🚀 [FRONTEND LOG] FormData entries:', Array.from(uploadData.entries()).map(([key, value]) => 
        key === 'file' && value instanceof File ? [key, `File: ${value.name} (${value.size} bytes)`] : [key, value]
      ));
      
      const response = await fetch('/api/admin/upload-pdf', {
        method: 'POST',
        body: uploadData,
      });

      console.log('📡 [FRONTEND LOG] Response received:', response.status, response.statusText);
      console.log('📡 [FRONTEND LOG] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = 'Failed to process PDF';
        try {
          // Clone the response to avoid "body stream already read" error
          const responseClone = response.clone();
          const errorData = await responseClone.json();
          errorMessage = errorData.error || errorMessage;
          console.error('🚨 [FRONTEND LOG] Error response JSON:', errorData);
        } catch (jsonError) {
          // If response is not JSON (e.g., "Request Entity Too Large"), use status text
          errorMessage = response.statusText || errorMessage;
          console.error('🚨 [FRONTEND LOG] Non-JSON error response:', response.statusText);
          try {
            // Clone the response to avoid "body stream already read" error
            const responseClone = response.clone();
            const responseText = await responseClone.text();
            console.error('🚨 [FRONTEND LOG] Response text:', responseText);
          } catch (textError) {
            console.error('🚨 [FRONTEND LOG] Could not read response text:', textError instanceof Error ? textError.message : 'Unknown error');
          }
        }
        throw new Error(errorMessage);
      }

      setUploadProgress(30);
      addLog('✅ PDF uploaded successfully');

      // Step 3: AI Analysis (30-50%)
      setCurrentStep('🔍 AI is analyzing PDF content...');
      setUploadProgress(35);
      addLog('🔍 AI is analyzing PDF content...');

      // Clone the response to avoid "body stream already read" error
      const responseClone = response.clone();
      const result = await responseClone.json();
      
      setUploadProgress(50);

      // Step 4: AI Generation (50-90%)
      setCurrentStep('🤖 AI is generating high-quality questions...');
      setUploadProgress(60);
      addLog('🤖 AI is generating high-quality questions...');
      
      // More accurate progress simulation based on actual concepts
      const totalConcepts = result.concepts ? result.concepts.length : 3;
      const progressPerConcept = 30 / totalConcepts; // 30% divided by number of concepts
      
      // Simulate concept-by-concept progress
      let currentConceptIndex = 0;
      const conceptInterval = setInterval(() => {
        if (currentConceptIndex < totalConcepts) {
          const conceptName = result.concepts ? result.concepts[currentConceptIndex] : `Concept ${currentConceptIndex + 1}`;
          setCurrentConcept(`Processing: ${conceptName}`);
          setUploadProgress(60 + (currentConceptIndex * progressPerConcept));
          addLog(`📚 Processing concept: ${conceptName}`);
          currentConceptIndex++;
        } else {
          clearInterval(conceptInterval);
          setCurrentConcept('Finalizing questions...');
          setUploadProgress(90);
          addLog('🔧 Finalizing questions...');
        }
      }, 800); // Update every 800ms per concept

      // Wait a bit to show AI generation progress
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGeneratedTests(result.tests);
      // Auto-select all tests by default
      setSelectedTests(new Set(result.tests.map((_: any, index: number) => index)));
      setCurrentStep('✅ Tests generated successfully!');
      setCurrentConcept('');
      setUploadProgress(100);
      addLog(`✅ Successfully generated ${result.tests.length} tests with ${result.tests.reduce((total: number, test: any) => total + test.questions.length, 0)} total questions`);
      
      clearInterval(conceptInterval);
      
      // Show success message
      setTimeout(() => {
        setCurrentStep(`🎉 Generated ${result.tests.length} high-quality tests with ${result.tests.reduce((total: number, test: any) => total + test.questions.length, 0)} total questions!`);
      }, 1000);

      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        grade: '',
        board: 'CBSE',
        duration: 30,
        file: null,
        customPrompt: '',
        chapter: 1,
      });

    } catch (err) {
      console.error('🚨 [FRONTEND LOG] Upload error caught:');
      console.error('🚨 [FRONTEND LOG] Error message:', err instanceof Error ? err.message : 'Unknown error');
      console.error('🚨 [FRONTEND LOG] Error type:', err instanceof Error ? err.name : 'Unknown');
      console.error('🚨 [FRONTEND LOG] Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      console.error('🚨 [FRONTEND LOG] Full error object:', err);
      
      setError(err instanceof Error ? err.message : 'An error occurred while processing the PDF');
    } finally {
      console.log('🏁 [FRONTEND LOG] Upload process finished, setting isUploading to false');
      setIsUploading(false);
    }
  };

  const handleSaveTests = async () => {
    if (selectedTests.size === 0) {
      setError('Please select at least one test to save.');
      return;
    }

    const testsToSave = Array.from(selectedTests).map(index => generatedTests[index]);

    try {
      const response = await fetch('/api/admin/save-generated-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tests: testsToSave }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save tests');
      }

      alert(`Successfully saved ${testsToSave.length} tests to the database!`);
      handleClearAll();
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tests');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            📚 Upload PDF to Generate Tests
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF File *
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload a PDF file (max 50MB) to extract content and generate tests
              </p>
            </div>

            {/* Custom Prompt Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Prompt (Optional)
              </label>
              <textarea
                value={formData.customPrompt}
                onChange={(e) => handleInputChange('customPrompt', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={4}
                placeholder="Add custom instructions for AI test generation (e.g., 'Focus on practical applications', 'Include word problems', 'Make questions more challenging')"
              />
              <p className="text-sm text-gray-500 mt-1">
                Optional: Provide specific instructions to customize how AI generates questions from the PDF
              </p>
            </div>

            {/* Auto-generated Title and Description Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">🤖 AI-Powered Test Generation</h3>
              <p className="text-sm text-blue-700">
                High-quality tests will be generated using AI based on PDF content. Questions are accurate, educational, and appropriate for the selected grade level.
                {formData.customPrompt && (
                  <span className="block mt-2 font-medium">
                    ✨ Custom instructions will be applied: &quot;{formData.customPrompt.substring(0, 50)}...&quot;
                  </span>
                )}
              </p>
            </div>

            {/* Subject and Grade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="Social Studies">Social Studies</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Grade</option>
                  <option value="1st Grade">1st Grade</option>
                  <option value="2nd Grade">2nd Grade</option>
                  <option value="3rd Grade">3rd Grade</option>
                  <option value="4th Grade">4th Grade</option>
                  <option value="5th Grade">5th Grade</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter *
                </label>
                <select
                  value={formData.chapter}
                  onChange={(e) => handleInputChange('chapter', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(chapter => (
                    <option key={chapter} value={chapter}>
                      Chapter {chapter}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Board and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Board
                </label>
                <select
                  value={formData.board}
                  onChange={(e) => handleInputChange('board', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="US">US</option>
                  <option value="IB">IB</option>
                  <option value="IGCSE">IGCSE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  min="5"
                  max="120"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-blue-800 font-medium text-lg">{currentStep}</span>
                    {currentConcept && (
                      <div className="text-blue-600 text-sm mt-1">{currentConcept}</div>
                    )}
                  </div>
                  <span className="text-blue-600 font-bold text-lg">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                
                {/* Detailed Progress Steps */}
                <div className="space-y-2 text-sm text-blue-700">
                  <div className={`flex items-center ${uploadProgress >= 15 ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{uploadProgress >= 15 ? '✅' : '⏳'}</span>
                    Preparing PDF file for upload
                  </div>
                  <div className={`flex items-center ${uploadProgress >= 30 ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{uploadProgress >= 30 ? '✅' : '⏳'}</span>
                    Uploading PDF to server
                  </div>
                  <div className={`flex items-center ${uploadProgress >= 50 ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{uploadProgress >= 50 ? '✅' : '⏳'}</span>
                    AI analyzing PDF content
                  </div>
                  <div className={`flex items-center ${uploadProgress >= 90 ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{uploadProgress >= 90 ? '✅' : '⏳'}</span>
                    AI generating high-quality questions
                  </div>
                  <div className={`flex items-center ${uploadProgress >= 100 ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{uploadProgress >= 100 ? '✅' : '⏳'}</span>
                    Finalizing tests
                  </div>
                </div>
                
                {/* AI Generation Info */}
                {uploadProgress >= 60 && uploadProgress < 100 && (
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                      <div>
                        <p className="text-sm text-blue-800">
                          <strong>🚀 Fast AI Processing:</strong> Gemini AI is analyzing the PDF directly and generating educational questions.
                        </p>
                        {currentConcept && (
                          <p className="text-xs text-blue-700 mt-1">
                            <strong>Current:</strong> {currentConcept}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Logs Viewer */}
                {logs.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-green-400">📋 Live Processing Logs</h4>
                      <span className="text-xs text-gray-400">{logs.length} entries</span>
                    </div>
                    <div className="bg-black rounded p-3 max-h-40 overflow-y-auto">
                      <div className="space-y-1">
                        {logs.slice(-10).map((log, index) => (
                          <div key={index} className="text-xs text-green-300 font-mono">
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Success Message */}
                {uploadProgress === 100 && currentStep.includes('🎉') && (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>🎉 Success!</strong> All tests have been generated successfully. 
                      Review and select the tests you want to save to the database.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? '🤖 AI Generating Tests...' : '🤖 Generate AI Tests from PDF'}
            </button>
          </form>

          {/* Generated Tests Review */}
          {generatedTests.length > 0 && (
            <div className="mt-8 border-t pt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Review Generated Tests ({generatedTests.length})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200"
                  >
                    {selectedTests.size === generatedTests.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="space-y-6 mb-6">
                {generatedTests.map((test, index) => (
                  <div 
                    key={index} 
                    className={`border-2 rounded-xl shadow-lg transition-all ${
                      selectedTests.has(index) 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {/* Test Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <input
                            type="checkbox"
                            checked={selectedTests.has(index)}
                            onChange={() => handleTestSelection(index)}
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{test.title}</h3>
                            <button
                              onClick={() => handleEditTest(index)}
                              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              ✏️ Edit Test
                            </button>
                          </div>
                          <p className="text-gray-600 mb-3">{test.description}</p>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span>📊 {test.questions.length} questions</span>
                            <span>⏱️ {test.duration} minutes</span>
                            <span>🎯 {test.board} board</span>
                            <span>📚 {test.subject}</span>
                            <span>🎓 {test.grade}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Questions Section */}
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Questions Preview</h4>
                      <div className="space-y-4">
                        {test.questions.map((question: any, qIndex: number) => (
                          <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-md font-medium text-gray-800">
                                  Question {qIndex + 1}
                                </h5>
                                <button
                                  onClick={() => handleEditQuestion(index, qIndex)}
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                                >
                                  ✏️ Edit
                                </button>
                              </div>
                              <p className="text-gray-700 mb-3">{question.question}</p>
                            </div>
                            
                            <div className="space-y-2">
                              {question.options.map((option: any, optionIndex: number) => (
                                <div 
                                  key={optionIndex} 
                                  className={`flex items-center space-x-3 p-2 rounded-lg border transition-all ${
                                    question.correctAnswer === optionIndex 
                                      ? 'border-green-500 bg-green-50' 
                                      : 'border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="radio"
                                      checked={question.correctAnswer === optionIndex}
                                      readOnly
                                      className="w-4 h-4 text-green-600"
                                    />
                                    <span className="text-sm font-medium text-gray-600 min-w-[50px]">
                                      {String.fromCharCode(65 + optionIndex)}:
                                    </span>
                                  </div>
                                  <span className={`text-sm ${
                                    question.correctAnswer === optionIndex 
                                      ? 'text-green-800 font-medium' 
                                      : 'text-gray-700'
                                  }`}>
                                    {option}
                                  </span>
                                  {question.correctAnswer === optionIndex && (
                                    <div className="flex items-center space-x-1 text-green-600 ml-auto">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span className="text-xs font-medium">Correct</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            {question.explanation && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  <strong>Explanation:</strong> {question.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Selected: {selectedTests.size} of {generatedTests.length} tests
                    </span>
                    {selectedTests.size > 0 && (
                      <span className="ml-2 text-sm text-green-600">
                        ({Array.from(selectedTests).map(i => generatedTests[i].questions.length).reduce((a, b) => a + b, 0)} total questions)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSaveTests}
                  disabled={selectedTests.size === 0}
                  className="bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Selected Tests ({selectedTests.size})
                </button>
                <button
                  onClick={handleClearAll}
                  className="bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

          {/* Edit Test Modal */}
          {editingTest !== null && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Edit Test</h2>
                  <button
                    onClick={() => setEditingTest(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Title
                      </label>
                      <input
                        type="text"
                        value={generatedTests[editingTest]?.title || ''}
                        onChange={(e) => {
                          const updatedTest = { ...generatedTests[editingTest], title: e.target.value };
                          setGeneratedTests(prev => prev.map((test, index) => 
                            index === editingTest ? updatedTest : test
                          ));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={generatedTests[editingTest]?.description || ''}
                        onChange={(e) => {
                          const updatedTest = { ...generatedTests[editingTest], description: e.target.value };
                          setGeneratedTests(prev => prev.map((test, index) => 
                            index === editingTest ? updatedTest : test
                          ));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setEditingTest(null)}
                        className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setEditingTest(null)}
                        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Question Modal */}
          {editingQuestion && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Edit Question</h2>
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6">
                  {(() => {
                    const test = generatedTests[editingQuestion.testIndex];
                    const question = test?.questions[editingQuestion.questionIndex];
                    if (!question) return null;

                    return (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question Text
                          </label>
                          <textarea
                            value={question.question}
                            onChange={(e) => {
                              const updatedQuestion = { ...question, question: e.target.value };
                              handleUpdateQuestion(editingQuestion.testIndex, editingQuestion.questionIndex, updatedQuestion);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Answer Options
                          </label>
                          <div className="space-y-2">
                            {question.options.map((option: string, optionIndex: number) => (
                              <div key={optionIndex} className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-600 min-w-[60px]">
                                  {String.fromCharCode(65 + optionIndex)}:
                                </span>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const updatedOptions = [...question.options];
                                    updatedOptions[optionIndex] = e.target.value;
                                    const updatedQuestion = { ...question, options: updatedOptions };
                                    handleUpdateQuestion(editingQuestion.testIndex, editingQuestion.questionIndex, updatedQuestion);
                                  }}
                                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                                    question.correctAnswer === optionIndex 
                                      ? 'border-green-500 bg-green-50' 
                                      : 'border-gray-300'
                                  }`}
                                />
                                <input
                                  type="radio"
                                  name={`correct${editingQuestion.testIndex}-${editingQuestion.questionIndex}`}
                                  checked={question.correctAnswer === optionIndex}
                                  onChange={() => {
                                    const updatedQuestion = { ...question, correctAnswer: optionIndex };
                                    handleUpdateQuestion(editingQuestion.testIndex, editingQuestion.questionIndex, updatedQuestion);
                                  }}
                                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-xs text-gray-500">Correct</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Explanation
                          </label>
                          <textarea
                            value={question.explanation || ''}
                            onChange={(e) => {
                              const updatedQuestion = { ...question, explanation: e.target.value };
                              handleUpdateQuestion(editingQuestion.testIndex, editingQuestion.questionIndex, updatedQuestion);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            rows={2}
                            placeholder="Add explanation for the correct answer..."
                          />
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={() => setEditingQuestion(null)}
                            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => setEditingQuestion(null)}
                            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
