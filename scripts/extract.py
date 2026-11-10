"""Extract Ril808 workbook into JSON seeds the React app can consume."""
import json
import openpyxl
from pathlib import Path

SRC = "/Users/anhchu/Downloads/Kostenenschätzung nach Ril 808_Vorlage.xlsx"
OUT = Path("/Users/anhchu/Ril808.Kostenermittlung.v1/src/data")
OUT.mkdir(parents=True, exist_ok=True)

wb = openpyxl.load_workbook(SRC, data_only=True)

# --- Trogbauwerke (Nord, Süd 1, Süd 2) ---
TROG_SHEETS = [
    ("Trogbauwerk Nord ", "nord", "Trogbauwerk Nord", "km 26,189 – 26,367"),
    ("Trogbauwerk Süd 1 ", "sued1", "Trogbauwerk Süd 1", "km 26,608 – 26,876"),
    ("Trogbauwerk Süd 2", "sued2", "Trogbauwerk Süd 2", "km 26,892 – 26,966"),
]

def num(v):
    if v is None: return None
    if isinstance(v, (int, float)): return float(v)
    return None

def trim(v):
    if v is None: return None
    s = str(v).strip()
    return s if s else None

bauwerke = []
for sheet, slug, label, km in TROG_SHEETS:
    ws = wb[sheet]
    sections = []
    current = None
    # Header row 4; data starts row 5
    for i in range(5, ws.max_row + 1):
        lfd = ws.cell(i, 6).value       # F
        kgk = ws.cell(i, 7).value       # G
        text = ws.cell(i, 8).value      # H
        teilmenge = num(ws.cell(i, 17).value)  # Q
        menge = num(ws.cell(i, 18).value)      # R
        einheit = trim(ws.cell(i, 19).value)   # S
        ep = num(ws.cell(i, 20).value)         # T
        summe = num(ws.cell(i, 21).value)      # U
        absum = num(ws.cell(i, 24).value)      # X
        anm = trim(ws.cell(i, 25).value)       # Y (Erläuterungen)

        # New section: lfd.Nr numeric + text
        if isinstance(lfd, (int, float)) and text:
            current = {
                "lfdNr": int(lfd),
                "name": str(text).strip(),
                "items": [],
                "abschnittssumme": absum or 0,
            }
            sections.append(current)
            continue

        # Line item: has a kgk code or menge/ep
        if current is None:
            continue
        if (kgk is not None or menge is not None or ep is not None) and text:
            current["items"].append({
                "kgk": str(kgk) if kgk is not None else None,
                "text": str(text).strip(),
                "menge": menge or 0,
                "einheit": einheit or "",
                "einheitspreis": ep or 0,
                "summe": summe or 0,
                "anmerkung": anm,
            })

    bauwerke.append({
        "id": slug,
        "name": label,
        "km": km,
        "sections": sections,
    })

project = {
    "id": "wolfratshausen-geretsried",
    "name": "Str. 5550, Verlängerung Wolfratshausen – Geretsried Süd",
    "bauwerke": bauwerke,
}

(OUT / "seedProject.json").write_text(json.dumps(project, ensure_ascii=False, indent=2))
print(f"Wrote seedProject.json — {len(bauwerke)} Bauwerke")
for b in bauwerke:
    total = sum(s["abschnittssumme"] for s in b["sections"])
    print(f"  {b['name']}: {len(b['sections'])} Abschnitte, Total {total:,.0f} €")

# --- Kostenkatalog ---
# Layout: A/B/C = position triple (10/10/10), D = Bezeichnung, E = EH,
# F = EP IOS 2016-LAH, G = IOS 2016, J = LAH 2012, K = SSF 2009, L = Erläuterung.
catalog = {}
for cat_sheet in ["Kostenkatalog_Werte (2)", "Kostenkatalog_Werte (3)"]:
    ws = wb[cat_sheet]
    for i in range(2, ws.max_row + 1):
        a = ws.cell(i, 1).value
        b = ws.cell(i, 2).value
        c = ws.cell(i, 3).value
        text = trim(ws.cell(i, 4).value)
        einheit = trim(ws.cell(i, 5).value)
        ep = (num(ws.cell(i, 6).value) or num(ws.cell(i, 7).value)
              or num(ws.cell(i, 10).value) or num(ws.cell(i, 11).value))
        erl = trim(ws.cell(i, 12).value)
        if not text:
            continue
        parts = [str(int(x)) if isinstance(x, (int, float)) else str(x)
                 for x in (a, b, c) if x not in (None, "")]
        pos = ".".join(parts) if parts else None
        is_heading = einheit is None and ep is None
        key = (pos, text)
        if key in catalog:
            continue
        catalog[key] = {
            "pos": pos,
            "text": text,
            "einheit": einheit,
            "einheitspreis": round(ep, 2) if ep is not None else None,
            "isHeading": is_heading,
            "erlaeuterung": erl if erl and erl != "#REF!" else None,
        }

catalog_list = list(catalog.values())
(OUT / "katalog.json").write_text(json.dumps(catalog_list, ensure_ascii=False, indent=2))
print(f"Wrote katalog.json — {len(catalog_list)} entries")
