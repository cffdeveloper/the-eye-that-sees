import { Newspaper, Loader2, ExternalLink } from "lucide-react";
import { ClickableItem } from "./ClickableItem";

interface Article {
  title: string;
  summary: string;
  source?: string;
  url?: string;
  publishedAt?: string;
  category?: string;
}

interface NewsFeedProps {
  articles: Article[];
  loading: boolean;
  industryName?: string;
  subFlowName?: string;
}

export function NewsFeed({ articles, loading, industryName, subFlowName }: NewsFeedProps) {
  if (loading && !articles.length) {
    return (
      <div className="glass-panel p-4">
        <h2 className="text-xs font-mono font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Newspaper className="w-3.5 h-3.5 text-primary" /> LIVE NEWS FEED
        </h2>
        <div className="flex items-center gap-2 py-4">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-xs font-mono text-muted-foreground">Fetching latest news...</span>
        </div>
      </div>
    );
  }

  if (!articles.length) return null;

  return (
    <div className="glass-panel p-4">
      <h2 className="text-xs font-mono font-bold text-foreground mb-3 flex items-center gap-1.5">
        <Newspaper className="w-3.5 h-3.5 text-primary" /> LIVE NEWS FEED
        <span className="text-[8px] font-mono text-muted-foreground ml-auto">{articles.length} articles</span>
      </h2>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {articles.map((article, i) => (
          <ClickableItem
            key={i}
            title={article.title}
            detail={article.summary}
            industryName={industryName}
            subFlowName={subFlowName}
            className="p-2.5 rounded bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-mono font-bold text-foreground leading-snug">{article.title}</p>
              {article.url && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            {article.summary && (
              <p className="text-[9px] font-mono text-muted-foreground mt-1 leading-relaxed">{article.summary}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              {article.source && (
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">{article.source}</span>
              )}
              {article.publishedAt && (
                <span className="text-[8px] font-mono text-muted-foreground">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </ClickableItem>
        ))}
      </div>
    </div>
  );
}
