import { FieldValue, Timestamp } from "firebase/firestore";

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  createdAt: Timestamp | FieldValue;
  updateAt: Timestamp | FieldValue;
}

export interface Interview {
  id: string;
  position: string;
  description: string;
  experience: number;
  userId: string;
  techStack: string;
  numberOfQuestions: number;
  interviewType: 'technical' | 'behavioural' | 'mixed';
  questions: { question: string; answer: string }[];
  createdAt: Timestamp;
  updateAt: Timestamp;
  status: 'pending' | 'attempted'; // 'pending' = yet to be given, 'attempted' = already given
  score?: number; // marks for attempted interviews
}

export interface UserAnswer {
  id: string;
  mockIdRef: string;
  question: string;
  correct_ans: string;
  user_ans: string;
  feedback: string;
  rating: number;
  userId: string;
  createdAt: Timestamp;
  updateAt: Timestamp;
}
