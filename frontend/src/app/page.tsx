import Link from "next/link";
import { TOPICS } from "@/types";

const FLOATING_SNIPPETS = [
  'List<String> safe = new ArrayList<>();',
  'Optional.ofNullable(value).orElse(defaultVal)',
  'Comparator.comparing(Person::getName)',
  'record Point(int x, int y) {}',
  'Stream.of(1,2,3).filter(n -> n > 1)',
  '// Item 26: Don\'t use raw types',
  'Map<K,V> map = new HashMap<>();',
];

export default function Home() {
  return (
    <div className="min-h-screen bg-grid">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-24 pb-20 max-w-7xl mx-auto">
        {/* Floating code snippets */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
          {FLOATING_SNIPPETS.map((snippet, i) => (
            <div
              key={i}
              className="absolute text-primary/10 font-mono text-xs whitespace-nowrap"
              style={{
                top: `${10 + i * 12}%`,
                left: `${5 + (i * 13) % 70}%`,
                transform: `rotate(${-3 + i * 1.2}deg)`,
              }}
            >
              {snippet}
            </div>
          ))}
        </div>

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 text-primary text-sm font-mono mb-6">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Phase 1 · 6 Topics · Effective Java
          </div>

          <h1 className="text-5xl md:text-7xl font-bold font-mono mb-6 leading-tight">
            <span className="text-foreground">Refactor.</span>{" "}
            <span className="text-primary">Test.</span>{" "}
            <span className="text-accent">Master.</span>
          </h1>

          <p className="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Real-world Java challenges built on Joshua Bloch&apos;s{" "}
            <em className="text-foreground">Effective Java</em>. Download a broken legacy
            project, refactor it to production standards, and submit for automated grading.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/challenges"
              className="px-8 py-3 rounded-lg bg-primary hover:bg-primary-light text-white font-mono font-semibold transition-all glow-primary hover:scale-105"
            >
              Browse Challenges →
            </Link>
            <a
              href="https://github.com/7amo10/My-Java-Rodemap"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-lg border border-primary/40 text-muted hover:text-foreground hover:border-primary font-mono transition-all"
            >
              View Roadmap
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold font-mono text-center mb-12">
          <span className="text-primary">$</span> How it Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Pick a Challenge", desc: "Choose from 6 Phase 1 topics. Each challenge has a real-world production scenario.", icon: "🎯" },
            { step: "02", title: "Download Bundle", desc: "Get a Maven project ZIP with BadCode.java to refactor and JUnit 5 tests to validate.", icon: "📦" },
            { step: "03", title: "Refactor Locally", desc: "Fix the Effective Java violations. Run mvn test until all tests pass.", icon: "⚙️" },
            { step: "04", title: "Submit & Grade", desc: "Upload your ZIP. Our Docker grader runs hidden tests + Checkstyle analysis.", icon: "🏆" },
          ].map(({ step, title, desc, icon }) => (
            <div key={step} className="glass rounded-xl p-6 relative">
              <div className="absolute -top-3 left-4 text-xs font-mono text-primary/60 bg-background px-2">{step}</div>
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-mono font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Topics Grid */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold font-mono text-center mb-12">
          <span className="text-primary">$</span> Phase 1 Topics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(TOPICS).map(([id, topic]) => (
            <Link
              key={id}
              href={`/challenges?topic=${id}`}
              className="glass rounded-xl p-6 hover:border-primary/50 transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{topic.icon}</span>
                <span className="text-xs font-mono text-muted">Topic {id}</span>
              </div>
              <h3 className="font-mono font-semibold text-foreground group-hover:text-primary transition-colors">
                {topic.name}
              </h3>
              <div className="mt-3 text-xs font-mono text-muted">
                View challenges →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Score breakdown info */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <div className="glass rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold font-mono mb-6 text-foreground">Grading Breakdown</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Visible Tests", pts: "40 pts", color: "text-blue-400" },
              { label: "Hidden Tests", pts: "40 pts", color: "text-purple-400" },
              { label: "Checkstyle", pts: "20 pts", color: "text-amber-400" },
            ].map(({ label, pts, color }) => (
              <div key={label}>
                <div className={`text-2xl font-bold font-mono ${color}`}>{pts}</div>
                <div className="text-xs text-muted mt-1">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted mt-6">
            Score ≥ 60 = Pass. All tests run inside an isolated Docker sandbox with no network access.
          </p>
        </div>
      </section>
    </div>
  );
}
