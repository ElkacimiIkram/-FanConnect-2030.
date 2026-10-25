"""Generate simple branded tech icons (PNG) for the PFE report."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).parent / "tech-icons"
OUT.mkdir(parents=True, exist_ok=True)

SIZE = 256
RADIUS = 48

TECHS = [
    ("spring-boot", "#6DB33F", "Spring\nBoot", "Java API"),
    ("react", "#61DAFB", "React", "Frontend"),
    ("postgresql", "#336791", "PostgreSQL", "Database"),
    ("fastapi", "#009688", "FastAPI", "AI Service"),
    ("python", "#3776AB", "Python", "ML / IA"),
    ("stripe", "#635BFF", "Stripe", "Paiement"),
    ("jwt", "#D63AFF", "JWT", "Sécurité"),
    ("docker", "#2496ED", "Docker", "DevOps"),
    ("swagger", "#85EA2D", "OpenAPI", "Docs API"),
    ("vite", "#646CFF", "Vite", "Build"),
]


def font(size: int):
    for name in [
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ]:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def rounded_rect(draw, xy, radius, fill):
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


def make_icon(slug, color, title, subtitle):
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    # soft shadow
    shadow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((16, 20, SIZE - 12, SIZE - 8), radius=RADIUS, fill=(0, 0, 0, 45))
    img = Image.alpha_composite(img, shadow)
    draw = ImageDraw.Draw(img)

    rounded_rect(draw, (12, 12, SIZE - 20, SIZE - 20), RADIUS, color)

    # white inner panel
    rounded_rect(draw, (36, 36, SIZE - 44, SIZE - 44), 36, "#FFFFFF")

    title_font = font(42 if "\n" in title else 48)
    sub_font = font(22)

    # title
    lines = title.split("\n")
    y = 78 if len(lines) == 1 else 58
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=title_font)
        tw = bbox[2] - bbox[0]
        draw.text(((SIZE - tw) / 2, y), line, fill=color, font=title_font)
        y += 48

    bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
    tw = bbox[2] - bbox[0]
    draw.text(((SIZE - tw) / 2, 185), subtitle, fill="#555555", font=sub_font)

    path = OUT / f"{slug}.png"
    img.convert("RGB").save(path, "PNG")
    print("wrote", path)
    return path


def main():
    for item in TECHS:
        make_icon(*item)


if __name__ == "__main__":
    main()
