import { motion } from "framer-motion";

/** Soft ambient glow behind the landing hero — warm and inviting. */
export function LandingBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Warm top glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 50% -20%, hsl(var(--primary) / 0.06) 0%, transparent 60%)",
        }}
      />
      {/* Soft orange accent */}
      <motion.div
        className="absolute -top-20 right-[10%] h-[24rem] w-[24rem] rounded-full bg-brand-orange/8 blur-[100px]"
        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Blue accent */}
      <motion.div
        className="absolute top-[40%] -left-20 h-[20rem] w-[20rem] rounded-full bg-primary/6 blur-[100px]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
    </div>
  );
}
