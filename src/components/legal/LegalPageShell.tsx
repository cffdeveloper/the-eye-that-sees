import { Link } from "react-router-dom";
import { BrandHexMark } from "@/components/BrandHexMark";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ArrowLeft } from "lucide-react";

type Props = {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
};

export function LegalPageShell({ title, lastUpdated = "March 22, 2026", children }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-5 h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors justify-self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
          <div className="flex items-center gap-2 min-w-0 justify-center max-w-[min(100%,14rem)] sm:max-w-md">
            <BrandHexMark size="sm" />
            <span className="font-semibold text-foreground truncate text-sm sm:text-base">{title}</span>
          </div>
          <div className="justify-self-end flex items-center justify-end">
            <ThemeToggle size="sm" />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10 sm:py-14">
        <p className="text-xs text-muted-foreground mb-8">Last updated: {lastUpdated}</p>
        <div className="space-y-8 text-sm sm:text-[15px] leading-relaxed text-foreground/90 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:pt-4 [&_h2]:first:pt-0 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-6 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_p]:text-muted-foreground">
          {children}
        </div>

        <footer className="mt-16 pt-8 border-t border-border/50 flex flex-wrap gap-4 text-sm">
          <Link to="/privacy-policy" className="text-primary font-medium hover:underline">
            Privacy policy
          </Link>
          <Link to="/terms-of-service" className="text-primary font-medium hover:underline">
            Terms of service
          </Link>
          <Link to="/auth" className="text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
        </footer>
      </main>
    </div>
  );
}
