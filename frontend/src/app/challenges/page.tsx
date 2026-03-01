import { fetchChallenges } from "@/lib/api";
import { CATEGORIES, getChallengeType, type Challenge } from "@/types";
import { difficultyBadge, challengeTypeConfig } from "@/lib/utils";
import Link from "next/link";

// Live data from backend — always render at request time
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function ChallengesPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const topicId = category ? parseInt(category) : undefined;
  const challenges = await fetchChallenges(topicId);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-mono text-foreground mb-2">
          <span className="text-primary">~/</span>challenges
        </h1>
        <p className="text-muted font-mono text-sm">
          {challenges.length} challenge{challenges.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        <Link
          href="/challenges"
          className={`px-3 py-1 rounded-full font-mono text-xs border transition-all ${
            !topicId ? "bg-primary/20 border-primary text-primary" : "border-primary/20 text-muted hover:border-primary/50"
          }`}
        >
          All
        </Link>
        {Object.entries(CATEGORIES).map(([id, cat]) => (
          <Link
            key={id}
            href={`/challenges?category=${id}`}
            className={`px-3 py-1 rounded-full font-mono text-xs border transition-all ${
              topicId === parseInt(id)
                ? "bg-primary/20 border-primary text-primary"
                : "border-primary/20 text-muted hover:border-primary/50"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {challenges.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-muted font-mono">No challenges yet for this category.</p>
          <p className="text-muted/60 font-mono text-sm mt-2">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((c: Challenge) => {
            const type = c.challengeType || getChallengeType(c);
            const typeConf = challengeTypeConfig(type);
            return (
              <Link
                key={c.id}
                href={`/challenges/${c.id}`}
                className="glass rounded-xl p-6 hover:border-primary/50 transition-all hover:scale-[1.02] group flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-mono text-muted">
                    {CATEGORIES[c.topicId]?.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${typeConf.class}`}>
                      {typeConf.label}
                    </span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${difficultyBadge(c.difficulty)}`}>
                      {c.difficulty}
                    </span>
                  </div>
                </div>
                <h3 className="font-mono font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                  {c.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed line-clamp-3 flex-1">{c.story}</p>
                <div className="mt-4 pt-4 border-t border-primary/10">
                  <span className="text-xs font-mono text-muted">{c.theme}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
