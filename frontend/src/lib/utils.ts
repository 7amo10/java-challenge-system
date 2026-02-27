import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function statusColor(status: string): string {
  switch (status) {
    case "passed": return "text-green-400";
    case "failed": return "text-red-400";
    case "running": return "text-amber-400";
    case "error": return "text-red-500";
    default: return "text-muted";
  }
}

export function scoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

export function difficultyBadge(difficulty: string): string {
  return difficulty === "hard"
    ? "bg-red-900/40 text-red-300 border border-red-700"
    : "bg-amber-900/40 text-amber-300 border border-amber-700";
}
