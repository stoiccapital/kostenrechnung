import { useMemo } from "react";
import { bauwerkSum, projectSum, sectionSum, useStore } from "../lib/store";
import { fmtEur } from "../lib/format";
import { KG_LABELS, SECTION_TO_KG } from "../lib/types";

export function KostenermittlungPage() {
  const project = useStore((s) => s.project);

  const rollup = useMemo(() => {
    const perKG: Record<number, number> = {
      100: 0, 200: 0, 300: 0, 400: 0, 500: 0, 600: 0, 700: 0, 800: 0,
    };
    const perBauwerkPerKG: { bauwerk: string; perKG: Record<number, number>; total: number }[] = [];

    for (const b of project.bauwerke) {
      const row: Record<number, number> = {
        100: 0, 200: 0, 300: 0, 400: 0, 500: 0, 600: 0, 700: 0, 800: 0,
      };
      for (const sec of b.sections) {
        const kg = SECTION_TO_KG[sec.lfdNr] ?? 300;
        const sum = sectionSum(sec);
        row[kg] += sum;
        perKG[kg] += sum;
      }
      perBauwerkPerKG.push({
        bauwerk: b.name,
        perKG: row,
        total: bauwerkSum(b),
      });
    }

    const kg300 = perKG[300] ?? 0;
    const kg400 = perKG[400] ?? 0;
    const total = projectSum(project);

    // §42 HOAI: Objektplanung — 300 voll, 400 anteilig (25 % wenn klein, sonst voll)
    const anrechOP =
      kg400 < 0.25 * kg300 ? kg300 + 0.25 * kg400 : kg300 + kg400;
    // §50 HOAI (Tragwerk): nur 300
    const anrechTWP = kg300;

    return { perKG, perBauwerkPerKG, total, anrechOP, anrechTWP };
  }, [project]);

  const kgKeys = [100, 200, 300, 400, 500, 600, 700, 800] as const;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <div className="text-xs uppercase tracking-wider text-ink-500 mb-1">
          Kostenermittlung
        </div>
        <h1 className="text-2xl font-semibold">{project.name}</h1>
      </header>

      <div className="bg-white rounded-lg border border-ink-200 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-xs text-ink-500">
            <tr>
              <th className="text-left px-3 py-2 font-medium w-14">KG</th>
              <th className="text-left px-3 py-2 font-medium">
                Kostengruppe nach DIN 276
              </th>
              {rollup.perBauwerkPerKG.map((b) => (
                <th
                  key={b.bauwerk}
                  className="text-right px-3 py-2 font-medium"
                >
                  {b.bauwerk}
                </th>
              ))}
              <th className="text-right px-3 py-2 font-medium">Summe</th>
            </tr>
          </thead>
          <tbody>
            {kgKeys.map((kg) => {
              const total = rollup.perKG[kg] ?? 0;
              return (
                <tr key={kg} className="border-t border-ink-100">
                  <td className="num text-ink-500 px-3 py-1.5">{kg}</td>
                  <td className="px-3 py-1.5">{KG_LABELS[kg]}</td>
                  {rollup.perBauwerkPerKG.map((b) => (
                    <td
                      key={b.bauwerk}
                      className="num px-3 py-1.5 text-ink-600"
                    >
                      {b.perKG[kg] ? fmtEur(b.perKG[kg]) : "—"}
                    </td>
                  ))}
                  <td className="num px-3 py-1.5 font-medium">
                    {total ? fmtEur(total) : "—"}
                  </td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-ink-300 bg-ink-50 font-semibold">
              <td colSpan={2} className="px-3 py-2">
                Gesamtkosten
              </td>
              {rollup.perBauwerkPerKG.map((b) => (
                <td key={b.bauwerk} className="num px-3 py-2">
                  {fmtEur(b.total)}
                </td>
              ))}
              <td className="num px-3 py-2">{fmtEur(rollup.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <section className="bg-white rounded-lg border border-ink-200 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500 mb-4">
          Anrechenbare Kosten (HOAI)
        </h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div className="border border-ink-200 rounded p-4">
            <dt className="text-xs text-ink-500 mb-1">
              Objektplanung · §42 HOAI
            </dt>
            <dd className="num text-xl font-semibold">
              {fmtEur(rollup.anrechOP)}
            </dd>
            <div className="text-xs text-ink-500 mt-2">
              KG 200 + KG 300 + anteilig KG 400
            </div>
          </div>
          <div className="border border-ink-200 rounded p-4">
            <dt className="text-xs text-ink-500 mb-1">
              Tragwerksplanung · §50 HOAI
            </dt>
            <dd className="num text-xl font-semibold">
              {fmtEur(rollup.anrechTWP)}
            </dd>
            <div className="text-xs text-ink-500 mt-2">KG 200 + KG 300</div>
          </div>
        </dl>
      </section>
    </div>
  );
}
