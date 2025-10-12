export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  image?: string;
}

export type Board = 'US' | 'IB' | 'ICSE' | 'IGCSE' | 'CBSE';
export type TestType = 'coursework' | 'weekly';

export interface Test {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  board: Board;
  type: TestType;
  duration: number; // in minutes
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TestResult {
  id: string;
  testId: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number; // in seconds
  answers: { questionId: string; selectedAnswer: number; isCorrect: boolean }[];
  completedAt: Date;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  email?: string;
  parentEmail?: string;
  createdAt: Date;
}

export interface TestSession {
  testId: string;
  currentQuestionIndex: number;
  answers: { questionId: string; selectedAnswer: number }[];
  startTime: Date;
  timeRemaining: number; // in seconds
}

export type IssueType = 
  | 'incorrect_answer'
  | 'unclear_question'
  | 'typo_error'
  | 'wrong_explanation'
  | 'inappropriate_content'
  | 'technical_error'
  | 'other';

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface QuestionReport {
  id: string;
  user_id: string;
  test_id: string;
  question_id: string;
  question_text: string;
  question_options: string[];
  correct_answer: number;
  user_answer?: number;
  issue_type: IssueType;
  description?: string;
  test_title: string;
  test_subject: string;
  test_grade: string;
  test_board: string;
  test_chapter?: number;
  test_duration?: number;
  reported_at: string;
  status: ReportStatus;
  admin_notes?: string;
  resolved_at?: string;
  resolved_by?: string;
  profiles?: {
    student_name: string;
    email: string;
    grade: string;
    board: string;
  };
}

export interface CreateQuestionReportData {
  testId: string;
  questionId: string;
  questionText: string;
  questionOptions: string[];
  correctAnswer: number;
  userAnswer?: number;
  issueType: IssueType;
  description?: string;
} 