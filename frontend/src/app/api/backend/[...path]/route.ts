/**
 * Runtime reverse proxy for all /api/backend/* requests.
 * Replaces next.config.ts rewrites() so BACKEND_URL is resolved at
 * runtime (not baked into routes-manifest.json at build time).
 */
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

type Ctx = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { path } = await ctx.params;
  const target = `${BACKEND}/api/${path.join("/")}${req.nextUrl.search}`;

  const forwardHeaders: Record<string, string> = {};

  // Forward session cookie so authenticated endpoints work
  const cookie = req.headers.get("cookie");
  if (cookie) forwardHeaders["cookie"] = cookie;

  let body: ArrayBuffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    // Forward content-type (includes multipart boundary for file uploads)
    const ct = req.headers.get("content-type");
    if (ct) forwardHeaders["content-type"] = ct;
    body = await req.arrayBuffer();
  }

  const upstream = await fetch(target, {
    method: req.method,
    headers: forwardHeaders,
    body,
  });

  const resHeaders: Record<string, string> = {};
  const ct = upstream.headers.get("content-type");
  if (ct) resHeaders["content-type"] = ct;
  const cd = upstream.headers.get("content-disposition");
  if (cd) resHeaders["content-disposition"] = cd;
  const sc = upstream.headers.get("set-cookie");
  if (sc) resHeaders["set-cookie"] = sc;

  const responseBody = await upstream.arrayBuffer();
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
