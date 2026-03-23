import { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

export const SPLINE_ROBOT_SCENE_URL =
  "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}
