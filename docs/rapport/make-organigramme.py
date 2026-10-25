"""Organigramme fonctionnel GM-Soft (reconstitué à partir des activités publiées)."""
from PIL import Image, ImageDraw, ImageFont

W, H = 1500, 920
BG = (248, 250, 252)
NAVY = (17, 24, 39)
GREEN = (15, 159, 88)
WHITE = (255, 255, 255)
MUTED = (71, 85, 105)
LIGHT = (236, 253, 243)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)


def font(size, bold=False):
    names = [
        "C:\\Windows\\Fonts\\segoeuib.ttf" if bold else "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf",
    ]
    for n in names:
        try:
            return ImageFont.truetype(n, size)
        except OSError:
            continue
    return ImageFont.load_default()


F_TITLE = font(24, True)
F_BOX = font(15, True)
F_SUB = font(13, False)
F_SMALL = font(12, False)


def rounded(xy, r, fill, outline=NAVY, width=2):
    d.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=width)


def center_text(box, lines):
    x0, y0, x1, y1 = box
    cx = (x0 + x1) / 2
    fonts = [F_BOX] + [F_SUB] * (len(lines) - 1)
    fills = [NAVY] + [MUTED] * (len(lines) - 1)
    total_h = 0
    sizes = []
    for t, f in zip(lines, fonts):
        bb = f.getbbox(t)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        sizes.append((tw, th, f))
        total_h += th + 4
    y = y0 + (y1 - y0 - total_h) / 2
    for t, (tw, th, f), c in zip(lines, sizes, fills):
        d.text((cx - tw / 2, y), t, font=f, fill=c)
        y += th + 4


def box(x, y, w, h, lines, fill=WHITE):
    rounded((x, y, x + w, y + h), 12, fill)
    center_text((x, y, x + w, y + h), lines)
    return x + w / 2, y, y + h


def vline(x, y1, y2):
    d.line((x, y1, x, y2), fill=GREEN, width=3)


def hline(x1, x2, y):
    d.line((x1, y, x2, y), fill=GREEN, width=3)


title = "Organigramme fonctionnel — GM-Soft"
bb = F_TITLE.getbbox(title)
d.text(((W - (bb[2] - bb[0])) / 2, 18), title, font=F_TITLE, fill=NAVY)
sub = "(German Moroccan Software Company) — structure reconstituée d'après les activités publiées"
bb = F_SMALL.getbbox(sub)
d.text(((W - (bb[2] - bb[0])) / 2, 50), sub, font=F_SMALL, fill=MUTED)

# Direction
dg_cx, _, dg_bot = box(510, 88, 480, 72, ["Direction générale", "Pilotage Maroc  ·  Allemagne"], fill=LIGHT)

# Four poles
POLE_Y, POLE_H, POLE_W, GAP = 210, 78, 300, 36
total = 4 * POLE_W + 3 * GAP
sx = (W - total) / 2
vline(dg_cx, dg_bot, 190)
hline(sx + POLE_W / 2, sx + total - POLE_W / 2, 190)

poles = [
    (WHITE, ["Pôle Conseil & SI", "Cadrage, intégration"]),
    (LIGHT, ["Pôle Développement", "Web, mobile, ERP, métiers"]),
    (WHITE, ["Pôle Données & sécu", "BDD, infrastructure, GM-SEC"]),
    (WHITE, ["Pôle Support", "Maintenance, formation"]),
]
pole_cx = []
for i, (fill, lines) in enumerate(poles):
    x = sx + i * (POLE_W + GAP)
    c, _t, b = box(x, POLE_Y, POLE_W, POLE_H, lines, fill=fill)
    vline(c, 190, POLE_Y)
    pole_cx.append((c, b))

dev_cx, dev_bot = pole_cx[1]

# Three product lines under Développement
SUB_Y, SUB_H, SUB_W, SUB_GAP = 340, 66, 210, 22
subs = [
    ["Applications", "web & mobiles"],
    ["Solutions ERP", "GM-ERP  ·  GM-POS"],
    ["Solutions métiers", "GM-CAFE  ·  GM-HOTEL"],
]
sub_total = 3 * SUB_W + 2 * SUB_GAP
sub_sx = dev_cx - sub_total / 2
vline(dev_cx, dev_bot, 322)
hline(sub_sx + SUB_W / 2, sub_sx + sub_total - SUB_W / 2, 322)
for i, lines in enumerate(subs):
    x = sub_sx + i * (SUB_W + SUB_GAP)
    c, _t, _b = box(x, SUB_Y, SUB_W, SUB_H, lines)
    vline(c, 322, SUB_Y)

# Sites spanning all poles
SITE_Y = 460
hline(pole_cx[0][0], pole_cx[3][0], 440)
vline(pole_cx[0][0], POLE_Y + POLE_H, 440)
vline(pole_cx[3][0], POLE_Y + POLE_H, 440)
vline(dg_cx, 440, SITE_Y)
box(280, SITE_Y, 940, 58, ["Sites :  Béni Mellal (siège)   ·   Casablanca   ·   Rabat   ·   Allemagne"])

# PFE
PFE_Y = 560
vline(dev_cx, SITE_Y + 58, PFE_Y)
box(
    int(dev_cx - 360),
    PFE_Y,
    720,
    78,
    [
        "Stage PFE — FanConnect 2030",
        "Affectation : pôle Développement  ·  encadrement ingénieur professionnel",
    ],
    fill=LIGHT,
)

note = (
    "Note : organigramme fonctionnel (pôles), non nominatif. "
    "GM-Soft n'a pas communiqué d'organigramme officiel ; "
    "cette figure est reconstituée à partir des activités et solutions publiées."
)
words = note.split()
lines, cur = [], ""
for w in words:
    test = (cur + " " + w).strip()
    if F_SMALL.getbbox(test)[2] - F_SMALL.getbbox(test)[0] > 1280:
        lines.append(cur)
        cur = w
    else:
        cur = test
if cur:
    lines.append(cur)
y = 680
for ln in lines:
    bb = F_SMALL.getbbox(ln)
    d.text(((W - (bb[2] - bb[0])) / 2, y), ln, font=F_SMALL, fill=MUTED)
    y += 20

# Crop extra white
img = img.crop((0, 0, W, 760))
out = r"C:\Users\admin\Desktop\doc site\FanConnect-2030\docs\rapport\diagrams\05-organigramme-gmsoft.png"
img.save(out)
print("saved", out, img.size)
