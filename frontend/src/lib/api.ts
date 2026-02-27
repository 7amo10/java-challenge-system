import type { Challenge, Submission, User } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "/api/backend";

export async function fetchChallenges(topic?: number): Promise<Challenge[]> {
  const url = topic ? `${BASE}/challenges?topic=${topic}` : `${BASE}/challenges`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchChallenge(id: string): Promise<Challenge | null> {
  const res = await fetch(`${BASE}/challenges/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export async function submitSolution(challengeId: string, file: File): Promise<Submission> {
  const form = new FormData();
  form.append("challengeId", challengeId);
  form.append("file", file);
  const res = await fetch(`${BASE}/submissions`, {
    method: "POST",
    body: form,
    credentials: "include",
  });
  if (!res.ok) throw new Error("Submission failed");
  return res.json();
}

export async function pollSubmission(id: string): Promise<Submission> {
  const res = await fetch(`${BASE}/submissions/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Could not fetch submission");
  return res.json();
}

export async function fetchCurrentUser(): Promise<User | null> {
  const res = await fetch(`${BASE}/users/me`, { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}
