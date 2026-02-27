"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: Props) {
  return (
    <div className={`prose prose-invert prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-bold font-mono text-foreground mb-3">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold font-mono text-primary mb-2 mt-4">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold font-mono text-primary/80 mb-1 mt-3">{children}</h3>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 my-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1 my-2 list-decimal list-inside">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 text-sm text-muted">
              <span className="text-primary mt-0.5 shrink-0">▸</span>
              <span>{children}</span>
            </li>
          ),
          p: ({ children }) => (
            <p className="text-sm text-muted leading-relaxed my-1">{children}</p>
          ),
          code: ({ children, className: cls }) => {
            const isBlock = cls?.includes("language-");
            return isBlock ? (
              <code className="block bg-surface rounded-md p-3 font-mono text-xs text-primary/90 overflow-auto my-2 whitespace-pre">
                {children}
              </code>
            ) : (
              <code className="font-mono text-xs bg-surface text-primary/90 px-1.5 py-0.5 rounded">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-surface rounded-lg p-4 overflow-auto my-3 text-xs font-mono text-primary/90">
              {children}
            </pre>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-muted/80 italic">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer"
               className="text-primary hover:text-primary-light underline underline-offset-2 transition-colors">
              {children}
            </a>
          ),
          // Render GFM task list items (- [ ] / - [x])
          input: ({ type, checked }) =>
            type === "checkbox" ? (
              <input
                type="checkbox"
                checked={checked}
                readOnly
                className="mr-1.5 accent-primary align-middle"
              />
            ) : null,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
