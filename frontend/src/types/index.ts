export interface Challenge {
  id: string;
  topicId: number;
  title: string;
  theme: string;
  difficulty: "medium" | "hard";
  challengeType: "refactor" | "implement" | "debug";
  story: string;
  requirementsMd: string;
  aiGenerated: boolean;
  createdAt: string;
}

export interface Submission {
  id: string;
  challengeId: string;
  challengeTitle: string;
  status: "pending" | "running" | "passed" | "failed" | "error";
  score: number | null;
  visibleTestsJson: string | null;
  hiddenTestsJson: string | null;
  checkstyleViolationsJson: string | null;
  submittedAt: string;
  completedAt: string | null;
}

export interface User {
  username: string;
  avatarUrl: string;
  name: string;
}

export type ChallengeType = "refactor" | "implement" | "debug";

export interface Category {
  name: string;
  description: string;
}

export const CATEGORIES: Record<number, Category> = {
  1: { name: "Core Foundations", description: "Strings, primitives, and fundamental patterns" },
  2: { name: "Object-Oriented Design", description: "Encapsulation, contracts, and class architecture" },
  3: { name: "Data Structures", description: "Arrays, lists, and type-safe collections" },
  4: { name: "Type Safety & Generics", description: "Generic types, bounded wildcards, and type erasure" },
  5: { name: "Functional Patterns", description: "Lambdas, streams, and declarative pipelines" },
  6: { name: "Collections Mastery", description: "Maps, sets, iteration patterns, and null safety" },
};

export function getChallengeType(challenge: Challenge): ChallengeType {
  return challenge.challengeType || "refactor";
}

export interface UserStats {
  totalSubmissions: number;
  passed: number;
  failed: number;
  avgScore: number;
  bestScore: number;
  challengesSolved: number;
}

export interface LeaderboardEntry {
  username: string;
  avatarUrl: string;
  totalScore: number;
  challengesSolved: number;
  rank: number;
}
