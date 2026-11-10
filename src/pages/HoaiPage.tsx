import { useMemo, useState } from "react";
import { projectSum, useStore } from "../lib/store";
import {
  LEISTUNGSBILDER,
  computeHonorar,
  type Honorarsatz,
  type Zone,
} from "../lib/hoai";
import { fmtEur } from "../lib/format";
import { NumInput } from "../components/NumInput";
import { KG_LABELS, SECTION_TO_KG } from "../lib/types";
import { sectionSum } from "../lib/store";

type Row = {
  id: string;
  label: string;
  lbKey: string;
  kosten: number;
  zone: Zone;
  satz: Honorarsatz;
};

const genId = () => Math.random().toString(36).slice(2);

export function HoaiPage() {
  const project = useStore((s) => s.project);
  const ust = useStore((s) => s.umsatzsteuer);

  const anrech = useMemo(() => {
    let kg300 = 0, kg400 = 0;
    for (const b of project.bauwerke) {
      for (const sec of b.sections) {
        const kg = SECTION_TO_KG[sec.lfdNr] ?? 300;
        const sum = sectionSum(sec);
        if (kg === 300) kg300 += sum;
        if (kg === 400) kg400 += sum;
      }
    }
    const anrechOP =
      kg400 < 0.25 * kg300 ? kg300 + 0.25 * kg400 : kg300 + kg400;
    const anrechTWP = kg300;
    return { anrechOP, anrechTWP, total: projectSum(project) };
  }, [project]);

  const [rows, setRows] = useState<Row[]>([
    {
      id: genId(),
      label: "Objektplanung · Ingenieurbauwerke",
      lbKey: "ingenieur",
      kosten: 0,
      zone: 3,
      satz: "basis",
    },
    {
      id: genId(),
      label: "Tragwerksplanung",
      lbKey: "tragwerk",
      kosten: 0,
      zone: 2,
      satz: "basis",
    },
  ]);

  function update(id: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((rs) => [
      ...rs,
      {
        id: genId(),
        label: "Freie Berechnung",
        lbKey: "gebaeude",
        kosten: 0,
        zone: 3,
        satz: "basis",
      },
    ]);
  }

  function remove(id: string) {
    setRows((rs) => rs.filter((r) => r.id !== id));
  }

  const totals = useMemo(() => {
    let netto = 0, mwst = 0, brutto = 0;
    for (const r of rows) {
      const lb = LEISTUNGSBILDER.find((l) => l.key === r.lbKey);
      if (!lb) continue;
      const res = computeHonorar(lb, r.kosten, r.zone, r.satz);
      if (res.netto != null) {
        netto += res.netto;
        mwst += res.netto * ust;
        brutto += res.netto * (1 + ust);
      }
    }
    return { netto, mwst, brutto };
  }, [rows, ust]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <div className="text-xs uppercase tracking-wider text-ink-500 mb-1">
          HOAI-Honorarermittlung · 2013 / 2021
        </div>
        <h1 className="text-2xl font-semibold">Honorarberechnung</h1>
        <p className="text-sm text-ink-500 mt-1 max-w-2xl">
          Lineare Interpolation nach §13 HOAI zwischen den Tafelwerten der
          Honorartafeln.
        </p>
      </header>

      <section className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() =>
            update(rows[0]?.id, { kosten: Math.round(anrech.anrechOP) })
          }
          className="text-left bg-white border border-ink-200 rounded-lg p-4 hover:border-ink-400"
        >
          <div className="text-xs text-ink-500 mb-1">
            Anrechenbar OP · §42 HOAI
          </div>
          <div className="num text-lg font-semibold">
            {fmtEur(anrech.anrechOP)}
          </div>
          <div className="text-xs text-ink-400 mt-2">
            Klick → in Zeile 1 übernehmen
          </div>
        </button>
        <button
          onClick={() =>
            update(rows[1]?.id, { kosten: Math.round(anrech.anrechTWP) })
          }
          className="text-left bg-white border border-ink-200 rounded-lg p-4 hover:border-ink-400"
        >
          <div className="text-xs text-ink-500 mb-1">
            Anrechenbar TWP · §50 HOAI
          </div>
          <div className="num text-lg font-semibold">
            {fmtEur(anrech.anrechTWP)}
          </div>
          <div className="text-xs text-ink-400 mt-2">
            Klick → in Zeile 2 übernehmen
          </div>
        </button>
        <div className="bg-white border border-ink-200 rounded-lg p-4">
          <div className="text-xs text-ink-500 mb-1">
            Gesamtkosten Projekt
          </div>
          <div className="num text-lg font-semibold">
            {fmtEur(anrech.total)}
          </div>
        </div>
      </section>

      <div className="bg-white rounded-lg border border-ink-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-xs text-ink-500">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Bezeichnung</th>
              <th className="text-left px-3 py-2 font-medium w-56">
                Leistungsbild
              </th>
              <th className="text-right px-3 py-2 font-medium w-40">
                Anr. Kosten
              </th>
              <th className="text-left px-3 py-2 font-medium w-20">Zone</th>
              <th className="text-left px-3 py-2 font-medium w-32">Satz</th>
              <th className="text-right px-3 py-2 font-medium w-36">
                Honorar netto
              </th>
              <th className="text-right px-3 py-2 font-medium w-36">
                Brutto (×{(1 + ust).toFixed(2)})
              </th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const lb = LEISTUNGSBILDER.find((l) => l.key === r.lbKey);
              const res = lb
                ? computeHonorar(lb, r.kosten, r.zone, r.satz)
                : null;
              return (
                <tr key={r.id} className="border-t border-ink-100">
                  <td className="px-2 py-1">
                    <input
                      className="w-full bg-transparent px-2 py-1 border-0 focus:bg-white focus:ring-1 focus:ring-ink-300 rounded text-sm"
                      value={r.label}
                      onChange={(e) =>
                        update(r.id, { label: e.target.value })
                      }
                    />
                  </td>
                  <td className="px-2 py-1">
                    <select
                      className="w-full text-sm bg-white border border-ink-200 rounded px-2 py-1"
                      value={r.lbKey}
                      onChange={(e) =>
                        update(r.id, { lbKey: e.target.value })
                      }
                    >
                      {LEISTUNGSBILDER.map((l) => (
                        <option key={l.key} value={l.key}>
                          {l.paragraph} {l.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1">
                    <NumInput
                      value={r.kosten}
                      onChange={(v) => update(r.id, { kosten: v })}
                      decimals={0}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <select
                      className="w-full text-sm bg-white border border-ink-200 rounded px-2 py-1"
                      value={r.zone}
                      onChange={(e) =>
                        update(r.id, { zone: Number(e.target.value) as Zone })
                      }
                    >
                      {lb?.zones.map((z) => (
                        <option key={z} value={z}>
                          {["I", "II", "III", "IV", "V"][z - 1]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1">
                    <select
                      className="w-full text-sm bg-white border border-ink-200 rounded px-2 py-1"
                      value={r.satz}
                      onChange={(e) =>
                        update(r.id, { satz: e.target.value as Honorarsatz })
                      }
                    >
                      <option value="basis">Basis</option>
                      <option value="mittel">Mittel</option>
                      <option value="oberer">Oberer</option>
                    </select>
                  </td>
                  <td className="num px-3 py-1 font-medium">
                    {res?.outOfRange || res?.netto == null
                      ? "frei vereinb."
                      : fmtEur(res.netto)}
                  </td>
                  <td className="num px-3 py-1 text-ink-600">
                    {res?.outOfRange || res?.netto == null
                      ? "—"
                      : fmtEur(res.netto * (1 + ust))}
                  </td>
                  <td className="px-1">
                    <button
                      onClick={() => remove(r.id)}
                      className="p-1 text-ink-400 hover:text-red-700"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-ink-300 bg-ink-50 font-semibold">
              <td colSpan={5} className="px-3 py-2 text-right">
                Summe
              </td>
              <td className="num px-3 py-2">{fmtEur(totals.netto)}</td>
              <td className="num px-3 py-2">{fmtEur(totals.brutto)}</td>
              <td />
            </tr>
          </tbody>
        </table>
        <div className="px-3 py-2 border-t border-ink-200 flex justify-between items-center">
          <button
            onClick={addRow}
            className="text-xs text-ink-600 hover:text-ink-900"
          >
            + Berechnung
          </button>
          <div className="text-xs text-ink-500">
            MwSt {(ust * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="mt-6 text-xs text-ink-500 bg-white border border-ink-200 rounded p-4 leading-relaxed">
        <strong>Hinweise:</strong> Außerhalb der Tafelwerte (§7 Abs. 2 HOAI)
        ist das Honorar frei vereinbar. Die hier angezeigten Honorare sind
        Grundhonorare 100 % (alle Leistungsphasen) und entsprechen den
        Honorartafeln HOAI 2021 (identisch mit HOAI 2013). Basis = unterer
        Tafelwert, Oberer = oberer Tafelwert, Mittel = Mittelwert.
      </div>
    </div>
  );
}
