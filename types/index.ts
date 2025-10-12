export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  image?: string;
}

export type Board = 'US' | 'IB' | 'ICSE' | 'IGCSE' | 'CBSE';

export interface Test {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  board: Board;
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
  userId: string;
  testId: string;
  questionId: string;
  questionText: string;
  questionOptions: string[];
  correctAnswer: number;
  userAnswer?: number;
  issueType: IssueType;
  description?: string;
  testTitle: string;
  testSubject: string;
  testGrade: string;
  testBoard: string;
  testChapter?: number;
  testDuration: number;
  reportedAt: Date;
  status: ReportStatus;
  adminNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
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