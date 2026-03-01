/**
 * Server-only API helpers.
 * This file imports "next/headers" — do NOT import it from Client Components.
 */
import { cookies } from "next/headers";
import type { User, UserStats, Submission, LeaderboardEntry } from "@/types";
import { getApiBase } from "@/lib/api";

async function serverCookieHeader(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const cookieStr = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  return cookieStr ? { Cookie: cookieStr } : {};
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const headers = await serverCookieHeader();
    const res = await fetch(`${getApiBase()}/users/me`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchMyStats(): Promise<UserStats | null> {
  try {
    const headers = await serverCookieHeader();
    const res = await fetch(`${getApiBase()}/submissions/my/stats`, {
      headers,
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
    const headers = await serverCookieHeader();
    const res = await fetch(`${getApiBase()}/submissions/my`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const headers = await serverCookieHeader();
    const res = await fetch(`${getApiBase()}/submissions/leaderboard`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
