import { useEffect } from "react";
import { useMap } from "react-leaflet";

/** Prevents grey / missing tiles after layout or viewport changes (see Leaflet + react-leaflet guide). */
export function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 120);
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);
  return null;
}
