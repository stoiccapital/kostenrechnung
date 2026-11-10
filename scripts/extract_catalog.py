"""Convert the DB Baupreise Ril 808 CSV (Q3 2026) into a compact JSON catalog.

Read-only reference; rows retain provenance (Quelle, Fundstelle, Prüfhinweis).
"""
from __future__ import annotations
import csv
import json
from pathlib import Path

SRC = "/Users/anhchu/Desktop/Datenbank_Baupreise_Ril808_KGK_Q3_2026.csv"
OUT = Path("/Users/anhchu/Ril808.Kostenermittlung.v1/src/data/katalog.json")
META_OUT = Path("/Users/anhchu/Ril808.Kostenermittlung.v1/src/data/katalogMeta.json")


def parse_num(s: str) -> float | None:
    if s is None:
        return None
    s = s.strip()
    if not s or s == "k.A.":
        return None
    s = s.replace(".", "").replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def trim(s):
    if s is None:
        return None
    s = s.strip()
    return s if s else None


rows = []
with open(SRC, encoding="utf-8-sig", newline="") as f:
    reader = csv.DictReader(f, delimiter=";")
    for r in reader:
        rows.append(
            {
                "id": r.get("Datensatz_ID"),
                "kgkCode": trim(r.get("KGK_Code")),
                "kgkPath": trim(r.get("KGK_Pfad")),
                "kgkBezeichnung": trim(r.get("KGK_Bezeichnung")),
                "bezeichnung": trim(r.get("Bezeichnung")),
                "erlaeuterung": trim(r.get("Erlaeuterung")),
                "ansatzGrundlage": trim(r.get("Ansatz_Grundlage")),
                "einheit": trim(r.get("Einheit")),
                "preisart": trim(r.get("Preisart")),
                "preis": parse_num(r.get("Preis_Q3_2026_EUR")),
                "quelle": trim(r.get("Gewaehlte_Quelle")),
                "fundstelle": trim(r.get("Gewaehlte_Fundstelle")),
                "pruefhinweis": trim(r.get("Pruefhinweis")),
            }
        )

# KGK path tree for filtering (top-level groups).
roots = {}
for row in rows:
    path = row.get("kgkPath") or ""
    top = path.split(" > ")[0] if path else "Ohne KGK"
    roots.setdefault(top, 0)
    roots[top] += 1

meta = {
    "quartal": "Q3 2026",
    "quelle": "DB Datenbank Baupreise Ril 808 — KGK 2022",
    "count": len(rows),
    "roots": [{"name": k, "count": v} for k, v in sorted(roots.items(), key=lambda x: -x[1])],
}

OUT.write_text(json.dumps(rows, ensure_ascii=False))
META_OUT.write_text(json.dumps(meta, ensure_ascii=False, indent=2))
print(f"Wrote {len(rows)} entries to {OUT}")
print(f"Top-level KGK groups ({len(roots)}):")
for name, n in sorted(roots.items(), key=lambda x: -x[1])[:15]:
    print(f"  {n:5}  {name}")
