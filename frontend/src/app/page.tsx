"use client";

import { Suspense, lazy } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/types";
import {
  Wrench, Hammer, Bug, Search, Download, Terminal, BarChart3,
  Code2, Blocks, Database, Shield, Zap, Library,
  FlaskConical, EyeOff, CheckCircle, ArrowRight, ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

const HeroScene = lazy(() => import("@/components/three/HeroScene"));

const CATEGORY_ICONS: Record<number, LucideIcon> = {
  1: Code2, 2: Blocks, 3: Database, 4: Shield, 5: Zap, 6: Library,
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-28 pb-24 max-w-7xl mx-auto min-h-[80vh] flex items-center">
        {/* 3D Background — lazy loaded */}
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>

        {/* Gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent/15 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm text-primary text-sm font-mono mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            6 Categories · 3 Challenge Types · Sandboxed Grading
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold font-mono mb-6 leading-tight"
          >
            <span className="text-foreground">Engineer Better</span>{" "}
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Java.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Real-world challenges drawn from production incidents. Refactor legacy systems,
            build scalable solutions, and prove your engineering skill.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex gap-4 justify-center"
          >
            <Link
              href="/challenges"
              className="group px-8 py-3 rounded-lg bg-primary hover:bg-primary-light text-white font-mono font-semibold transition-all glow-primary hover:scale-105 inline-flex items-center gap-2"
            >
              Explore Challenges <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-3 rounded-lg border border-primary/40 text-muted hover:text-foreground hover:border-primary font-mono transition-all inline-flex items-center gap-2 backdrop-blur-sm"
            >
              How It Works <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Challenge Types */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <ScrollReveal>
          <h2 className="text-2xl font-bold font-mono text-center mb-14">
            <span className="text-primary">$</span> Three Ways to Prove Yourself
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              Icon: Wrench,
              title: "Refactor",
              desc: "Inherit a legacy codebase riddled with anti-patterns. Your mission: transform it into production-grade code while preserving all existing behavior.",
              badge: "6 challenges",
              badgeClass: "bg-violet-900/40 text-violet-300 border border-violet-700",
              gradient: "from-violet-500/10 to-transparent",
            },
            {
              Icon: Hammer,
              title: "Implement",
              desc: "Start with a blank canvas and a set of requirements. Design, build, and test a solution that meets enterprise standards.",
              badge: "2 challenges",
              badgeClass: "bg-emerald-900/40 text-emerald-300 border border-emerald-700",
              gradient: "from-emerald-500/10 to-transparent",
            },
            {
              Icon: Bug,
              title: "Debug",
              desc: "A production system is failing. Analyze stack traces, trace the root cause, and ship the fix — under pressure.",
              badge: "2 challenges",
              badgeClass: "bg-orange-900/40 text-orange-300 border border-orange-700",
              gradient: "from-orange-500/10 to-transparent",
            },
          ].map(({ Icon, title, desc, badge, badgeClass, gradient }, i) => (
            <ScrollReveal key={title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`glass rounded-xl p-6 bg-gradient-to-b ${gradient} h-full`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-mono font-semibold text-foreground text-lg">{title}</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-4">{desc}</p>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${badgeClass}`}>
                  {badge}
                </span>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Stats Band */}
      <section className="px-6 py-12 border-y border-primary/10 bg-surface/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 10, suffix: "+", label: "Challenges" },
            { value: 6, suffix: "", label: "Categories" },
            { value: 3, suffix: "", label: "Challenge Types" },
            { value: 100, suffix: "", label: "Max Score" },
          ].map(({ value, suffix, label }, i) => (
            <ScrollReveal key={label} delay={i * 0.08}>
              <div>
                <AnimatedCounter
                  value={value}
                  suffix={suffix}
                  className="text-3xl font-bold font-mono text-primary block"
                />
                <div className="text-sm text-muted mt-1">{label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-20 max-w-7xl mx-auto">
        <ScrollReveal>
          <h2 className="text-2xl font-bold font-mono text-center mb-14">
            <span className="text-primary">$</span> Your Workflow
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {[
            { step: "01", Icon: Search, title: "Choose a Challenge", desc: "Browse challenges across 6 categories. Each one simulates a real enterprise scenario." },
            { step: "02", Icon: Download, title: "Get the Starter", desc: "Download a complete Maven project with source code, JUnit 5 tests, and requirements." },
            { step: "03", Icon: Terminal, title: "Solve Locally", desc: "Work in your IDE. Run mvn test to validate. Iterate until all tests pass." },
            { step: "04", Icon: BarChart3, title: "Submit & Score", desc: "Upload your solution. Our sandboxed grader evaluates correctness and code quality." },
          ].map(({ step, Icon, title, desc }, i) => (
            <ScrollReveal key={step} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -4 }}
                className="glass rounded-xl p-6 relative text-center"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/30 mb-4">
                  <span className="text-xs font-mono font-bold text-primary">{step}</span>
                </div>
                <Icon className="w-7 h-7 text-primary mx-auto mb-3" />
                <h3 className="font-mono font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <ScrollReveal>
          <h2 className="text-2xl font-bold font-mono text-center mb-14">
            <span className="text-primary">$</span> Challenge Categories
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(CATEGORIES).map(([id, category], i) => {
            const Icon = CATEGORY_ICONS[parseInt(id)] || Code2;
            return (
              <ScrollReveal key={id} delay={i * 0.08}>
                <Link href={`/challenges?category=${id}`} className="block h-full">
                  <motion.div
                    whileHover={{ y: -4, borderColor: "rgba(124, 58, 237, 0.5)" }}
                    className="glass rounded-xl p-6 h-full group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-mono font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted mt-1">{category.description}</p>
                    <div className="mt-3 text-xs font-mono text-primary/60 group-hover:text-primary inline-flex items-center gap-1 transition-colors">
                      Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Score breakdown */}
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <ScrollReveal>
          <div className="glass rounded-xl p-8 text-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 rounded-full blur-[60px]" />
            </div>

            <h2 className="text-xl font-bold font-mono mb-8 text-foreground relative">Scoring Breakdown</h2>
            <div className="grid grid-cols-3 gap-6 relative">
              {[
                { Icon: FlaskConical, label: "Visible Tests", pts: 40, color: "text-blue-400" },
                { Icon: EyeOff, label: "Hidden Tests", pts: 40, color: "text-purple-400" },
                { Icon: CheckCircle, label: "Code Quality", pts: 20, color: "text-amber-400" },
              ].map(({ Icon, label, pts, color }) => (
                <div key={label}>
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
                  <AnimatedCounter value={pts} suffix=" pts" className={`text-2xl font-bold font-mono ${color} block`} />
                  <div className="text-xs text-muted mt-1">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted mt-8 relative">
              Score ≥ 60 = Pass. All tests run inside an isolated Docker sandbox.
            </p>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
