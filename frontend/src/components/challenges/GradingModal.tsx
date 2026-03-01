"use client";

import { useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, AlertTriangle, Loader2 } from "lucide-react";
import { scoreColor, statusColor } from "@/lib/utils";
import GradingTerminal from "./GradingTerminal";
import type { Submission } from "@/types";

interface Props {
  submissionId: string;
  open: boolean;
  onClose: () => void;
}

export default function GradingModal({ submissionId, open, onClose }: Props) {
  const [result, setResult] = useState<Submission | null>(null);
  const [status, setStatus] = useState<"grading" | "done">("grading");

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  const handleComplete = useCallback((submission: Submission) => {
    setResult(submission);
    setStatus("done");
  }, []);

  const isPassed = result?.status === "passed";
  const isFailed = result?.status === "failed" || result?.status === "error";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-primary/30 bg-surface overflow-hidden shadow-glow"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary/20 bg-surface-2/50 shrink-0">
              <div className="flex items-center gap-3">
                {status === "grading" ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >
                    <Loader2 className="w-5 h-5 text-primary" />
                  </motion.div>
                ) : isPassed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, stiffness: 200 }}
                  >
                    <Trophy className="w-5 h-5 text-emerald-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, stiffness: 200 }}
                  >
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </motion.div>
                )}
                <h2 className="font-mono font-semibold text-foreground text-sm">
                  {status === "grading" ? "Grading in Progress" : isPassed ? "Challenge Passed" : "Submission Result"}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-primary/10 text-muted hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score banner (shown when grading completes) */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                  className="overflow-hidden shrink-0"
                >
                  <div
                    className={`px-6 py-4 border-b ${
                      isPassed
                        ? "border-emerald-700/30 bg-emerald-950/30"
                        : "border-red-700/30 bg-red-950/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-sm font-bold ${statusColor(result.status)}`}>
                          {result.status.toUpperCase()}
                        </span>
                        {isPassed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-xs text-emerald-400/70 font-mono"
                          >
                            All checks passed
                          </motion.span>
                        )}
                      </div>
                      {result.score !== null && (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.15 }}
                          className="flex items-center gap-2"
                        >
                          <span className={`font-mono text-2xl font-bold ${scoreColor(result.score)}`}>
                            {result.score}
                          </span>
                          <span className="text-muted font-mono text-sm">/100</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Score breakdown bar */}
                    {result.score !== null && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        className="mt-3 origin-left"
                      >
                        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              result.score >= 80
                                ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                : result.score >= 60
                                ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                : "bg-gradient-to-r from-red-500 to-red-400"
                            }`}
                            style={{ width: `${result.score}%` }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Terminal logs — scrollable area */}
            <div className="flex-1 overflow-hidden min-h-0">
              <GradingTerminal submissionId={submissionId} onComplete={handleComplete} />
            </div>

            {/* Footer */}
            <AnimatePresence>
              {status === "done" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="overflow-hidden shrink-0"
                >
                  <div className="px-6 py-4 border-t border-primary/20 bg-surface-2/30 flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-primary/30 text-primary font-mono text-sm hover:bg-primary/10 transition-colors"
                    >
                      Close
                    </button>
                    {isFailed && (
                      <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-accent hover:bg-accent-light text-background font-mono text-sm font-bold transition-all glow-accent"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Success particles */}
          {isPassed && <SuccessParticles />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SuccessParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1.5,
    size: 3 + Math.random() * 4,
    color: ["bg-emerald-400", "bg-primary", "bg-accent", "bg-blue-400"][Math.floor(Math.random() * 4)],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${p.color}`}
          style={{ left: `${p.x}%`, width: p.size, height: p.size }}
          initial={{ y: "50vh", opacity: 1 }}
          animate={{ y: "-20vh", opacity: 0 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
