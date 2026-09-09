import { Timestamp } from "firebase/firestore";

export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type LessonType = "video" | "document" | "assignment" | "quiz";
export type AssignmentStatus = "not-started" | "in-progress" | "submitted" | "reviewed";

export interface TrainingCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  createdAt: Timestamp | Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  level: CourseLevel;
  instructor: string; // User ID
  duration: number; // in hours
  thumbnail?: string;
  lessons: string[]; // Lesson IDs
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  type: LessonType;
  order: number;
  content: {
    videoUrl?: string;
    documentUrl?: string;
    description?: string;
    assignmentPrompt?: string;
    quizQuestions?: QuizQuestion[];
  };
  duration?: number; // in minutes
  createdAt: Timestamp | Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Timestamp | Date;
  completedAt?: Timestamp | Date;
  progress: number; // percentage 0-100
}

export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonsCompleted: string[]; // Lesson IDs
  lastAccessedAt: Timestamp | Date;
  timeSpent: number; // in minutes
}

export interface Assignment {
  id: string;
  lessonId: string;
  userId: string;
  status: AssignmentStatus;
  submittedAt?: Timestamp | Date;
  reviewedAt?: Timestamp | Date;
  submissionUrl?: string;
  feedback?: string;
  score?: number;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  issuedAt: Timestamp | Date;
  expiresAt?: Timestamp | Date;
  certificateNumber: string;
}

// Request/Response types
export interface CreateCourseRequest {
  title: string;
  description: string;
  categoryId: string;
  level: CourseLevel;
  duration: number;
  thumbnail?: File;
}

export interface EnrollCourseRequest {
  courseId: string;
  userId: string;
}
