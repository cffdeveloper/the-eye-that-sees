import { useEffect, useRef, useState } from "react";

const DEFAULT_MIN_MS = 280;

/**
 * Keeps a "loading" shell visible for at least `minMs` after `active` becomes false,
 * avoiding sub‑300ms flashes that feel jittery.
 */
export function useMinimumSkeleton(active: boolean, minMs = DEFAULT_MIN_MS) {
  const [show, setShow] = useState(active);
  const sinceRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (active) {
      sinceRef.current = Date.now();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setShow(true);
      return;
    }

    const started = sinceRef.current;
    if (started == null) {
      setShow(false);
      return;
    }

    const elapsed = Date.now() - started;
    const remaining = Math.max(0, minMs - elapsed);
    sinceRef.current = null;

    if (remaining === 0) {
      setShow(false);
      return;
    }

    timeoutRef.current = setTimeout(() => setShow(false), remaining);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [active, minMs]);

  return show;
}
