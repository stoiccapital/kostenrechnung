import { useState } from "react";
import { BauwerkePage } from "./pages/BauwerkePage";
import { KostenermittlungPage } from "./pages/KostenermittlungPage";
import { HoaiPage } from "./pages/HoaiPage";
import { KatalogPage } from "./pages/KatalogPage";
import { bauwerkSum, projectSum, useStore } from "./lib/store";
import {
  Building2,
  Calculator,
  FileText,
  RotateCcw,
  Printer,
  ChevronRight,
  ChevronDown,
  Plus,
  Database,
} from "lucide-react";
import { fmtEur } from "./lib/format";

type View =
  | { kind: "bauwerk"; id: string }
  | { kind: "kostenermittlung" }
  | { kind: "hoai" }
  | { kind: "katalog" };

export default function App() {
  const project = useStore((s) => s.project);
  const reset = useStore((s) => s.reset);
  const addBauwerk = useStore((s) => s.addBauwerk);

  const [view, setView] = useState<View>(() =>
    project.bauwerke[0]
      ? { kind: "bauwerk", id: project.bauwerke[0].id }
      : { kind: "kostenermittlung" }
  );
  const [bauwerkeOpen, setBauwerkeOpen] = useState(true);

  const total = projectSum(project);

  return (
    <div className="h-screen flex">
      {/* sidebar */}
      <aside className="w-64 border-r border-ink-200 bg-white flex flex-col no-print">
        <div className="px-4 py-4 border-b border-ink-200">
          <div className="text-xs uppercase tracking-wider text-ink-500">
            DB · Ril 808
          </div>
          <div className="text-sm font-semibold -mt-0.5">Kostenermittlung</div>
          <div className="num text-xs text-ink-500 mt-2">
            {fmtEur(total)}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {/* Bauwerke — group with expandable children */}
          <div>
            <button
              onClick={() => setBauwerkeOpen((v) => !v)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              {bauwerkeOpen ? (
                <ChevronDown size={14} className="text-ink-400" />
              ) : (
                <ChevronRight size={14} className="text-ink-400" />
              )}
              <Building2 size={14} className="text-ink-500" />
              <span className="flex-1 text-left">Bauwerke</span>
              <span className="text-xs text-ink-400">
                {project.bauwerke.length}
              </span>
            </button>

            {bauwerkeOpen && (
              <div className="pb-1">
                {project.bauwerke.map((b) => {
                  const active =
                    view.kind === "bauwerk" && view.id === b.id;
                  const sum = bauwerkSum(b);
                  return (
                    <button
                      key={b.id}
                      onClick={() => setView({ kind: "bauwerk", id: b.id })}
                      className={`w-full text-left pl-9 pr-3 py-1.5 border-l-2 ${
                        active
                          ? "border-ink-900 bg-ink-50"
                          : "border-transparent hover:bg-ink-50"
                      }`}
                    >
                      <div className="text-sm leading-tight">{b.name}</div>
                      {b.km && (
                        <div className="text-[11px] text-ink-500 mt-0.5">
                          {b.km}
                        </div>
                      )}
                      <div className="num text-[11px] text-ink-500 mt-0.5">
                        {fmtEur(sum)}
                      </div>
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    const id = addBauwerk("Neues Bauwerk");
                    setView({ kind: "bauwerk", id });
                  }}
                  className="w-full text-left pl-9 pr-3 py-1.5 text-xs text-ink-500 hover:text-ink-900 hover:bg-ink-50 flex items-center gap-1"
                >
                  <Plus size={12} /> Bauwerk
                </button>
              </div>
            )}
          </div>

          <NavButton
            active={view.kind === "kostenermittlung"}
            onClick={() => setView({ kind: "kostenermittlung" })}
            icon={<FileText size={14} />}
          >
            Kostenermittlung
          </NavButton>

          <NavButton
            active={view.kind === "hoai"}
            onClick={() => setView({ kind: "hoai" })}
            icon={<Calculator size={14} />}
          >
            HOAI-Honorar
          </NavButton>

          <div className="mt-4 mb-1 px-3 text-[10px] uppercase tracking-wider text-ink-400">
            Referenz
          </div>
          <NavButton
            active={view.kind === "katalog"}
            onClick={() => setView({ kind: "katalog" })}
            icon={<Database size={14} />}
          >
            Datenbank · Baupreise
          </NavButton>
        </nav>

        <div className="border-t border-ink-200 p-2 flex items-center gap-1">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-ink-500 hover:text-ink-900 hover:bg-ink-100 rounded"
          >
            <Printer size={12} /> Drucken
          </button>
          <button
            onClick={() => {
              if (
                confirm(
                  "Projekt auf Seed-Daten zurücksetzen? Lokale Änderungen gehen verloren."
                )
              )
                reset();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-ink-500 hover:text-ink-900 hover:bg-ink-100 rounded"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </aside>

      {/* main */}
      <main className="flex-1 overflow-hidden">
        {view.kind === "bauwerk" && (
          <BauwerkePage
            bauwerkId={view.id}
            onSelectBauwerk={(id) => setView({ kind: "bauwerk", id })}
          />
        )}
        {view.kind === "kostenermittlung" && (
          <div className="h-full overflow-y-auto">
            <KostenermittlungPage />
          </div>
        )}
        {view.kind === "hoai" && (
          <div className="h-full overflow-y-auto">
            <HoaiPage />
          </div>
        )}
        {view.kind === "katalog" && <KatalogPage />}
      </main>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-l-2 ${
        active
          ? "border-ink-900 bg-ink-50 font-medium text-ink-900"
          : "border-transparent text-ink-700 hover:bg-ink-50"
      }`}
    >
      <span className="w-[14px]" />
      <span className="text-ink-500">{icon}</span>
      {children}
    </button>
  );
}
