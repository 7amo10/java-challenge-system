import type { Challenge, Submission, User } from "@/types";

/**
 * Server-side (SSR / Server Components): use BACKEND_URL — an absolute URL
 * pointing directly at the Spring Boot backend.
 * Client-side (browser): use NEXT_PUBLIC_API_URL relative path, which is
 * proxied to the backend via the Next.js rewrite in next.config.ts.
 */
function getApiBase(): string {
  if (typeof window === "undefined") {
    // Server context — must be an absolute URL for Node.js fetch
    return process.env.BACKEND_URL
      ? `${process.env.BACKEND_URL}/api`
      : "http://localhost:8080/api";
  }
  // Client context — relative path handled by Next.js rewrites
  return (process.env.NEXT_PUBLIC_API_URL ?? "/api/backend") + "";
}

export async function fetchChallenges(topic?: number): Promise<Challenge[]> {
  try {
    const base = getApiBase();
    const url = topic ? `${base}/challenges?topic=${topic}` : `${base}/challenges`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchChallenge(id: string): Promise<Challenge | null> {
  try {
    const res = await fetch(`${getApiBase()}/challenges/${id}`, {
      next: { revalidate: 60 },
    });
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
  if (!res.ok) throw new Error("Submission failed");
  return res.json();
}

export async function pollSubmission(id: string): Promise<Submission> {
  const res = await fetch(`${getApiBase()}/submissions/${id}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Could not fetch submission");
  return res.json();
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch(`${getApiBase()}/users/me`, { credentials: "include" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
