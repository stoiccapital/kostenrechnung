export type LineItem = {
  id: string;
  kgk?: string | null;
  text: string;
  menge: number;
  einheit: string;
  einheitspreis: number;
  anmerkung?: string | null;
};

export type Section = {
  id: string;
  lfdNr: number;
  name: string;
  items: LineItem[];
};

export type Bauwerk = {
  id: string;
  name: string;
  km?: string;
  sections: Section[];
};

export type Project = {
  id: string;
  name: string;
  bauwerke: Bauwerk[];
};

export type KatalogEntry = {
  id: string;
  kgkCode: string | null;
  kgkPath: string | null;
  kgkBezeichnung: string | null;
  bezeichnung: string | null;
  erlaeuterung: string | null;
  ansatzGrundlage: string | null;
  einheit: string | null;
  preisart: string | null;
  preis: number | null;
  quelle: string | null;
  fundstelle: string | null;
  pruefhinweis: string | null;
};

export type KatalogMeta = {
  quartal: string;
  quelle: string;
  count: number;
  roots: { name: string; count: number }[];
};

// Map DB Ril808 section lfdNr → KG 300/400/500/700 for the Kostenermittlung rollup.
// 1 Grunderwerb → KG 100; 2–7 inside Bauwerke → KG 300; 8–10 (Verkehrsflächen, Sparten,
// Anlagen Dritter) → KG 500 (Außenanlagen); 11 Sonstiges → KG 700 (Baunebenkosten).
export const SECTION_TO_KG: Record<number, 100 | 300 | 400 | 500 | 700> = {
  1: 100,
  2: 300,
  3: 300,
  4: 300,
  5: 300,
  6: 300,
  7: 300,
  8: 500,
  9: 500,
  10: 500,
  11: 700,
};

export const KG_LABELS: Record<number, string> = {
  100: "Grundstück",
  200: "Herrichten und Erschließen",
  300: "Bauwerk — Baukonstruktionen",
  400: "Bauwerk — Technische Anlagen",
  500: "Außenanlagen",
  600: "Ausstattung und Kunstwerke",
  700: "Baunebenkosten",
  800: "Fahrzeuge und sonstiges",
};
