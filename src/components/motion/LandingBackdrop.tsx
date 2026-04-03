/** Soft ambient layers behind the landing hero — static (no looping motion). */
export function LandingBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 50% -20%, hsl(var(--primary) / 0.06) 0%, transparent 60%)",
        }}
      />

      <div
        className="absolute -inset-[40%] opacity-[0.65] dark:opacity-50"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, hsl(var(--primary) / 0.07) 0deg, transparent 90deg, hsl(var(--brand-orange) / 0.06) 200deg, transparent 320deg)",
        }}
      />

      <div className="absolute inset-0 dot-pattern-fine opacity-[0.45] dark:opacity-[0.38]" />
      <div className="absolute inset-0 grid-bg opacity-25 dark:opacity-[0.2]" />

      <div className="absolute -top-20 right-[10%] h-[24rem] w-[24rem] rounded-full bg-brand-orange/8 blur-[100px] opacity-50" />
      <div className="absolute top-[40%] -left-20 h-[20rem] w-[20rem] rounded-full bg-primary/6 blur-[100px] opacity-40" />
      <div className="absolute bottom-[-10%] right-[15%] h-[18rem] w-[22rem] rounded-full bg-violet-500/5 blur-[90px] dark:bg-violet-500/10 opacity-35" />
    </div>
  );
}
