"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { submitSolution } from "@/lib/api";
import { Upload, FileArchive, Loader2, RotateCcw } from "lucide-react";
import GradingModal from "./GradingModal";

interface Props {
  challengeId: string;
}

export default function SubmitPanel({ challengeId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setLastScore(null);
    try {
      const sub = await submitSolution(challengeId, file);
      setSubmissionId(sub.id);
      setModalOpen(true);
      setLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
      setLoading(false);
    }
  }

  function handleModalClose() {
    setModalOpen(false);
    setSubmissionId(null);
    setFile(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.endsWith(".zip")) {
      setFile(droppedFile);
    }
  }

  return (
    <>
      <div className="glass rounded-xl p-6">
        <h2 className="font-mono font-semibold text-primary mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" /> Submit Solution
        </h2>

        {/* File picker with drag & drop */}
        <motion.div
          className="border-2 border-dashed border-primary/30 rounded-lg p-5 text-center cursor-pointer hover:border-primary/60 transition-colors mb-4"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          whileHover={{ borderColor: "rgba(124, 58, 237, 0.6)" }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setError(null);
            }}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileArchive className="w-8 h-8 text-primary" />
              <span className="text-sm font-mono text-foreground">{file.name}</span>
              <span className="text-xs text-muted">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <Upload className="w-8 h-8 text-muted/50" />
              <span className="text-sm text-muted font-mono">
                Drop your ZIP or click to browse
              </span>
            </div>
          )}
        </motion.div>

        <motion.button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="w-full px-4 py-3 rounded-lg bg-accent hover:bg-accent-light text-background font-mono text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-accent flex items-center justify-center gap-2"
          whileHover={file && !loading ? { scale: 1.02 } : {}}
          whileTap={file && !loading ? { scale: 0.98 } : {}}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
          ) : (
            "Submit for Grading"
          )}
        </motion.button>

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-xs text-red-400 font-mono bg-red-900/20 rounded-lg p-3 border border-red-800/30"
          >
            {error}
          </motion.div>
        )}
      </div>

      {/* Grading Modal — key forces full remount per submission */}
      {submissionId && (
        <GradingModal
          key={submissionId}
          submissionId={submissionId}
          open={modalOpen}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
