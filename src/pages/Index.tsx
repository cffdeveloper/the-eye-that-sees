import { useNexusChat } from "@/hooks/useNexusChat";
import { TopNav } from "@/components/TopNav";
import { StatusBar } from "@/components/StatusBar";
import { ModeSelector } from "@/components/ModeSelector";
import { MessageList } from "@/components/MessageList";
import { ChatInput } from "@/components/ChatInput";
import { toast } from "sonner";
import { useEffect } from "react";

const NexusDashboard = () => {
  const { messages, isStreaming, error, mode, setMode, send, clear } = useNexusChat();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Subtle grid background */}
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />

      {/* Radial gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(185 100% 50% / 0.03) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <TopNav onClear={clear} hasMessages={messages.length > 0} />
        <StatusBar />

        <div className="flex-1 flex flex-col min-h-0 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-4 pb-3 gap-3">
          <ModeSelector mode={mode} onChange={setMode} />

          <div className="flex-1 flex flex-col min-h-0">
            <MessageList messages={messages} isStreaming={isStreaming} />
          </div>

          <ChatInput onSend={send} isStreaming={isStreaming} />
        </div>
      </div>
    </div>
  );
};

export default NexusDashboard;
