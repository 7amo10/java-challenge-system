export interface Challenge {
  id: string;
  topicId: number;
  title: string;
  theme: string;
  difficulty: "medium" | "hard";
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

export const TOPICS: Record<number, { name: string; icon: string; color: string }> = {
  1: { name: "Java Basics", icon: "☕", color: "#3b82f6" },
  2: { name: "OOP & Class Design", icon: "🏗️", color: "#8b5cf6" },
  3: { name: "Arrays & Lists", icon: "📋", color: "#06b6d4" },
  4: { name: "Abstraction & Generics", icon: "⚙️", color: "#7c3aed" },
  5: { name: "Lambdas & Streams", icon: "🌊", color: "#10b981" },
  6: { name: "Collections Framework", icon: "🗂️", color: "#f59e0b" },
};
