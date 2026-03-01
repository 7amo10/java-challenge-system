import type { Metadata } from "next";
import { Code2, Github, LogIn } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Java Challenge System",
  description: "Real-world Java engineering challenges. Refactor legacy systems, build scalable solutions, and prove your skill.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-screen">
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <Code2 className="w-6 h-6 text-primary" />
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
                href={`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/oauth2/authorization/github`}
                className="px-4 py-1.5 rounded-md bg-primary hover:bg-primary-light text-white font-mono text-sm transition-colors glow-primary inline-flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                <span>Sign in</span>
              </a>
            </div>
          </div>
        </nav>
        <main className="pt-16">{children}</main>
        <footer className="border-t border-primary/20 mt-20 py-8 text-center text-muted font-mono text-sm">
          <p>Built for engineers who take craft seriously.</p>
        </footer>
      </body>
    </html>
  );
}
