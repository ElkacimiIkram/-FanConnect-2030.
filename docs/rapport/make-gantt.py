"""Create an April–July Gantt chart PNG for FanConnect 2030 PFE report."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).parent / "tech-icons" / "gantt-fanconnect-4mois.png"
OUT.parent.mkdir(parents=True, exist_ok=True)

# April → July = 4 months ≈ 16 weeks
MONTHS = ["Avril", "Mai", "Juin", "Juillet"]
TOTAL_WEEKS = 16

# Tasks: (name, start_week 0-based, duration_weeks, color)
TASKS = [
    ("1. Cadrage & besoins", 0, 2, "#1F4E79"),              # Avril
    ("2. Conception UML / BDD", 1, 3, "#2E75B6"),           # Avril–Mai
    ("3. Backend Spring Boot", 3, 5, "#548235"),            # Mai
    ("4. Frontend React", 5, 5, "#C45911"),                 # Mai–Juin
    ("5. Service IA (FastAPI)", 9, 3, "#7030A0"),           # Juin
    ("6. Intégrations Stripe / Match", 11, 3, "#C00000"),   # Juin–Juillet
    ("7. Tests, Docker & rapport", 13, 3, "#833C0C"),       # Juillet
    ("Suivi & réunions encadrant", 0, 16, "#7F7F7F"),       # Avril–Juillet
]

W, H = 1600, 900
MARGIN_L = 380
MARGIN_R = 40
MARGIN_T = 120
ROW_H = 70
CHART_W = W - MARGIN_L - MARGIN_R
CHART_H = len(TASKS) * ROW_H


def font(size, bold=False):
    names = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
    ]
    for n in names:
        try:
            return ImageFont.truetype(n, size)
        except OSError:
            continue
    return ImageFont.load_default()


def week_x(week):
    return MARGIN_L + int((week / TOTAL_WEEKS) * CHART_W)


def main():
    img = Image.new("RGB", (W, H), "#FFFFFF")
    draw = ImageDraw.Draw(img)

    title_f = font(32, True)
    sub_f = font(18, False)
    label_f = font(18, True)
    small_f = font(14, False)
    month_f = font(18, True)

    title = "Diagramme de Gantt — FanConnect 2030 (Avril → Juillet)"
    bbox = draw.textbbox((0, 0), title, font=title_f)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, 22), title, fill="#1F4E79", font=title_f)

    subtitle = "Planning prévisionnel du PFE — 4 mois (Avril, Mai, Juin, Juillet)"
    bbox = draw.textbbox((0, 0), subtitle, font=sub_f)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, 66), subtitle, fill="#555555", font=sub_f)

    weeks_per_month = TOTAL_WEEKS // len(MONTHS)

    for i, m in enumerate(MONTHS):
        x0 = week_x(i * weeks_per_month)
        x1 = week_x((i + 1) * weeks_per_month)
        draw.rectangle([x0, MARGIN_T - 38, x1, MARGIN_T - 4], fill="#D6E3F0", outline="#1F4E79")
        bbox = draw.textbbox((0, 0), m, font=month_f)
        mw = bbox[2] - bbox[0]
        draw.text((x0 + (x1 - x0 - mw) / 2, MARGIN_T - 34), m, fill="#1F4E79", font=month_f)

    for w in range(TOTAL_WEEKS + 1):
        x = week_x(w)
        draw.line([(x, MARGIN_T), (x, MARGIN_T + CHART_H)], fill="#E8E8E8", width=1)

    for i in range(len(MONTHS) + 1):
        x = week_x(i * weeks_per_month)
        draw.line([(x, MARGIN_T), (x, MARGIN_T + CHART_H)], fill="#1F4E79", width=2)

    for idx, (name, start, dur, color) in enumerate(TASKS):
        y0 = MARGIN_T + idx * ROW_H
        y1 = y0 + ROW_H
        if idx % 2 == 0:
            draw.rectangle([0, y0, W, y1], fill="#F8FAFC")
        draw.line([(0, y1), (W, y1)], fill="#DDDDDD", width=1)

        draw.text((18, y0 + 22), name, fill="#222222", font=label_f)

        bx0 = week_x(start) + 3
        bx1 = week_x(start + dur) - 3
        by0 = y0 + 18
        by1 = y1 - 18
        draw.rounded_rectangle([bx0, by0, bx1, by1], radius=10, fill=color)

        dur_txt = f"{dur} sem."
        bbox = draw.textbbox((0, 0), dur_txt, font=small_f)
        dw = bbox[2] - bbox[0]
        if bx1 - bx0 > dw + 14:
            draw.text((bx0 + (bx1 - bx0 - dw) / 2, by0 + 6), dur_txt, fill="#FFFFFF", font=small_f)

    note = "Période : Avril → Juillet  |  Chaque barre représente une phase du projet FanConnect 2030."
    draw.text((20, H - 40), note, fill="#666666", font=sub_f)

    img.save(OUT, "PNG")
    print("OK", OUT)


if __name__ == "__main__":
    main()
