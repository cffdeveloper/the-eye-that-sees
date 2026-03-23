import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileBottomNav } from "./MobileBottomNav";
import { useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function AppLayout() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : true,
  );
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [location.pathname, isDesktop]);

  useEffect(() => {
    if (!isDesktop && sidebarOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
    return undefined;
  }, [isDesktop, sidebarOpen]);

  const closeMobileSidebar = () => {
    if (!isDesktop) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopBar sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen((o) => !o)} />
      <div className="relative flex min-h-0 flex-1">
        {!isDesktop && sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 top-[60px] z-30 bg-background/70 backdrop-blur-[1px]"
            aria-label="Close navigation"
            onClick={closeMobileSidebar}
          />
        )}
        <Sidebar
          open={sidebarOpen}
          overlay={!isDesktop}
          onNavigate={closeMobileSidebar}
        />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-background px-3 pt-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:px-5 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-full w-full max-w-[100vw]"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
