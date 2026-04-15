export type NetworkEventRow = {
  title: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  venue: string | null;
  format: "in-person" | "online" | "hybrid" | "unknown";
  entrance_fee: string | null;
  url: string | null;
  source_hint: string;
  relevance_note: string;
  topics: string[];
};
