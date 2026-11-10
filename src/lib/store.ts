import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Bauwerk, LineItem, Project, Section } from "./types";
import seed from "../data/seedProject.json";

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function withIds(p: Omit<Project, "id"> & { id?: string }): Project {
  return {
    id: p.id ?? genId(),
    name: p.name,
    bauwerke: p.bauwerke.map((b: any) => ({
      id: b.id ?? genId(),
      name: b.name,
      km: b.km,
      sections: (b.sections ?? []).map((s: any) => ({
        id: s.id ?? genId(),
        lfdNr: s.lfdNr,
        name: s.name,
        items: (s.items ?? []).map((it: any) => ({
          id: it.id ?? genId(),
          kgk: it.kgk ?? null,
          text: it.text,
          menge: it.menge ?? 0,
          einheit: it.einheit ?? "",
          einheitspreis: it.einheitspreis ?? 0,
          anmerkung: it.anmerkung ?? null,
        })),
      })),
    })),
  };
}

type State = {
  project: Project;
  umsatzsteuer: number;
  reset: () => void;
  setProjectName: (name: string) => void;
  addBauwerk: (name: string) => string;
  renameBauwerk: (id: string, name: string, km?: string) => void;
  removeBauwerk: (id: string) => void;
  duplicateBauwerk: (id: string) => void;
  addSection: (bauwerkId: string, name: string, lfdNr?: number) => string;
  renameSection: (bauwerkId: string, id: string, name: string) => void;
  removeSection: (bauwerkId: string, id: string) => void;
  addItem: (bauwerkId: string, sectionId: string, item?: Partial<LineItem>) => string;
  updateItem: (
    bauwerkId: string,
    sectionId: string,
    id: string,
    patch: Partial<LineItem>
  ) => void;
  removeItem: (bauwerkId: string, sectionId: string, id: string) => void;
};

const SEED = withIds(seed as any);

export const useStore = create<State>()(
  persist(
    (set) => ({
      project: SEED,
      umsatzsteuer: 0.19,

      reset: () => set({ project: withIds(seed as any) }),

      setProjectName: (name) =>
        set((s) => ({ project: { ...s.project, name } })),

      addBauwerk: (name) => {
        const id = genId();
        set((s) => ({
          project: {
            ...s.project,
            bauwerke: [...s.project.bauwerke, { id, name, sections: [] }],
          },
        }));
        return id;
      },

      renameBauwerk: (id, name, km) =>
        set((s) => ({
          project: {
            ...s.project,
            bauwerke: s.project.bauwerke.map((b) =>
              b.id === id ? { ...b, name, km: km ?? b.km } : b
            ),
          },
        })),

      removeBauwerk: (id) =>
        set((s) => ({
          project: {
            ...s.project,
            bauwerke: s.project.bauwerke.filter((b) => b.id !== id),
          },
        })),

      duplicateBauwerk: (id) =>
        set((s) => {
          const src = s.project.bauwerke.find((b) => b.id === id);
          if (!src) return s;
          const clone: Bauwerk = {
            ...src,
            id: genId(),
            name: `${src.name} (Kopie)`,
            sections: src.sections.map((sec) => ({
              ...sec,
              id: genId(),
              items: sec.items.map((it) => ({ ...it, id: genId() })),
            })),
          };
          return {
            project: {
              ...s.project,
              bauwerke: [...s.project.bauwerke, clone],
            },
          };
        }),

      addSection: (bauwerkId, name, lfdNr) => {
        const id = genId();
        set((s) => ({
          project: {
            ...s.project,
            bauwerke: s.project.bauwerke.map((b) => {
              if (b.id !== bauwerkId) return b;
              const nextNr =
                lfdNr ??
                (b.sections.length
                  ? Math.max(...b.sections.map((x) => x.lfdNr)) + 1
                  : 1);
              const newSection: Section = { id, lfdNr: nextNr, name, items: [] };
              return { ...b, sections: [...b.sections, newSection] };
            }),
          },
        }));
        return id;
      },

      renameSection: (bauwerkId, id, name) =>
        set((s) => ({
          project: {
            ...s.project,
            bauwerke: s.project.bauwerke.map((b) =>
              b.id !== bauwerkId
                ? b
                : {
                    ...b,
                    sections: b.sections.map((sec) =>
                      sec.id === id ? { ...sec, name } : sec
                    ),
                  }
            ),
          },
        })),

      removeSection: (bauwerkId, id) =>
        set((s) => ({
          project: {
            ...s.project,
            bauwerke: s.project.bauwerke.map((b) =>
              b.id !== bauwerkId
                ? b
                : { ...b, sections: b.sections.filter((sec) => sec.id !== id) }
            ),
          },
        })),

      addItem: (bauwerkId, sectionId, item) => {
        const id = genId();
        const newItem: LineItem = {
          id,
          kgk: item?.kgk ?? null,
          text: item?.text ?? "Neue Position",
          menge: item?.menge ?? 0,
          einheit: item?.einheit ?? "",
          einheitspreis: item?.einheitspreis ?? 0,
          anmerkung: item?.anmerkung ?? null,
        };
        set((s) => ({
          project: {
            ...s.project,
            bauwerke: s.project.bauwerke.map((b) =>
              b.id !== bauwerkId
                ? b
                : {
                    ...b,
                    sections: b.sections.map((sec) =>
                      sec.id !== sectionId
                        ? sec
                        : { ...sec, items: [...sec.items, newItem] }
                    ),
                  }
            ),
          },
        }));
        return id;
      },

      updateItem: (bauwerkId, sectionId, id, patch) =>
        set((s) => ({
          project: {
            ...s.project,
            bauwerke: s.project.bauwerke.map((b) =>
              b.id !== bauwerkId
                ? b
                : {
                    ...b,
                    sections: b.sections.map((sec) =>
                      sec.id !== sectionId
                        ? sec
                        : {
                            ...sec,
                            items: sec.items.map((it) =>
                              it.id === id ? { ...it, ...patch } : it
                            ),
                          }
                    ),
                  }
            ),
          },
        })),

      removeItem: (bauwerkId, sectionId, id) =>
        set((s) => ({
          project: {
            ...s.project,
            bauwerke: s.project.bauwerke.map((b) =>
              b.id !== bauwerkId
                ? b
                : {
                    ...b,
                    sections: b.sections.map((sec) =>
                      sec.id !== sectionId
                        ? sec
                        : {
                            ...sec,
                            items: sec.items.filter((it) => it.id !== id),
                          }
                    ),
                  }
            ),
          },
        })),
    }),
    { name: "ril808-kostenermittlung-v1" }
  )
);

// Derived selectors (callers wrap in useMemo)
export function sectionSum(section: Section): number {
  return section.items.reduce((a, it) => a + it.menge * it.einheitspreis, 0);
}
export function bauwerkSum(b: Bauwerk): number {
  return b.sections.reduce((a, sec) => a + sectionSum(sec), 0);
}
export function projectSum(p: Project): number {
  return p.bauwerke.reduce((a, b) => a + bauwerkSum(b), 0);
}
