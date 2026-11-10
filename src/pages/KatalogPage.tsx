import { useMemo, useState } from "react";
import type { KatalogEntry, KatalogMeta } from "../lib/types";
import katalogData from "../data/katalog.json";
import katalogMeta from "../data/katalogMeta.json";
import { fmtEur } from "../lib/format";
import { Search, Info } from "lucide-react";

const CATALOG = katalogData as KatalogEntry[];
const META = katalogMeta as KatalogMeta;

export function KatalogPage() {
  const [q, setQ] = useState("");
  const [rootFilter, setRootFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<KatalogEntry | null>(null);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return CATALOG.filter((e) => {
      if (rootFilter) {
        const top = (e.kgkPath ?? "").split(" > ")[0];
        if (top !== rootFilter) return false;
      }
      if (!needle) return true;
      const hay = `${e.kgkCode ?? ""} ${e.bezeichnung ?? ""} ${
        e.kgkBezeichnung ?? ""
      } ${e.erlaeuterung ?? ""}`.toLowerCase();
      return hay.includes(needle);
    }).slice(0, 500);
  }, [q, rootFilter]);

  return (
    <div className="h-full flex flex-col">
      <header className="border-b border-ink-200 bg-white px-6 py-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-500">
              Referenzdatenbank
            </div>
            <h1 className="text-xl font-semibold">{META.quelle}</h1>
            <div className="text-sm text-ink-500 mt-0.5">
              Preisstand {META.quartal} · {META.count} Einträge · read-only
            </div>
          </div>
          <div className="text-xs text-ink-500 max-w-md leading-relaxed bg-ink-50 border border-ink-200 rounded p-3">
            Diese Datenbank wird quartalsweise von der DB gepflegt — jede Zeile
            hat eine dokumentierte Quelle und wird per Baupreisindex
            fortgeschrieben. Eigene, projektspezifische Preise werden direkt in
            der Bauwerk-Position erfasst.
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* KGK group filter */}
        <aside className="w-60 border-r border-ink-200 overflow-y-auto bg-white">
          <div className="px-3 py-2 text-xs uppercase tracking-wider text-ink-500 border-b border-ink-200">
            Kostengruppen (DIN 276 / KGK)
          </div>
          <button
            onClick={() => setRootFilter(null)}
            className={`w-full text-left px-3 py-2 text-sm border-l-2 ${
              rootFilter === null
                ? "border-ink-900 bg-ink-50 font-medium"
                : "border-transparent hover:bg-ink-50"
            }`}
          >
            <div>Alle KGK</div>
            <div className="num text-xs text-ink-500">{META.count}</div>
          </button>
          {META.roots.map((r) => (
            <button
              key={r.name}
              onClick={() => setRootFilter(r.name)}
              className={`w-full text-left px-3 py-2 text-sm border-l-2 ${
                rootFilter === r.name
                  ? "border-ink-900 bg-ink-50 font-medium"
                  : "border-transparent hover:bg-ink-50"
              }`}
            >
              <div className="leading-tight">{r.name}</div>
              <div className="num text-xs text-ink-500 mt-0.5">{r.count}</div>
            </button>
          ))}
        </aside>

        {/* search + results */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-2 border-b border-ink-200 bg-white">
            <Search size={14} className="text-ink-400" />
            <input
              className="flex-1 bg-transparent border-0 focus:ring-0 text-sm py-1"
              placeholder="Katalog durchsuchen (KGK-Code, Bezeichnung, Erläuterung) …"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="text-xs text-ink-500">
              {results.length} / {META.count}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-xs text-ink-500 sticky top-0 border-b border-ink-200">
                <tr>
                  <th className="text-left px-3 py-2 w-24 font-medium">KGK</th>
                  <th className="text-left px-3 py-2 font-medium">
                    Bezeichnung
                  </th>
                  <th className="text-left px-3 py-2 w-16 font-medium">
                    Einh.
                  </th>
                  <th className="text-right px-3 py-2 w-28 font-medium">
                    Preis Q3/26
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((e) => {
                  const active = selected?.id === e.id;
                  return (
                    <tr
                      key={e.id}
                      onClick={() => setSelected(e)}
                      className={`border-t border-ink-100 cursor-pointer ${
                        active ? "bg-ink-100" : "hover:bg-ink-50"
                      }`}
                    >
                      <td className="px-3 py-1.5 num text-xs text-ink-500">
                        {e.kgkCode}
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="leading-tight">{e.bezeichnung}</div>
                        {e.erlaeuterung && (
                          <div className="text-xs text-ink-500 mt-0.5">
                            {e.erlaeuterung}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-ink-600 text-xs">
                        {e.einheit}
                      </td>
                      <td className="px-3 py-1.5 num">
                        {fmtEur(e.preis, 2)}
                      </td>
                    </tr>
                  );
                })}
                {results.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-10 text-center text-ink-400"
                    >
                      Keine Ergebnisse.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* detail */}
        {selected ? (
          <aside className="w-96 border-l border-ink-200 overflow-y-auto bg-ink-50">
            <div className="p-5 space-y-4 text-sm">
              <div>
                <div className="text-xs text-ink-500 uppercase tracking-wider">
                  KGK
                </div>
                <div className="num text-sm">{selected.kgkCode}</div>
                <div className="text-xs text-ink-600 mt-0.5 leading-snug">
                  {selected.kgkPath}
                </div>
              </div>

              <div>
                <div className="text-xs text-ink-500 uppercase tracking-wider">
                  Bezeichnung
                </div>
                <div className="font-medium leading-tight">
                  {selected.bezeichnung}
                </div>
                {selected.erlaeuterung && (
                  <div className="text-xs text-ink-600 mt-1">
                    {selected.erlaeuterung}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-ink-500">Einheit</div>
                  <div className="text-sm">{selected.einheit ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-ink-500">Preisart</div>
                  <div className="text-sm">{selected.preisart ?? "—"}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-ink-500 uppercase tracking-wider">
                  Preis Q3 2026
                </div>
                <div className="num text-2xl font-semibold">
                  {fmtEur(selected.preis, 2)}
                </div>
              </div>

              {selected.ansatzGrundlage && (
                <div>
                  <div className="text-xs text-ink-500 uppercase tracking-wider">
                    Ansatzgrundlage
                  </div>
                  <div className="text-xs leading-relaxed">
                    {selected.ansatzGrundlage}
                  </div>
                </div>
              )}

              {selected.quelle && (
                <div>
                  <div className="text-xs text-ink-500 uppercase tracking-wider">
                    Quelle
                  </div>
                  <div className="text-xs">{selected.quelle}</div>
                  {selected.fundstelle && (
                    <div className="text-xs text-ink-500 mt-0.5">
                      {selected.fundstelle}
                    </div>
                  )}
                </div>
              )}

              {selected.pruefhinweis && (
                <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded p-2">
                  <Info
                    size={14}
                    className="text-amber-700 flex-shrink-0 mt-0.5"
                  />
                  <div className="text-xs text-amber-900 leading-relaxed">
                    {selected.pruefhinweis}
                  </div>
                </div>
              )}
            </div>
          </aside>
        ) : (
          <aside className="w-96 border-l border-ink-200 bg-ink-50 flex items-center justify-center p-8 text-center text-xs text-ink-500">
            Wähle einen Eintrag in der Tabelle, um Details, Quelle und
            Prüfhinweis zu sehen.
          </aside>
        )}
      </div>
    </div>
  );
}
