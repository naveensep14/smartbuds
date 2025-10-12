'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PDFUploadFormData {
  title: string;
  description: string;
  subject: string;
  grade: string;
  board: string;
  type: string;
  duration: number;
  file: File | null;
  customPrompt: string;
  chapter: number;
  numTests: number;
  questionsPerTest: number;
  startDate: string;
  endDate: string;
}

// Helper function to get next Sunday to Saturday week
const getNextWeekDates = () => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Calculate days until next Sunday
  const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay;
  
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + daysUntilSunday);
  
  const nextSaturday = new Date(nextSunday);
  nextSaturday.setDate(nextSunday.getDate() + 6);
  
  // Format as dd/mm (day/month without year for reusability)
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };
  
  return {
    startDate: formatDate(nextSunday),
    endDate: formatDate(nextSaturday)
  };
};

export default function PDFUploadPage() {
  const router = useRouter();
  const nextWeekDates = getNextWeekDates();
  
  const [formData, setFormData] = useState<PDFUploadFormData>({
    title: '',
    description: '',
    subject: '',
    grade: '',
    board: 'CBSE',
    type: 'coursework',
    duration: 30,
    file: null,
    customPrompt: '',
    chapter: 1,
    numTests: 5,
    questionsPerTest: 10,
    startDate: nextWeekDates.startDate,
    endDate: nextWeekDates.endDate,
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
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
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-adjust settings for weekly tests
      if (field === 'type' && value === 'weekly') {
        newData.numTests = 1;
        newData.questionsPerTest = 25;
        newData.duration = 45;
        // Set default dates for next week
        const nextWeekDates = getNextWeekDates();
        newData.startDate = nextWeekDates.startDate;
        newData.endDate = nextWeekDates.endDate;
      }
      
      // Auto-generate title for weekly tests
      if (field === 'type' && value === 'weekly' && newData.grade && newData.subject) {
        newData.title = `${newData.grade} ${newData.subject} Weekly Test`;
      } else if (field === 'grade' && newData.type === 'weekly' && newData.subject) {
        newData.title = `${value} ${newData.subject} Weekly Test`;
      } else if (field === 'subject' && newData.type === 'weekly' && newData.grade) {
        newData.title = `${newData.grade} ${value} Weekly Test`;
      }
      
      // Auto-generate title for coursework tests
      if (field === 'type' && value === 'coursework' && newData.grade && newData.subject && newData.chapter) {
        newData.title = `${newData.grade} ${newData.subject} - Chapter ${newData.chapter}`;
      } else if (field === 'grade' && newData.type === 'coursework' && newData.subject && newData.chapter) {
        newData.title = `${value} ${newData.subject} - Chapter ${newData.chapter}`;
      } else if (field === 'subject' && newData.type === 'coursework' && newData.grade && newData.chapter) {
        newData.title = `${newData.grade} ${value} - Chapter ${newData.chapter}`;
      } else if (field === 'chapter' && newData.type === 'coursework' && newData.grade && newData.subject) {
        newData.title = `${newData.grade} ${newData.subject} - Chapter ${value}`;
      }
      
      return newData;
    });
    setError('');
  };

  const handleFileUpload = (files: FileList | null) => {
    console.log('📁 [DEBUG] handleFileUpload called with:', files);
    console.log('📁 [DEBUG] Files length:', files?.length);
    console.log('📁 [DEBUG] Test type:', formData.type);
    
    if (!files) return;
    
    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    console.log('📁 [DEBUG] PDF files filtered:', pdfFiles.length);
    console.log('📁 [DEBUG] PDF file names:', pdfFiles.map(f => f.name));
    
    if (pdfFiles.length === 0) {
      setError('Please select PDF files only');
      return;
    }
    
    if (formData.type === 'weekly') {
      // For weekly tests, store multiple files and process one at a time
      console.log('📁 [DEBUG] Setting multiple files for weekly test:', pdfFiles.length);
      setUploadedFiles(pdfFiles);
      setCurrentFileIndex(0);
      setFormData(prev => ({ ...prev, file: pdfFiles[0] }));
    } else {
      // For coursework tests, use single file as before
      console.log('📁 [DEBUG] Setting single file for coursework test');
      setFormData(prev => ({ ...prev, file: pdfFiles[0] }));
    }
    
    setError('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }
    
    // Check file size limit (4.5MB = 4.5 * 1024 * 1024 bytes)
    const maxSizeBytes = 4.5 * 1024 * 1024;
    if (file && file.size >= maxSizeBytes) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File size (${fileSizeMB} MB) exceeds the maximum limit of 4.5 MB. Please compress your PDF or use a smaller file.`);
      return;
    }
    
    const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(2) : '0';
    console.log('📏 [FRONTEND LOG] File size:', fileSizeMB, 'MB - within size limit');
    
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

  const processSingleFile = async (file: File, fileIndex: number, totalFiles: number) => {
    console.log(`🎯 [FRONTEND LOG] Processing file ${fileIndex + 1}/${totalFiles}: ${file.name}`);
    
    // Create FormData for file upload
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('subject', formData.subject);
    uploadData.append('grade', formData.grade);
    uploadData.append('board', formData.board);
    uploadData.append('type', formData.type);
    uploadData.append('duration', formData.duration.toString());
    uploadData.append('customPrompt', formData.customPrompt);
    
    // Add chapter for coursework or dates for weekly tests
    if (formData.type === 'weekly') {
      uploadData.append('startDate', formData.startDate);
      uploadData.append('endDate', formData.endDate);
    } else {
      uploadData.append('chapter', formData.chapter.toString());
    }
    
    uploadData.append('numTests', formData.numTests.toString());
    uploadData.append('questionsPerTest', formData.questionsPerTest.toString());
    
    // Update progress for this file
    const fileProgressStart = (fileIndex / totalFiles) * 100;
    const fileProgressEnd = ((fileIndex + 1) / totalFiles) * 100;
    
    setCurrentStep(`📤 Uploading file ${fileIndex + 1}/${totalFiles}: ${file.name}`);
    setUploadProgress(fileProgressStart + 10);
    addLog(`📤 Uploading file ${fileIndex + 1}/${totalFiles}: ${file.name}`);

    const response = await fetch('/api/admin/upload-pdf', {
      method: 'POST',
      body: uploadData,
    });

    if (!response.ok) {
      let errorMessage = `Failed to process file ${file.name}`;
      try {
        const responseClone = response.clone();
        const errorData = await responseClone.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error('❌ [FRONTEND LOG] Error parsing error response:', e);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log(`✅ [FRONTEND LOG] File ${fileIndex + 1} processed successfully:`, result);
    
    setUploadProgress(fileProgressEnd);
    addLog(`✅ File ${fileIndex + 1}/${totalFiles} processed successfully`);
    
    return result;
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
      customPrompt: formData.customPrompt ? formData.customPrompt.substring(0, 50) + '...' : 'None',
      type: formData.type,
      uploadedFilesCount: uploadedFiles.length
    });
    
    if (formData.type === 'weekly' && uploadedFiles.length === 0) {
      console.error('❌ [FRONTEND LOG] No files selected for weekly test');
      setError('Please select PDF files to upload for weekly test.');
      return;
    }
    
    if (formData.type === 'coursework' && !formData.file) {
      console.error('❌ [FRONTEND LOG] No file selected');
      setError('Please select a PDF file to upload.');
      return;
    }

    // Check file size limits
    const maxSizeBytes = 4.5 * 1024 * 1024;
    const filesToCheck = formData.type === 'weekly' ? uploadedFiles : [formData.file!];
    
    for (const file of filesToCheck) {
      if (file.size >= maxSizeBytes) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        setError(`File "${file.name}" size (${fileSizeMB} MB) exceeds the maximum limit of 4.5 MB. Please compress your PDF or use a smaller file.`);
        return;
      }
    }

    // Validate required fields based on test type
    if (formData.type === 'weekly') {
      if (!formData.subject || !formData.grade || !formData.startDate || !formData.endDate) {
        console.error('❌ [FRONTEND LOG] Missing required fields for weekly test:', {
          subject: formData.subject,
          grade: formData.grade,
          startDate: formData.startDate,
          endDate: formData.endDate
        });
        setError('Please fill in all required fields.');
        return;
      }
    } else {
      if (!formData.subject || !formData.grade || !formData.chapter) {
        console.error('❌ [FRONTEND LOG] Missing required fields for coursework test:', {
          subject: formData.subject,
          grade: formData.grade,
          chapter: formData.chapter
        });
        setError('Please fill in all required fields.');
        return;
      }
    }

    console.log('✅ [FRONTEND LOG] Validation passed, starting upload process');
    setIsUploading(true);
    setUploadProgress(0);
    setCurrentStep('Preparing upload...');
    setError('');
    setLogs([]);
    addLog('🚀 Starting PDF upload and AI processing...');

    try {
      const filesToProcess = formData.type === 'weekly' ? uploadedFiles : [formData.file!];
      const allResults: any[] = [];
      
      // Process files sequentially
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const result = await processSingleFile(file, i, filesToProcess.length);
        allResults.push(result);
      }

      setUploadProgress(100);
      addLog('✅ All files processed successfully');

      // Step 3: AI Analysis (30-50%)
      setCurrentStep('🔍 AI is analyzing PDF content...');
      setUploadProgress(35);
      addLog('🔍 AI is analyzing PDF content...');

      // Get the result from the last processed file
      const result = allResults[allResults.length - 1];
      
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
        type: 'coursework',
        duration: 30,
        file: null,
        customPrompt: '',
        chapter: 1,
        numTests: 5,
        questionsPerTest: 10,
        startDate: '',
        endDate: '',
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
        {/* Navigation */}
        <nav className="mb-6">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <button
              onClick={() => router.push('/admin')}
              className="hover:text-orange-600 transition-colors"
            >
              ← Back to Admin
            </button>
            <span>|</span>
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-orange-600 transition-colors"
            >
              Dashboard
            </button>
            <span>|</span>
            <span className="text-orange-600 font-medium">PDF Upload</span>
          </div>
        </nav>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📚 Upload PDF to Generate Tests
            </h1>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              formData.type === 'weekly' 
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}>
              <span className="mr-2">
                {formData.type === 'weekly' ? '📅' : '📖'}
              </span>
              {formData.type === 'weekly' ? 'Weekly Test Mode' : 'Coursework Test Mode'}
            </div>
          </div>

          {/* Test Type Information */}
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            formData.type === 'weekly' 
              ? 'bg-blue-50 border-blue-400' 
              : 'bg-green-50 border-green-400'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className={`w-5 h-5 mt-0.5 ${
                  formData.type === 'weekly' ? 'text-blue-600' : 'text-green-600'
                }`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  formData.type === 'weekly' ? 'text-blue-800' : 'text-green-800'
                }`}>
                  {formData.type === 'weekly' ? 'Weekly Test Configuration' : 'Coursework Test Configuration'}
                </h3>
                <div className={`mt-1 text-sm ${
                  formData.type === 'weekly' ? 'text-blue-700' : 'text-green-700'
                }`}>
                  {formData.type === 'weekly' ? (
                    <ul className="list-disc list-inside space-y-1">
                      <li>Upload multiple PDF files (one at a time)</li>
                      <li>Each PDF generates exactly 1 test</li>
                      <li>Default: 25 questions per test, 45 minutes duration</li>
                      <li>Set start and end dates for test availability</li>
                      <li>Perfect for weekly assessments and practice tests</li>
                    </ul>
                  ) : (
                    <ul className="list-disc list-inside space-y-1">
                      <li>Upload a single PDF file</li>
                      <li>Generate multiple tests from the same content</li>
                      <li>Customizable: 1-10 tests, 5-50 questions per test</li>
                      <li>Specify chapter number for organization</li>
                      <li>Perfect for comprehensive coursework and study materials</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Test Type Selection - First Priority */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🎯 Choose Test Type First
              </h2>
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Type
                </label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      formData.type === 'weekly' 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-green-300 bg-green-50'
                    }`}
                  >
                    <option value="coursework">📖 Coursework Tests</option>
                    <option value="weekly">📅 Weekly Tests</option>
                  </select>
                  <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${
                    formData.type === 'weekly' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {formData.type === 'weekly' ? '📅' : '📖'}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This determines how many files you can upload and the default settings
                </p>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.type === 'weekly' ? 'PDF Files *' : 'PDF File *'}
              </label>
              
              {formData.type === 'weekly' ? (
                /* Weekly Tests - Drag and Drop Multiple Files */
                <div 
                  className="border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 rounded-lg p-6 text-center transition-colors"
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = e.dataTransfer.files;
                    handleFileUpload(files);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => e.preventDefault()}
                >
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-blue-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Drop multiple PDF files here or click to select</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      You can select multiple files at once
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    accept=".pdf"
                    multiple={true}
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  
                  {/* File size limit badge */}
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Max 4.5MB each
                    </span>
                  </div>
                </div>
              ) : (
                /* Coursework Tests - Simple File Input */
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  {/* File size limit badge */}
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Max 4.5MB
                    </span>
                  </div>
                </div>
              )}
              
              {/* Display uploaded files */}
              {formData.type === 'weekly' && uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Uploaded Files ({uploadedFiles.length})
                  </h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium text-green-800">
                            {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = uploadedFiles.filter((_, i) => i !== index);
                            setUploadedFiles(newFiles);
                            if (newFiles.length > 0) {
                              setFormData(prev => ({ ...prev, file: newFiles[0] }));
                            } else {
                              setFormData(prev => ({ ...prev, file: null }));
                            }
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {formData.type === 'coursework' && formData.file && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-green-800">
                      {formData.file.name} ({(formData.file.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}
              
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-500">
                  {formData.type === 'weekly' 
                    ? 'Upload multiple PDF files to generate one test per file' 
                    : 'Upload a PDF file to extract content and generate tests'
                  }
                </p>
                
                {/* PDF compression help */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        <strong>Need to compress your PDF?</strong> Use our recommended tool: 
                        <a 
                          href="https://bigpdf.11zon.com/en/compress-pdf/extreme-compress-pdf.php" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline ml-1"
                        >
                          BigPDF Compressor
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* File size indicator */}
                {formData.file && (
                  <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    formData.file.size >= 4.5 * 1024 * 1024 
                      ? 'bg-red-100 text-red-800 border border-red-200' 
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    <svg className={`w-4 h-4 mr-2 ${formData.file.size >= 4.5 * 1024 * 1024 ? 'text-red-600' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      {formData.file.size >= 4.5 * 1024 * 1024 ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      )}
                    </svg>
                    File Size: {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                    {formData.file.size >= 4.5 * 1024 * 1024 ? ' (Too Large)' : ' (OK)'}
                  </div>
                )}
              </div>
            </div>

            {/* Test Generation Options */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎯 Test Generation Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Tests
                  </label>
                  <select
                    value={formData.numTests}
                    onChange={(e) => handleInputChange('numTests', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={formData.type === 'weekly'}
                  >
                    <option value={1}>1 Test</option>
                    <option value={2}>2 Tests</option>
                    <option value={3}>3 Tests</option>
                    <option value={4}>4 Tests</option>
                    <option value={5}>5 Tests</option>
                    <option value={6}>6 Tests</option>
                    <option value={7}>7 Tests</option>
                    <option value={8}>8 Tests</option>
                    <option value={9}>9 Tests</option>
                    <option value={10}>10 Tests</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.type === 'weekly' 
                      ? 'Weekly tests generate 1 test per PDF file' 
                      : 'How many different tests to generate from the PDF'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Questions per Test
                  </label>
                  <select
                    value={formData.questionsPerTest}
                    onChange={(e) => handleInputChange('questionsPerTest', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={8}>8 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={12}>12 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={25}>25 Questions</option>
                    <option value={30}>30 Questions</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Number of questions in each generated test
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Total Questions:</strong> {formData.numTests * formData.questionsPerTest} questions across {formData.numTests} tests
                </p>
              </div>
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


            {/* Auto-generated Test Title Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Title (Auto-generated)
              </label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                {formData.title || 'Title will be generated automatically'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.type === 'weekly' 
                  ? `Format: ${formData.grade || 'Grade'} ${formData.subject || 'Subject'} Weekly Test`
                  : `Format: ${formData.grade || 'Grade'} ${formData.subject || 'Subject'} - Chapter ${formData.chapter || 'X'}`
                }
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

              {formData.type === 'weekly' ? (
                /* Weekly Tests - Date Range */
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date (dd/mm) *
                    </label>
                    <input
                      type="text"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      placeholder="dd/mm (e.g., 15/03)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: day/month (e.g., 15/03) - reusable across years
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (dd/mm) *
                    </label>
                    <input
                      type="text"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      placeholder="dd/mm (e.g., 21/03)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: day/month (e.g., 21/03) - reusable across years
                    </p>
                  </div>
                </>
              ) : (
                /* Coursework Tests - Chapter */
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
              )}
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
                {formData.type === 'weekly' && (
                  <p className="text-sm text-gray-500 mt-1">
                    Default: 45 minutes for weekly tests
                  </p>
                )}
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
