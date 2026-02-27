"use client";

import { useState, useRef } from "react";
import { submitSolution, pollSubmission } from "@/lib/api";
import { scoreColor, statusColor } from "@/lib/utils";
import type { Submission } from "@/types";

interface Props {
  challengeId: string;
}

export default function SubmitPanel({ challengeId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      let sub = await submitSolution(challengeId, file);
      setSubmission(sub);

      // Poll until complete
      while (sub.status === "pending" || sub.status === "running") {
        await new Promise((r) => setTimeout(r, 2000));
        sub = await pollSubmission(sub.id);
        setSubmission({ ...sub });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="font-mono font-semibold text-primary mb-4 flex items-center gap-2">
        <span>🚀</span> Submit
      </h2>

      <div
        className="border-2 border-dashed border-primary/30 rounded-lg p-4 text-center cursor-pointer hover:border-primary/60 transition-colors mb-4"
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="text-sm font-mono text-foreground">
            📄 {file.name}
            <div className="text-xs text-muted mt-1">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
        ) : (
          <div className="text-sm text-muted font-mono">
            Drop your ZIP or click to browse
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="w-full px-4 py-3 rounded-lg bg-accent hover:bg-accent-light text-background font-mono text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-accent"
      >
        {loading ? "⏳ Grading..." : "Submit for Grading"}
      </button>

      {error && (
        <div className="mt-3 text-xs text-red-400 font-mono bg-red-900/20 rounded p-2">{error}</div>
      )}

      {submission && (
        <div className="mt-4 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className={`font-mono text-sm font-bold ${statusColor(submission.status)}`}>
              {submission.status.toUpperCase()}
            </span>
            {submission.score !== null && (
              <span className={`font-mono text-lg font-bold ${scoreColor(submission.score)}`}>
                {submission.score}/100
              </span>
            )}
          </div>
          {(submission.status === "pending" || submission.status === "running") && (
            <div className="flex items-center gap-2 text-xs text-muted font-mono">
              <span className="animate-spin">⟳</span>
              Running tests in Docker sandbox...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
