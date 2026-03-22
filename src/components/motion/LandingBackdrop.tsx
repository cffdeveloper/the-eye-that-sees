import { motion } from "framer-motion";

/** Soft ambient layers behind the landing hero — animated mesh, dots, grid, and glow orbs. */
export function LandingBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Warm top wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 50% -20%, hsl(var(--primary) / 0.06) 0%, transparent 60%)",
        }}
      />

      {/* Slow aurora veil — subtle hue drift */}
      <motion.div
        className="absolute -inset-[40%] opacity-[0.65] dark:opacity-50"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, hsl(var(--primary) / 0.07) 0deg, transparent 90deg, hsl(var(--brand-orange) / 0.06) 200deg, transparent 320deg)",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      />

      {/* Drifting dot + grid (period matches background-size for seamless loops) */}
      <motion.div
        className="absolute inset-0 dot-pattern-fine opacity-[0.45] dark:opacity-[0.38]"
        animate={{ backgroundPosition: ["0px 0px", "20px 20px"] }}
        transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 grid-bg opacity-25 dark:opacity-[0.2]"
        animate={{ backgroundPosition: ["0px 0px", "64px 64px"] }}
        transition={{ duration: 68, repeat: Infinity, ease: "linear" }}
      />

      {/* Soft orange accent */}
      <motion.div
        className="absolute -top-20 right-[10%] h-[24rem] w-[24rem] rounded-full bg-brand-orange/8 blur-[100px]"
        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4], x: ["0%", "3%", "0%"], y: ["0%", "2%", "0%"] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Blue accent */}
      <motion.div
        className="absolute top-[40%] -left-20 h-[20rem] w-[20rem] rounded-full bg-primary/6 blur-[100px]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3], x: ["0%", "-4%", "0%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      {/* Mauve / violet depth */}
      <motion.div
        className="absolute bottom-[-10%] right-[15%] h-[18rem] w-[22rem] rounded-full bg-violet-500/5 blur-[90px] dark:bg-violet-500/10"
        animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.45, 0.25], rotate: [0, 8, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
    </div>
  );
}
