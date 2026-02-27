/**
 * Server-only API helpers.
 * This file imports "next/headers" — do NOT import it from Client Components.
 */
import { cookies } from "next/headers";
import type { User } from "@/types";
import { getApiBase } from "@/lib/api";

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    // Forward the browser's JSESSIONID so the backend recognises the session
    const cookieStore = await cookies();
    const cookieStr = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    const headers: HeadersInit = cookieStr ? { Cookie: cookieStr } : {};

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
