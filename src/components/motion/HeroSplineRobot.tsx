import { useEffect, useState } from "react";
import { SplineScene, SPLINE_ROBOT_SCENE_URL } from "@/components/ui/SplineScene";

/** xl (1280px) — load Spline only on large screens to avoid heavy WebGL on mobile/tablet. */
const XL_MEDIA = "(min-width: 1280px)";

export function HeroSplineRobot() {
  const [showRobot, setShowRobot] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(XL_MEDIA);
    const sync = () => setShowRobot(media.matches);
    sync();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", sync);
      return () => media.removeEventListener("change", sync);
    }
    media.addListener(sync);
    return () => media.removeListener(sync);
  }, []);

  if (!showRobot) return null;

  return (
    <div className="pointer-events-none absolute right-[-4%] top-[5%] z-20 h-[92%] w-[42%]" aria-hidden>
      <div className="pointer-events-auto absolute inset-[6%] min-h-0">
        <SplineScene scene={SPLINE_ROBOT_SCENE_URL} className="h-full w-full [&_canvas]:!h-full [&_canvas]:!w-full" />
      </div>
      <div className="absolute bottom-[-6%] left-[24%] right-[34%] h-1.5 rounded-full bg-black/95" />
    </div>
  );
}
