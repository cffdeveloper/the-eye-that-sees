import { useGeoContext } from "@/contexts/GeoContext";
import { AlfredReadPanel } from "@/components/desk/AlfredReadPanel";

export default function ReadsPage() {
  const { geoString, isGlobal } = useGeoContext();
  const geoHint = isGlobal ? "global markets" : geoString;

  return (
    <div className="w-full max-w-6xl space-y-5 pb-10">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Reads</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Cross-industry intelligence digests save automatically. A fresh standard report is generated every two hours — distinct from your
          recent editions. Geography lens: <span className="font-medium text-foreground">{geoHint}</span>.
        </p>
      </header>
      <AlfredReadPanel geoHint={geoHint} />
    </div>
  );
}
