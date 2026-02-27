import { fetchChallenge } from "@/lib/api";
import { TOPICS } from "@/types";
import { difficultyBadge } from "@/lib/utils";
import { notFound } from "next/navigation";
import SubmitPanel from "@/components/challenges/SubmitPanel";

// Live data from backend — always render at request time
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChallengePage({ params }: Props) {
  const { id } = await params;
  const challenge = await fetchChallenge(id);
  if (!challenge) notFound();

  const topic = TOPICS[challenge.topicId];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="font-mono text-sm text-muted mb-6">
        <a href="/challenges" className="hover:text-primary transition-colors">~/challenges</a>
        <span className="mx-2 text-primary/40">/</span>
        <span className="text-foreground">{challenge.theme.toLowerCase().replace(/\s/g, "-")}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="text-2xl">{topic?.icon}</span>
          <span className="text-xs font-mono text-muted bg-surface-2 px-2 py-0.5 rounded">
            Topic {challenge.topicId}: {topic?.name}
          </span>
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${difficultyBadge(challenge.difficulty)}`}>
            {challenge.difficulty}
          </span>
          {challenge.aiGenerated && (
            <span className="text-xs font-mono text-primary/60 border border-primary/20 px-2 py-0.5 rounded-full">
              ✨ AI Generated
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold font-mono text-foreground">{challenge.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Brief + Requirements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Story */}
          <div className="glass rounded-xl p-6">
            <h2 className="font-mono font-semibold text-primary mb-4 flex items-center gap-2">
              <span>📋</span> The Brief
            </h2>
            <div className="text-sm text-muted leading-relaxed whitespace-pre-wrap font-sans">
              {challenge.story}
            </div>
          </div>

          {/* Requirements */}
          <div className="glass rounded-xl p-6">
            <h2 className="font-mono font-semibold text-primary mb-4 flex items-center gap-2">
              <span>✅</span> Requirements
            </h2>
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="text-sm text-muted whitespace-pre-wrap font-mono bg-surface rounded-lg p-4 overflow-auto">
                {challenge.requirementsMd}
              </pre>
            </div>
          </div>

          {/* Scoring */}
          <div className="glass rounded-xl p-6">
            <h2 className="font-mono font-semibold text-primary mb-4 flex items-center gap-2">
              <span>🏆</span> Scoring
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Visible Tests", pts: "40 pts", color: "text-blue-400" },
                { label: "Hidden Tests", pts: "40 pts", color: "text-purple-400" },
                { label: "Checkstyle", pts: "20 pts", color: "text-amber-400" },
              ].map(({ label, pts, color }) => (
                <div key={label} className="bg-surface rounded-lg p-3">
                  <div className={`font-bold font-mono ${color}`}>{pts}</div>
                  <div className="text-xs text-muted mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Download + Submit */}
        <div className="space-y-4">
          {/* Download */}
          <div className="glass rounded-xl p-6">
            <h2 className="font-mono font-semibold text-primary mb-4 flex items-center gap-2">
              <span>📦</span> Bundle
            </h2>
            <p className="text-xs text-muted font-mono mb-4">
              Download the Maven project, refactor BadCode.java, run tests locally.
            </p>
            <a
              href={`/api/backend/challenges/${challenge.id}/download`}
              className="block w-full text-center px-4 py-3 rounded-lg bg-primary hover:bg-primary-light text-white font-mono text-sm font-semibold transition-all glow-primary"
            >
              ⬇ Download ZIP
            </a>
            <div className="mt-4 bg-surface rounded-lg p-3 font-mono text-xs text-muted">
              <div className="text-primary/80 mb-1"># Run locally:</div>
              <div>$ cd challenge-dir</div>
              <div>$ mvn test</div>
              <div>$ mvn checkstyle:check</div>
            </div>
          </div>

          {/* Submit */}
          <SubmitPanel challengeId={challenge.id} />
        </div>
      </div>
    </div>
  );
}
