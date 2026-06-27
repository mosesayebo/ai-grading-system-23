export interface Student { id: number; matric: string; name: string; department: string; email?: string; level?: string; createdAt?: string }
export interface Course { id: number; code: string; title: string; credits: number }
export interface Exam { id: number; title: string; prompt: string; modelAnswer?: string; course?: Course }
export interface Result { id: number; studentId: number; examId: number; score: number; grade: string; feedback: string; student?: Student; exam?: Exam; createdAt?: string }
