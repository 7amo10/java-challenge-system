import { fetchCurrentUser, fetchMyStats, fetchMySubmissions, fetchLeaderboard } from "@/lib/server-api";
import Image from "next/image";
import Link from "next/link";
import {
  Lock, Github, CheckCircle, Send, Trophy, TrendingUp, Award,
  Compass, ClipboardList, ArrowRight, Medal,
} from "lucide-react";
import { statusColor, scoreColor, relativeTime } from "@/lib/utils";

// Auth-gated page — always render at request time, never statically prerender
export const dynamic = "force-dynamic";

function StatusPill({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    passed: { bg: "bg-green-900/40", text: "text-green-300", label: "Passed" },
    failed: { bg: "bg-red-900/40", text: "text-red-300", label: "Failed" },
    pending: { bg: "bg-amber-900/40", text: "text-amber-300", label: "Pending" },
    running: { bg: "bg-amber-900/40", text: "text-amber-300", label: "Running" },
    error: { bg: "bg-red-900/40", text: "text-red-300", label: "Error" },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono ${c.bg} ${c.text} border border-current/20`}>
      {c.label}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-amber-400 font-bold font-mono"><Medal className="w-4 h-4 inline" /> 1</span>;
  if (rank === 2) return <span className="text-gray-300 font-bold font-mono"><Medal className="w-4 h-4 inline" /> 2</span>;
  if (rank === 3) return <span className="text-orange-400 font-bold font-mono"><Medal className="w-4 h-4 inline" /> 3</span>;
  return <span className="text-muted font-mono">{rank}</span>;
}

export default async function DashboardPage() {
  const user = await fetchCurrentUser();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="glass rounded-xl p-12">
          <Lock className="w-12 h-12 text-muted mx-auto mb-6" />
          <h1 className="text-2xl font-bold font-mono mb-4">Sign in Required</h1>
          <p className="text-muted mb-8">Log in with GitHub to track your progress and submissions.</p>
          <a
            href={`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/oauth2/authorization/github`}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary hover:bg-primary-light text-white font-mono font-semibold transition-all glow-primary"
          >
            <Github className="w-5 h-5" /> Sign in with GitHub
          </a>
        </div>
      </div>
    );
  }

  const [stats, submissions, leaderboard] = await Promise.all([
    fetchMyStats(),
    fetchMySubmissions(),
    fetchLeaderboard(),
  ]);

  const s = stats ?? { totalSubmissions: 0, passed: 0, failed: 0, avgScore: 0, bestScore: 0, challengesSolved: 0 };

  const statCards = [
    { label: "Total Submissions", value: s.totalSubmissions, Icon: Send, color: "text-blue-400", bg: "bg-blue-900/40" },
    { label: "Challenges Solved", value: s.challengesSolved, Icon: Trophy, color: "text-amber-400", bg: "bg-amber-900/40" },
    { label: "Average Score", value: Math.round(s.avgScore), Icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-900/40" },
    { label: "Best Score", value: s.bestScore, Icon: Award, color: "text-purple-400", bg: "bg-purple-900/40" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Page title */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-mono text-foreground mb-2">
          <span className="text-primary">~/</span>dashboard
        </h1>
      </div>

      {/* User profile bar */}
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
          <div className="mt-2 text-xs font-mono text-primary/60 inline-flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Authenticated via GitHub
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="glass rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">{value}</div>
            <div className="text-xs text-muted font-mono mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Two-column: Submissions + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* LEFT: Submission History */}
        <div className="lg:col-span-3 glass rounded-xl p-6">
          <h2 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" /> Recent Submissions
          </h2>
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <Send className="w-10 h-10 text-muted/40 mx-auto mb-4" />
              <p className="text-muted font-mono text-sm">No submissions yet</p>
              <p className="text-muted/60 font-mono text-xs mt-1">Pick your first challenge and submit a solution!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {submissions.slice(0, 20).map((sub) => (
                <Link
                  key={sub.id}
                  href={`/challenges/${sub.challengeId}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-surface hover:bg-surface-2 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {sub.challengeTitle}
                    </div>
                    <div className="text-xs text-muted font-mono mt-0.5">
                      {relativeTime(sub.submittedAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {sub.score !== null && (
                      <span className={`text-sm font-mono font-bold ${scoreColor(sub.score)}`}>
                        {sub.score}
                      </span>
                    )}
                    <StatusPill status={sub.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Leaderboard */}
        <div className="lg:col-span-2 glass rounded-xl p-6">
          <h2 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Leaderboard
          </h2>
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-10 h-10 text-muted/40 mx-auto mb-4" />
              <p className="text-muted font-mono text-sm">No entries yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {leaderboard.map((entry) => (
                <div
                  key={entry.username}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    entry.rank <= 3 ? "bg-surface-2" : "bg-surface"
                  }`}
                >
                  <div className="w-8 text-center shrink-0">
                    <RankBadge rank={entry.rank} />
                  </div>
                  {entry.avatarUrl ? (
                    <Image
                      src={entry.avatarUrl}
                      alt={entry.username}
                      width={32}
                      height={32}
                      className="rounded-full shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm text-foreground truncate">{entry.username}</div>
                    <div className="text-xs text-muted font-mono">{entry.challengesSolved} solved</div>
                  </div>
                  <div className="text-sm font-mono font-bold text-primary shrink-0">{entry.totalScore}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/challenges"
          className="glass rounded-xl p-6 hover:border-primary/50 transition-all group"
        >
          <Compass className="w-7 h-7 text-primary mb-2" />
          <div className="font-mono font-semibold group-hover:text-primary transition-colors inline-flex items-center gap-2">
            Explore Challenges <ArrowRight className="w-4 h-4" />
          </div>
          <div className="text-sm text-muted mt-1">Find your next challenge to solve</div>
        </Link>
        <Link
          href="/dashboard"
          className="glass rounded-xl p-6 hover:border-primary/50 transition-all group"
        >
          <ClipboardList className="w-7 h-7 text-primary mb-2" />
          <div className="font-mono font-semibold group-hover:text-primary transition-colors inline-flex items-center gap-2">
            View All Submissions <ArrowRight className="w-4 h-4" />
          </div>
          <div className="text-sm text-muted mt-1">Review your complete submission history</div>
        </Link>
      </div>
    </div>
  );
}
