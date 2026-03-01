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

export function challengeTypeConfig(type: string): { label: string; class: string } {
  switch (type) {
    case "implement": return { label: "Implement", class: "bg-emerald-900/40 text-emerald-300 border border-emerald-700" };
    case "debug": return { label: "Debug", class: "bg-orange-900/40 text-orange-300 border border-orange-700" };
    default: return { label: "Refactor", class: "bg-violet-900/40 text-violet-300 border border-violet-700" };
  }
}

export function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
