import { useGeoContext } from "@/contexts/GeoContext";
import { AlfredEventsPanel } from "@/components/desk/AlfredEventsPanel";

export default function EventsPage() {
  const { geoString, isGlobal } = useGeoContext();
  const geoHint = isGlobal ? "global markets" : geoString;

  return (
    <div className="w-full max-w-6xl space-y-5 pb-10">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Events</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Conferences, networking, trade shows, culture, and community — scanned broadly across industries. Geography lens:{" "}
          <span className="font-medium text-foreground">{geoHint}</span>. New batches merge in every two hours.
        </p>
      </header>
      <AlfredEventsPanel geoHint={geoHint} />
    </div>
  );
}
