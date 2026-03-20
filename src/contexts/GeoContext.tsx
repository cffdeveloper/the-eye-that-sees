import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { GeoOption, getGeoContextString } from "@/lib/geoData";

type GeoContextType = {
  selections: GeoOption[];
  setSelections: (s: GeoOption[]) => void;
  addSelection: (s: GeoOption) => void;
  removeSelection: (value: string) => void;
  clearSelections: () => void;
  geoString: string; // human-readable string for AI prompts
  isGlobal: boolean;
};

const GeoContext = createContext<GeoContextType>({
  selections: [],
  setSelections: () => {},
  addSelection: () => {},
  removeSelection: () => {},
  clearSelections: () => {},
  geoString: "global",
  isGlobal: true,
});

export function GeoProvider({ children }: { children: ReactNode }) {
  const [selections, setSelectionsRaw] = useState<GeoOption[]>([]);

  const setSelections = useCallback((s: GeoOption[]) => setSelectionsRaw(s), []);

  const addSelection = useCallback((s: GeoOption) => {
    setSelectionsRaw(prev => {
      if (prev.find(p => p.value === s.value)) return prev;
      return [...prev, s];
    });
  }, []);

  const removeSelection = useCallback((value: string) => {
    setSelectionsRaw(prev => prev.filter(p => p.value !== value));
  }, []);

  const clearSelections = useCallback(() => setSelectionsRaw([]), []);

  const geoString = getGeoContextString(selections);
  const isGlobal = selections.length === 0;

  return (
    <GeoContext.Provider value={{ selections, setSelections, addSelection, removeSelection, clearSelections, geoString, isGlobal }}>
      {children}
    </GeoContext.Provider>
  );
}

export function useGeoContext() {
  return useContext(GeoContext);
}
