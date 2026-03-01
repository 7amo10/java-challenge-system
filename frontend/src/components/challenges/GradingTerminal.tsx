"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, CheckCircle2, XCircle, Loader2, FlaskConical, Shield, FileCode } from "lucide-react";
import { getApiBase } from "@/lib/api";
import type { Submission } from "@/types";

interface Props {
  submissionId: string;
  onComplete: (submission: Submission) => void;
}

interface LogLine {
  type: "phase" | "test" | "checkstyle" | "log" | "error" | "success";
  text: string;
  timestamp: number;
}

function classifyLine(raw: string): LogLine {
  const text = raw.trimEnd();
  const timestamp = Date.now();
  if (text.startsWith("[PHASE]")) return { type: "phase", text: text.replace("[PHASE] ", ""), timestamp };
  if (text.startsWith("[ERROR]")) return { type: "error", text: text.replace("[ERROR] ", ""), timestamp };
  if (text.includes("Tests run:") && text.includes("Failures:")) return { type: "test", text, timestamp };
  if (text.includes("BUILD SUCCESS")) return { type: "success", text, timestamp };
  if (text.includes("BUILD FAILURE")) return { type: "error", text, timestamp };
  if (text.includes("Checkstyle violations")) return { type: "checkstyle", text, timestamp };
  if (text.includes("[INFO] Running")) return { type: "test", text, timestamp };
  if (text.includes("[ERROR]")) return { type: "error", text, timestamp };
  return { type: "log", text, timestamp };
}

function LineIcon({ type }: { type: LogLine["type"] }) {
  switch (type) {
    case "phase": return <Loader2 className="w-3 h-3 text-purple-400 animate-spin flex-shrink-0" />;
    case "test": return <FlaskConical className="w-3 h-3 text-blue-400 flex-shrink-0" />;
    case "checkstyle": return <Shield className="w-3 h-3 text-amber-400 flex-shrink-0" />;
    case "success": return <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />;
    case "error": return <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />;
    default: return <FileCode className="w-3 h-3 text-zinc-500 flex-shrink-0" />;
  }
}

function lineColor(type: LogLine["type"]): string {
  switch (type) {
    case "phase": return "text-purple-300";
    case "test": return "text-blue-300";
    case "checkstyle": return "text-amber-300";
    case "success": return "text-emerald-400 font-bold";
    case "error": return "text-red-400";
    default: return "text-zinc-400";
  }
}

export default function GradingTerminal({ submissionId, onComplete }: Props) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [status, setStatus] = useState<string>("connecting");
  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef(false);

  useEffect(() => {
    const base = getApiBase();
    const url = `${base}/submissions/${submissionId}/stream`;
    const source = new EventSource(url);

    source.addEventListener("log", (e) => {
      const raw = e.data as string;
      const newLines = raw.split("\n").filter((l: string) => l.trim().length > 0).map(classifyLine);
      setLines((prev) => [...prev, ...newLines]);
    });

    source.addEventListener("status", (e) => {
      try {
        const data = JSON.parse(e.data);
        setStatus(data.status);
      } catch { /* ignore parse errors */ }
    });

    source.addEventListener("complete", (e) => {
      try {
        const submission = JSON.parse(e.data);
        onComplete(submission);
      } catch { /* ignore parse errors */ }
      source.close();
    });

    source.addEventListener("error", () => {
      // EventSource auto-reconnects; only close if terminal
    });

    return () => source.close();
  }, [submissionId, onComplete]);

  // Track if user manually scrolled up
  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    userScrolledUp.current = !atBottom;
  }

  // Auto-scroll only if user hasn't scrolled up
  useEffect(() => {
    if (scrollRef.current && !userScrolledUp.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const statusLabel: Record<string, string> = {
    connecting: "Connecting...",
    pending: "Queued",
    running: "Running Tests",
    passed: "Passed",
    failed: "Failed",
    error: "Error",
  };

  const statusDot: Record<string, string> = {
    connecting: "bg-zinc-400 animate-pulse",
    pending: "bg-amber-400 animate-pulse",
    running: "bg-purple-400 animate-pulse",
    passed: "bg-emerald-400",
    failed: "bg-red-400",
    error: "bg-red-400",
  };

  return (
    <div className="flex flex-col h-full bg-black/60">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/80 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-xs text-zinc-300">grading-pipeline</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusDot[status] || "bg-zinc-400"}`} />
          <span className="font-mono text-xs text-zinc-400">{statusLabel[status] || status}</span>
        </div>
      </div>

      {/* Log output */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed min-h-[200px] max-h-[50vh]">
        <AnimatePresence initial={false}>
          {lines.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-zinc-500"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Initializing grading pipeline...</span>
            </motion.div>
          )}
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className={`flex items-start gap-2 py-0.5 ${lineColor(line.type)}`}
            >
              <LineIcon type={line.type} />
              <span className="break-all">{line.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {(status === "running" || status === "pending" || status === "connecting") && (
          <div className="flex items-center gap-2 text-zinc-500 mt-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="animate-pulse">_</span>
          </div>
        )}
      </div>
    </div>
  );
}
