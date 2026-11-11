import { useMemo, useState } from "react";
import { bauwerkSum, sectionSum, useStore } from "../lib/store";
import { fmtEur } from "../lib/format";
import { NumCell } from "../components/NumCell";
import { NumInput } from "../components/NumInput";
import { TextInput } from "../components/TextInput";
import {
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
  Search,
} from "lucide-react";
import { KatalogPicker } from "./KatalogPicker";

export function BauwerkePage({
  bauwerkId,
  onSelectBauwerk,
}: {
  bauwerkId: string;
  onSelectBauwerk: (id: string) => void;
}) {
  const project = useStore((s) => s.project);
  const renameBauwerk = useStore((s) => s.renameBauwerk);
  const removeBauwerk = useStore((s) => s.removeBauwerk);
  const duplicateBauwerk = useStore((s) => s.duplicateBauwerk);
  const addSection = useStore((s) => s.addSection);
  const renameSection = useStore((s) => s.renameSection);
  const removeSection = useStore((s) => s.removeSection);
  const addItem = useStore((s) => s.addItem);
  const updateItem = useStore((s) => s.updateItem);
  const removeItem = useStore((s) => s.removeItem);

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [katalogSectionId, setKatalogSectionId] = useState<string | null>(null);

  const bauwerk = project.bauwerke.find((b) => b.id === bauwerkId);
  const bauwerkTotal = useMemo(
    () => (bauwerk ? bauwerkSum(bauwerk) : 0),
    [bauwerk]
  );

  if (!bauwerk) {
    return (
      <div className="h-full overflow-y-auto p-8 text-ink-500">
        Bauwerk nicht gefunden.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-ink-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* header */}
        <div className="flex items-start justify-between mb-6 bg-white rounded-lg border border-ink-200 p-4">
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wider text-ink-500 mb-1">
              Ingenieurbauwerk
            </div>
            <input
              className="text-xl font-semibold w-full border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-ink-300 rounded px-1 -ml-1"
              value={bauwerk.name}
              onChange={(e) =>
                renameBauwerk(bauwerk.id, e.target.value, bauwerk.km)
              }
            />
            <input
              className="text-sm text-ink-500 w-full border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-ink-300 rounded px-1 -ml-1 mt-1"
              value={bauwerk.km ?? ""}
              placeholder="z. B. km 26,189 – 26,367"
              onChange={(e) =>
                renameBauwerk(bauwerk.id, bauwerk.name, e.target.value)
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="num text-right pr-3">
              <div className="text-xs text-ink-500">Summe</div>
              <div className="text-lg font-semibold">
                {fmtEur(bauwerkTotal)}
              </div>
            </div>
            <button
              onClick={() => duplicateBauwerk(bauwerk.id)}
              className="p-2 text-ink-500 hover:text-ink-900 hover:bg-ink-100 rounded"
              title="Duplizieren"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={() => {
                if (confirm(`Bauwerk "${bauwerk.name}" löschen?`)) {
                  const next = project.bauwerke.find(
                    (b) => b.id !== bauwerk.id
                  );
                  removeBauwerk(bauwerk.id);
                  if (next) onSelectBauwerk(next.id);
                }
              }}
              className="p-2 text-ink-500 hover:text-red-700 hover:bg-red-50 rounded"
              title="Löschen"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* sections */}
        <div className="space-y-3">
          {bauwerk.sections.map((sec) => {
            const sum = sectionSum(sec);
            const open = expandedSection === sec.id;
            return (
              <div
                key={sec.id}
                className="bg-white rounded-lg border border-ink-200 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedSection(open ? null : sec.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-ink-50 text-left"
                >
                  {open ? (
                    <ChevronDown size={16} className="text-ink-500" />
                  ) : (
                    <ChevronRight size={16} className="text-ink-500" />
                  )}
                  <span className="num text-xs text-ink-500 w-6">
                    {sec.lfdNr}
                  </span>
                  <span className="flex-1 font-medium text-sm">{sec.name}</span>
                  <span className="text-xs text-ink-400">
                    {sec.items.length} Pos.
                  </span>
                  <span className="num text-sm font-semibold w-36">
                    {fmtEur(sum)}
                  </span>
                </button>

                {open && (
                  <div className="border-t border-ink-200">
                    <div className="px-4 py-2 flex items-center gap-2 bg-ink-50">
                      <input
                        className="flex-1 text-sm bg-white px-2 py-1 border border-ink-200 rounded"
                        value={sec.name}
                        onChange={(e) =>
                          renameSection(bauwerk.id, sec.id, e.target.value)
                        }
                      />
                      <button
                        onClick={() => setKatalogSectionId(sec.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-ink-200 hover:bg-ink-100 rounded"
                      >
                        <Search size={12} /> Katalog
                      </button>
                      <button
                        onClick={() =>
                          addItem(bauwerk.id, sec.id, {
                            text: "Neue Position",
                          })
                        }
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-ink-900 text-white rounded hover:bg-ink-800"
                      >
                        <Plus size={12} /> Position
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Abschnitt löschen?"))
                            removeSection(bauwerk.id, sec.id);
                        }}
                        className="p-1.5 text-ink-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Abschnitt löschen"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-ink-50 text-xs text-ink-500">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium w-24">
                            KGK
                          </th>
                          <th className="text-left px-3 py-2 font-medium">
                            Text
                          </th>
                          <th className="text-right px-3 py-2 font-medium w-20">
                            Faktor
                          </th>
                          <th className="text-left px-3 py-2 font-medium w-40">
                            Anmerkung
                          </th>
                          <th className="text-right px-3 py-2 font-medium w-24">
                            Menge
                          </th>
                          <th className="text-left px-3 py-2 font-medium w-14">
                            Einh.
                          </th>
                          <th className="text-right px-3 py-2 font-medium w-28">
                            EP
                          </th>
                          <th className="text-right px-3 py-2 font-medium w-32">
                            Summe
                          </th>
                          <th className="text-left px-3 py-2 font-medium w-56">
                            Erläuterung
                          </th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {sec.items.map((it) => {
                          const faktor = it.faktor ?? 1;
                          const summe = faktor * it.menge * it.einheitspreis;
                          return (
                            <tr
                              key={it.id}
                              className="border-t border-ink-100 hover:bg-ink-50/50"
                            >
                              <td className="px-2 py-0.5 num text-xs text-ink-500">
                                <TextInput
                                  value={it.kgk ?? ""}
                                  onChange={(v) =>
                                    updateItem(bauwerk.id, sec.id, it.id, {
                                      kgk: v || null,
                                    })
                                  }
                                  className="num text-xs"
                                />
                              </td>
                              <td className="px-2 py-0.5">
                                <TextInput
                                  value={it.text}
                                  onChange={(v) =>
                                    updateItem(bauwerk.id, sec.id, it.id, {
                                      text: v,
                                    })
                                  }
                                />
                              </td>
                              <td className="px-2 py-0.5">
                                <NumInput
                                  value={faktor}
                                  onChange={(v) =>
                                    updateItem(bauwerk.id, sec.id, it.id, {
                                      faktor: v,
                                    })
                                  }
                                  decimals={2}
                                />
                              </td>
                              <td className="px-2 py-0.5">
                                <TextInput
                                  value={it.anmerkung ?? ""}
                                  onChange={(v) =>
                                    updateItem(bauwerk.id, sec.id, it.id, {
                                      anmerkung: v || null,
                                    })
                                  }
                                />
                              </td>
                              <td className="px-2 py-0.5">
                                <NumInput
                                  value={it.menge}
                                  onChange={(v) =>
                                    updateItem(bauwerk.id, sec.id, it.id, {
                                      menge: v,
                                    })
                                  }
                                  decimals={2}
                                />
                              </td>
                              <td className="px-2 py-0.5 text-sm">
                                <TextInput
                                  value={it.einheit}
                                  onChange={(v) =>
                                    updateItem(bauwerk.id, sec.id, it.id, {
                                      einheit: v,
                                    })
                                  }
                                />
                              </td>
                              <td className="px-2 py-0.5">
                                <NumInput
                                  value={it.einheitspreis}
                                  onChange={(v) =>
                                    updateItem(bauwerk.id, sec.id, it.id, {
                                      einheitspreis: v,
                                    })
                                  }
                                  decimals={2}
                                />
                              </td>
                              <NumCell className="font-medium">
                                {fmtEur(summe)}
                              </NumCell>
                              <td className="px-2 py-0.5">
                                <TextInput
                                  value={it.erlaeuterung ?? ""}
                                  onChange={(v) =>
                                    updateItem(bauwerk.id, sec.id, it.id, {
                                      erlaeuterung: v || null,
                                    })
                                  }
                                />
                              </td>
                              <td className="px-1">
                                <button
                                  onClick={() =>
                                    removeItem(bauwerk.id, sec.id, it.id)
                                  }
                                  className="p-1 text-ink-400 hover:text-red-700"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {sec.items.length === 0 && (
                          <tr>
                            <td
                              colSpan={10}
                              className="px-4 py-6 text-center text-xs text-ink-400"
                            >
                              Keine Positionen. Fügen Sie eine Position hinzu
                              oder wählen Sie aus dem Katalog.
                            </td>
                          </tr>
                        )}
                        {sec.items.length > 0 && (
                          <tr className="border-t-2 border-ink-200 bg-ink-50">
                            <td
                              colSpan={7}
                              className="px-3 py-2 text-xs font-medium text-ink-600 text-right"
                            >
                              Abschnittssumme
                            </td>
                            <NumCell className="font-semibold">
                              {fmtEur(sum)}
                            </NumCell>
                            <td colSpan={2} />
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <button
            onClick={() => addSection(bauwerk.id, "Neuer Abschnitt")}
            className="flex items-center gap-2 px-3 py-2 text-sm text-ink-600 border border-dashed border-ink-300 rounded hover:bg-white hover:border-ink-400"
          >
            <Plus size={14} /> Abschnitt
          </button>
        </div>
      </div>

      {katalogSectionId && (
        <KatalogPicker
          onClose={() => setKatalogSectionId(null)}
          onPick={(entry) => {
            addItem(bauwerk.id, katalogSectionId, {
              kgk: entry.kgkCode,
              text: entry.bezeichnung ?? "",
              einheit: entry.einheit ?? "",
              einheitspreis: entry.preis ?? 0,
              erlaeuterung: entry.erlaeuterung,
            });
          }}
        />
      )}
    </div>
  );
}
