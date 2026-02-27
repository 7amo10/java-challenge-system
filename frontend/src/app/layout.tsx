import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Java Challenge System",
  description: "Real-world Java refactoring challenges based on Effective Java & Phase 1 roadmap",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-screen">
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl">☕</span>
              <span className="font-mono font-bold text-foreground">
                Java<span className="text-primary">Challenge</span>
              </span>
            </a>
            <div className="flex items-center gap-6">
              <a href="/challenges" className="text-muted hover:text-foreground transition-colors font-mono text-sm">
                challenges/
              </a>
              <a href="/dashboard" className="text-muted hover:text-foreground transition-colors font-mono text-sm">
                dashboard/
              </a>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || ""}/oauth2/authorization/github`}
                className="px-4 py-1.5 rounded-md bg-primary hover:bg-primary-light text-white font-mono text-sm transition-colors glow-primary"
              >
                Login with GitHub
              </a>
            </div>
          </div>
        </nav>
        <main className="pt-16">{children}</main>
        <footer className="border-t border-primary/20 mt-20 py-8 text-center text-muted font-mono text-sm">
          <p>Built for the Java Roadmap 2025 · Phase 1 Challenges</p>
          <p className="mt-1 text-xs opacity-60">Effective Java by Joshua Bloch · Tim Buchalka Masterclass</p>
        </footer>
      </body>
    </html>
  );
}
