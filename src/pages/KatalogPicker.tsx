import { useMemo, useState } from "react";
import type { KatalogEntry, KatalogMeta } from "../lib/types";
import katalogData from "../data/katalog.json";
import katalogMeta from "../data/katalogMeta.json";
import { fmtEur } from "../lib/format";
import { X, Search, Info } from "lucide-react";

const CATALOG = katalogData as KatalogEntry[];
const META = katalogMeta as KatalogMeta;

type PickResult = {
  kgkCode: string | null;
  bezeichnung: string;
  einheit: string | null;
  preis: number | null;
};

export function KatalogPicker({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (r: PickResult) => void;
}) {
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
    }).slice(0, 300);
  }, [q, rootFilter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 no-print">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[85vh] flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-200">
          <Search size={16} className="text-ink-400" />
          <input
            autoFocus
            className="flex-1 bg-transparent border-0 focus:ring-0 text-sm"
            placeholder="Katalog durchsuchen (KGK-Code, Bezeichnung) …"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="text-xs text-ink-500">
            {META.quelle} · {META.quartal}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-ink-500 hover:text-ink-900"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* KGK group filter */}
          <aside className="w-56 border-r border-ink-200 overflow-y-auto">
            <button
              onClick={() => setRootFilter(null)}
              className={`w-full text-left px-3 py-2 text-xs border-l-2 ${
                rootFilter === null
                  ? "border-ink-900 bg-ink-50 font-medium"
                  : "border-transparent hover:bg-ink-50"
              }`}
            >
              <div>Alle KGK</div>
              <div className="num text-ink-500">{META.count}</div>
            </button>
            {META.roots.map((r) => (
              <button
                key={r.name}
                onClick={() => setRootFilter(r.name)}
                className={`w-full text-left px-3 py-2 text-xs border-l-2 ${
                  rootFilter === r.name
                    ? "border-ink-900 bg-ink-50 font-medium"
                    : "border-transparent hover:bg-ink-50"
                }`}
              >
                <div className="leading-tight">{r.name}</div>
                <div className="num text-ink-500 mt-0.5">{r.count}</div>
              </button>
            ))}
          </aside>

          {/* results */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-xs text-ink-500 sticky top-0">
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
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {results.map((e) => {
                  const active = selected?.id === e.id;
                  return (
                    <tr
                      key={e.id}
                      onClick={() => setSelected(e)}
                      onDoubleClick={() => {
                        onPick({
                          kgkCode: e.kgkCode,
                          bezeichnung:
                            [e.bezeichnung, e.erlaeuterung]
                              .filter(Boolean)
                              .join(" — ") || e.kgkBezeichnung || "",
                          einheit: e.einheit,
                          preis: e.preis,
                        });
                        onClose();
                      }}
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
                      <td className="px-1">
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onPick({
                              kgkCode: e.kgkCode,
                              bezeichnung:
                                [e.bezeichnung, e.erlaeuterung]
                                  .filter(Boolean)
                                  .join(" — ") || e.kgkBezeichnung || "",
                              einheit: e.einheit,
                              preis: e.preis,
                            });
                            onClose();
                          }}
                          className="text-xs text-ink-600 hover:text-ink-900 px-2 py-1 rounded hover:bg-white"
                        >
                          Einfügen
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {results.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-ink-400"
                    >
                      Keine Ergebnisse.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* detail */}
          {selected && (
            <aside className="w-80 border-l border-ink-200 overflow-y-auto bg-ink-50">
              <div className="p-4 space-y-3 text-sm">
                <div>
                  <div className="text-xs text-ink-500 uppercase tracking-wider">
                    KGK
                  </div>
                  <div className="num text-sm">{selected.kgkCode}</div>
                  <div className="text-xs text-ink-600 mt-0.5">
                    {selected.kgkPath}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-ink-500 uppercase tracking-wider">
                    Bezeichnung
                  </div>
                  <div className="leading-tight">{selected.bezeichnung}</div>
                  {selected.erlaeuterung && (
                    <div className="text-xs text-ink-500 mt-1">
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
                  <div className="num text-lg font-semibold">
                    {fmtEur(selected.preis, 2)}
                  </div>
                </div>

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

                <button
                  onClick={() => {
                    onPick({
                      kgkCode: selected.kgkCode,
                      bezeichnung:
                        [selected.bezeichnung, selected.erlaeuterung]
                          .filter(Boolean)
                          .join(" — ") || selected.kgkBezeichnung || "",
                      einheit: selected.einheit,
                      preis: selected.preis,
                    });
                    onClose();
                  }}
                  className="w-full px-3 py-2 text-sm bg-ink-900 text-white rounded hover:bg-ink-800"
                >
                  In Position einfügen
                </button>
              </div>
            </aside>
          )}
        </div>

        <div className="px-4 py-2 border-t border-ink-200 text-xs text-ink-500 flex justify-between">
          <span>
            {results.length} / {META.count} Einträge · Enter = Einfügen ·
            Doppelklick übernimmt
          </span>
          <span>Read-only Referenzdatenbank — nicht editierbar</span>
        </div>
      </div>
    </div>
  );
}
