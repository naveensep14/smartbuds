import { Test, TestResult } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  TESTS: 'successbuds_tests',
  RESULTS: 'successbuds_results',
} as const;

// Test Storage
export const testStorage = {
  // Get all tests
  getAll: (): Test[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TESTS);
      if (!stored) return [];
      
      const tests = JSON.parse(stored);
      return tests.map((test: any) => ({
        ...test,
        createdAt: new Date(test.createdAt),
        updatedAt: new Date(test.updatedAt),
        questions: test.questions.map((q: any) => ({
          ...q,
          id: q.id.toString()
        }))
      }));
    } catch (error) {
      console.error('Error loading tests:', error);
      return [];
    }
  },

  // Save a test
  save: (test: Test): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const tests = testStorage.getAll();
      const existingIndex = tests.findIndex(t => t.id === test.id);
      
      if (existingIndex >= 0) {
        // Update existing test
        tests[existingIndex] = {
          ...test,
          updatedAt: new Date()
        };
      } else {
        // Add new test
        tests.push({
          ...test,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(tests));
    } catch (error) {
      console.error('Error saving test:', error);
    }
  },

  // Delete a test
  delete: (testId: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const tests = testStorage.getAll();
      const filteredTests = tests.filter(t => t.id !== testId);
      localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(filteredTests));
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  },

  // Get a single test
  getById: (testId: string): Test | null => {
    const tests = testStorage.getAll();
    return tests.find(t => t.id === testId) || null;
  }
};

// Results Storage
export const resultStorage = {
  // Get all results
  getAll: (): TestResult[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RESULTS);
      if (!stored) return [];
      
      const results = JSON.parse(stored);
      return results.map((result: any) => ({
        ...result,
        completedAt: new Date(result.completedAt)
      }));
    } catch (error) {
      console.error('Error loading results:', error);
      return [];
    }
  },

  // Save a result
  save: (result: TestResult): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const results = resultStorage.getAll();
      results.push({
        ...result,
        id: Date.now().toString(),
        completedAt: new Date()
      });
      
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
    } catch (error) {
      console.error('Error saving result:', error);
    }
  },

  // Get results by test ID
  getByTestId: (testId: string): TestResult[] => {
    const results = resultStorage.getAll();
    return results.filter(r => r.testId === testId);
  },

  // Get results by student name
  getByStudent: (studentName: string): TestResult[] => {
    const results = resultStorage.getAll();
    return results.filter(r => r.studentName === studentName);
  }
};

// Initialize with sample data if empty
export const initializeStorage = () => {
  if (typeof window === 'undefined') return;
  
  // Initialize tests if empty
  const existingTests = testStorage.getAll();
  if (existingTests.length === 0) {
    const sampleTests: Test[] = [
      {
        id: '1',
        title: 'ICSE 3rd Grade Science - August 2025',
        description: 'Comprehensive science test covering various topics for 3rd grade students',
        subject: 'Science',
        grade: '3rd Grade',
        board: 'ICSE',
        type: 'coursework',
        duration: 30,
        questions: [
          {
            id: '1',
            text: 'Which of the following is a living thing?',
            options: ['Stone', 'Tree', 'Car', 'Book'],
            correctAnswer: 1,
            explanation: 'Trees are living things as they grow, reproduce, and respond to their environment.'
          },
          {
            id: '2',
            text: 'What do plants need to make their own food?',
            options: ['Water and soil', 'Sunlight and water', 'Air and food', 'Soil and air'],
            correctAnswer: 1,
            explanation: 'Plants use sunlight and water to make their own food through photosynthesis.'
          },
          {
            id: '3',
            text: 'Which part of the plant absorbs water from the soil?',
            options: ['Leaves', 'Stem', 'Roots', 'Flowers'],
            correctAnswer: 2,
            explanation: 'Roots absorb water and nutrients from the soil.'
          },
          {
            id: '4',
            text: 'What is the main function of leaves?',
            options: ['To make food', 'To absorb water', 'To support the plant', 'To produce seeds'],
            correctAnswer: 0,
            explanation: 'Leaves make food for the plant through photosynthesis.'
          },
          {
            id: '5',
            text: 'Which of these is NOT a part of a plant?',
            options: ['Roots', 'Leaves', 'Wings', 'Stem'],
            correctAnswer: 2,
            explanation: 'Wings are not part of plants. Plants have roots, leaves, stems, and flowers.'
          }
        ],
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
      },
      {
        id: '2',
        title: 'ICSE 3rd Grade Mathematics - August 2025',
        description: 'Mathematics test focusing on arithmetic and basic problem solving',
        subject: 'Mathematics',
        grade: '3rd Grade',
        board: 'ICSE',
        type: 'coursework',
        duration: 45,
        questions: [
          {
            id: '1',
            text: 'What is 5 + 7?',
            options: ['10', '11', '12', '13'],
            correctAnswer: 2,
            explanation: '5 + 7 = 12'
          },
          {
            id: '2',
            text: 'What is 8 - 3?',
            options: ['3', '4', '5', '6'],
            correctAnswer: 2,
            explanation: '8 - 3 = 5'
          },
          {
            id: '3',
            text: 'What is 4 × 6?',
            options: ['20', '24', '28', '30'],
            correctAnswer: 1,
            explanation: '4 × 6 = 24'
          }
        ],
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
      }
    ];
    
    sampleTests.forEach(test => testStorage.save(test));
  }
}; 