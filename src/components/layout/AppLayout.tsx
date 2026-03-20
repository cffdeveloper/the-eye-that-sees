import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useState } from "react";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Subtle grid bg */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <TopBar sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-1 min-h-0">
          <Sidebar open={sidebarOpen} />
          <main className="flex-1 overflow-y-auto p-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
