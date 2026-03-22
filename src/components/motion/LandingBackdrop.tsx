import { motion } from "framer-motion";

/** Ambient motion behind the marketing hero — keeps brand colors separate (no blended gradients). */
export function LandingBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 grid-bg opacity-[0.12]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 95% 65% at 50% -28%, hsl(var(--primary) / 0.1) 0%, transparent 55%)",
        }}
      />
      <motion.div
        className="absolute -top-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -left-32 h-[22rem] w-[22rem] rounded-full bg-brand-orange/15 blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-2xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
