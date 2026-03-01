import type { Challenge, Submission, User } from "@/types";

export function getApiBase(): string {
  if (typeof window === "undefined") {
    // Server context — absolute URL directly to backend
    return process.env.BACKEND_URL
      ? `${process.env.BACKEND_URL}/api`
      : "http://localhost:8080/api";
  }
  // Client context — go through Next.js rewrite proxy (same origin, avoids CORS)
  return "/api/backend";
}

export async function fetchChallenges(topic?: number): Promise<Challenge[]> {
  try {
    const base = getApiBase();
    const url = topic ? `${base}/challenges?topic=${topic}` : `${base}/challenges`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchChallenge(id: string): Promise<Challenge | null> {
  try {
    const res = await fetch(`${getApiBase()}/challenges/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function submitSolution(challengeId: string, file: File): Promise<Submission> {
  const form = new FormData();
  form.append("challengeId", challengeId);
  form.append("file", file);
  const res = await fetch(`${getApiBase()}/submissions`, {
    method: "POST",
    body: form,
    credentials: "include",
  });
  if (res.status === 401) throw new Error("Please sign in to submit solutions");
  if (!res.ok) throw new Error(`Submission failed (${res.status})`);
  return res.json();
}

export async function pollSubmission(id: string): Promise<Submission> {
  const res = await fetch(`${getApiBase()}/submissions/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Could not fetch submission");
  return res.json();
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch(`${getApiBase()}/users/me`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchMySubmissions(): Promise<Submission[]> {
  try {
    const res = await fetch(`${getApiBase()}/submissions/my`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
