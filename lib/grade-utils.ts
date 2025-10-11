// Grade standardization utilities
export const VALID_GRADES = [
  '1st Grade',
  '2nd Grade', 
  '3rd Grade',
  '4th Grade',
  '5th Grade'
] as const;

export type ValidGrade = typeof VALID_GRADES[number];

export function isValidGrade(grade: string): grade is ValidGrade {
  return VALID_GRADES.includes(grade as ValidGrade);
}

export function validateGradeFormat(grade: string): string | null {
  if (!grade.match(/^\d+(st|nd|rd|th) Grade$/)) {
    return 'Grade must follow format like "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", etc.';
  }
  return null;
}

export function normalizeGrade(grade: string): ValidGrade | null {
  const gradeMap: Record<string, ValidGrade> = {
    'Class 1': '1st Grade',
    'Class 2': '2nd Grade',
    'Class 3': '3rd Grade',
    'Class 4': '4th Grade',
    'Class 5': '5th Grade',
    'Grade 1': '1st Grade',
    'Grade 2': '2nd Grade',
    'Grade 3': '3rd Grade',
    'Grade 4': '4th Grade',
    'Grade 5': '5th Grade',
    '1st': '1st Grade',
    '2nd': '2nd Grade',
    '3rd': '3rd Grade',
    '4th': '4th Grade',
    '5th': '5th Grade',
  };
  
  return gradeMap[grade] || null;
}

export function getGradeDisplayName(grade: ValidGrade): string {
  return grade;
}

export function getGradeNumber(grade: ValidGrade): number {
  const match = grade.match(/^(\d+)/);
  return match ? parseInt(match[1]) : 0;
}
