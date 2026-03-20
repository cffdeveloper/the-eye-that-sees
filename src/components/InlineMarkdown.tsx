import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface InlineMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Renders markdown inline — used for AI-generated text snippets
 * that may contain **bold**, *italic*, `code`, links, lists, etc.
 */
export function InlineMarkdown({ content, className = "" }: InlineMarkdownProps) {
  return (
    <span className={`inline-markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <span className="inline">{children}</span>,
          strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-card-foreground/90">{children}</em>,
          code: ({ children }) => (
            <code className="px-1 py-0.5 rounded bg-muted text-primary/90 text-[0.85em] font-mono border border-border/30">
              {children}
            </code>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener">
              {children}
            </a>
          ),
          ul: ({ children }) => <span className="inline">{children}</span>,
          ol: ({ children }) => <span className="inline">{children}</span>,
          li: ({ children }) => <span className="inline">• {children} </span>,
          h1: ({ children }) => <span className="font-bold text-foreground">{children}</span>,
          h2: ({ children }) => <span className="font-bold text-foreground">{children}</span>,
          h3: ({ children }) => <span className="font-semibold text-foreground">{children}</span>,
        }}
      >
        {content}
      </ReactMarkdown>
    </span>
  );
}

/**
 * Block-level markdown renderer for multi-line AI content (summaries, analyses).
 */
export function BlockMarkdown({ content, className = "" }: InlineMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-sm font-bold text-primary font-mono tracking-wide mt-3 mb-1">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xs font-bold text-primary font-mono tracking-wide uppercase mt-2 mb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xs font-semibold text-foreground font-mono tracking-wide mt-2 mb-0.5">{children}</h3>,
          strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="text-card-foreground/90">{children}</em>,
          code: ({ children, className: cn }) => {
            if (cn?.includes("language-")) {
              return <code className="text-xs font-mono text-card-foreground">{children}</code>;
            }
            return <code className="px-1 py-0.5 rounded bg-muted text-primary/90 text-[0.85em] font-mono border border-border/30">{children}</code>;
          },
          pre: ({ children }) => <pre className="my-2 p-2.5 rounded-md bg-muted/50 border border-border/40 overflow-x-auto">{children}</pre>,
          ul: ({ children }) => <ul className="space-y-0.5 my-1">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-0.5 my-1 list-decimal list-inside">{children}</ol>,
          li: ({ children }) => (
            <li className="flex items-start gap-1.5">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary/40 flex-shrink-0" />
              <span>{children}</span>
            </li>
          ),
          p: ({ children }) => <p className="mb-1.5 leading-relaxed">{children}</p>,
          a: ({ children, href }) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener">{children}</a>,
          hr: () => <hr className="my-3 border-border/30" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
