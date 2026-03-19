import { useState } from "react";
import { useNexusChat } from "@/hooks/useNexusChat";
import { TopNav } from "@/components/TopNav";
import { StatusBar } from "@/components/StatusBar";
import { ModeSelector } from "@/components/ModeSelector";
import { MessageList } from "@/components/MessageList";
import { ChatInput } from "@/components/ChatInput";
import { ArtifactsSidebar } from "@/components/ArtifactsSidebar";
import { toast } from "sonner";
import { useEffect } from "react";
import { PanelRight } from "lucide-react";

const NexusDashboard = () => {
  const { messages, isStreaming, error, mode, setMode, send, clear } = useNexusChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Auto-open sidebar when first artifacts appear
  useEffect(() => {
    if (messages.some(m => m.role === "assistant" && m.content.includes(":::"))) {
      setSidebarOpen(true);
    }
  }, [messages]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(185 100% 50% / 0.02) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <TopNav onClear={clear} hasMessages={messages.length > 0} />
        <StatusBar />

        <div className="flex-1 flex min-h-0">
          {/* Main chat area */}
          <div className="flex-1 flex flex-col min-h-0 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-4 pb-3 gap-3">
            <div className="flex items-center justify-between">
              <ModeSelector mode={mode} onChange={setMode} />
              {messages.length > 0 && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-mono transition-all border ${
                    sidebarOpen
                      ? "text-primary bg-primary/10 border-primary/20"
                      : "text-muted-foreground hover:text-foreground border-transparent hover:border-border/50 hover:bg-muted/30"
                  }`}
                >
                  <PanelRight className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Artifacts</span>
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <MessageList messages={messages} isStreaming={isStreaming} />
            </div>

            <ChatInput onSend={send} isStreaming={isStreaming} />
          </div>

          {/* Artifacts sidebar */}
          <ArtifactsSidebar
            messages={messages}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default NexusDashboard;
