import { fetchCurrentUser } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

// Auth-gated page — always render at request time, never statically prerender
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await fetchCurrentUser();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="glass rounded-xl p-12">
          <div className="text-5xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold font-mono mb-4">Sign in Required</h1>
          <p className="text-muted mb-8">Log in with GitHub to track your progress and submissions.</p>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || ""}/oauth2/authorization/github`}
            className="inline-block px-8 py-3 rounded-lg bg-primary hover:bg-primary-light text-white font-mono font-semibold transition-all glow-primary"
          >
            Login with GitHub
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-mono text-foreground mb-2">
          <span className="text-primary">~/</span>dashboard
        </h1>
      </div>

      {/* User card */}
      <div className="glass rounded-xl p-6 mb-8 flex items-center gap-6">
        <Image
          src={user.avatarUrl}
          alt={user.username}
          width={80}
          height={80}
          className="rounded-full ring-2 ring-primary/40"
        />
        <div>
          <div className="text-xl font-bold font-mono text-foreground">{user.name || user.username}</div>
          <div className="text-muted font-mono text-sm">@{user.username}</div>
          <div className="mt-2 text-xs font-mono text-primary/60">GitHub OAuth ✓</div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/challenges"
          className="glass rounded-xl p-6 hover:border-primary/50 transition-all group"
        >
          <div className="text-2xl mb-2">🎯</div>
          <div className="font-mono font-semibold group-hover:text-primary transition-colors">
            Browse Challenges
          </div>
          <div className="text-sm text-muted mt-1">Find your next challenge to solve</div>
        </Link>
        <div className="glass rounded-xl p-6">
          <div className="text-2xl mb-2">📊</div>
          <div className="font-mono font-semibold">Submission History</div>
          <div className="text-sm text-muted mt-1">Coming soon — submit a challenge to see results here</div>
        </div>
      </div>
    </div>
  );
}
