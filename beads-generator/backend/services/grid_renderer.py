"""Render the bead grid pattern as a PNG image using Pillow."""
import os
import uuid

from PIL import Image, ImageDraw, ImageFont

from config import OUTPUT_DIR, OUTPUT_IMAGE_MAX_DIMENSION


def _get_text_color(r: int, g: int, b: int) -> tuple[int, int, int]:
    """Return black or white text color depending on background luminance."""
    luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
    return (0, 0, 0) if luminance > 0.55 else (255, 255, 255)


def _draw_legend(draw: ImageDraw.ImageDraw, materials: list[dict], start_y: int, canvas_w: int, font):
    """Draw color legend below the grid. Returns the new Y position after legend."""
    legend_y = start_y + 12
    draw.rectangle([0, start_y, canvas_w, start_y + 2], fill=(200, 200, 200, 255))
    draw.text((10, start_y + 6), "色号图例 / Color Legend", fill=(60, 60, 60), font=font)

    cols = max(3, canvas_w // 220)
    swatch_size = 14
    row_h = 20
    x_pad = 10
    y_pad = 4

    for i, m in enumerate(materials):
        col = i % cols
        row = i // cols
        x = x_pad + col * (canvas_w // cols)
        y = legend_y + row * row_h

        r, g, b = m["rgb"]
        label = f"{m['id']} {m['name']} ({m['count']}颗)"
        # Color swatch
        draw.rectangle([x, y + 2, x + swatch_size, y + 2 + swatch_size], fill=(r, g, b, 255))
        draw.rectangle([x, y + 2, x + swatch_size, y + 2 + swatch_size], outline=(150, 150, 150, 255), width=1)
        # Label
        draw.text((x + swatch_size + 4, y), label, fill=(50, 50, 50), font=font)

    return legend_y + ((len(materials) - 1) // cols + 1) * row_h + 16


def render_bead_grid(
    color_grid: list[list[dict]],
    show_grid: bool = True,
    show_labels: bool = False,
    bead_style: str = "square",
    materials: list[dict] | None = None,
    show_legend: bool = False,
) -> Image.Image:
    """Render the bead grid as a Pillow Image."""
    height = len(color_grid)
    width = len(color_grid[0]) if height > 0 else 0

    if height == 0 or width == 0:
        return Image.new("RGBA", (100, 100), (255, 255, 255, 255))

    # Determine cell size to fit within max dimension
    max_dim = max(width, height)
    cell_size = max(4, OUTPUT_IMAGE_MAX_DIMENSION // max_dim)
    canvas_w = width * cell_size
    grid_h = height * cell_size

    # Reserve space for legend if needed
    legend_h = 0
    if show_legend and materials:
        legend_h = ((len(materials) - 1) // max(3, canvas_w // 220) + 1) * 20 + 40

    canvas_h = grid_h + legend_h

    img = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Try to load a font for labels, fall back to default
    try:
        font = ImageFont.truetype("arial.ttf", size=max(7, int(cell_size * 0.4)))
    except (OSError, IOError):
        try:
            font = ImageFont.truetype("msyh.ttf", size=max(7, int(cell_size * 0.4)))
        except (OSError, IOError):
            font = ImageFont.load_default()

    # Smaller font for legend
    try:
        legend_font = ImageFont.truetype("msyh.ttf", size=12)
    except (OSError, IOError):
        legend_font = ImageFont.load_default()

    use_circle = bead_style == "circle"
    radius = (cell_size - 1) / 2
    cx_offset = cell_size / 2
    cy_offset = cell_size / 2

    for y in range(height):
        for x in range(width):
            c = color_grid[y][x]
            r, g, b = c["rgb"]
            x0 = x * cell_size
            y0 = y * cell_size
            x1 = x0 + cell_size
            y1 = y0 + cell_size
            cx = x0 + cx_offset
            cy = y0 + cy_offset

            if use_circle and cell_size >= 6:
                draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=(r, g, b, 255))
            else:
                draw.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(r, g, b, 255))

            # Grid lines
            if show_grid and cell_size >= 4:
                if use_circle and cell_size >= 6:
                    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=(0, 0, 0, 40), width=1)
                else:
                    draw.rectangle([x0, y0, x1 - 1, y1 - 1], outline=(0, 0, 0, 40), width=1)

            # Color code label
            if show_labels and cell_size >= 14:
                text_color = _get_text_color(r, g, b)
                label = c["id"]
                bbox = draw.textbbox((0, 0), label, font=font)
                tw = bbox[2] - bbox[0]
                th = bbox[3] - bbox[1]
                tx = x0 + (cell_size - tw) / 2
                ty = y0 + (cell_size - th) / 2
                draw.text((tx, ty), label, fill=text_color, font=font)

    if show_legend and materials:
        _draw_legend(draw, materials, grid_h, canvas_w, legend_font)

    return img


def save_grid_image(image: Image.Image) -> str:
    """Save image to output dir, return relative URL path."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filename = f"bead_{uuid.uuid4().hex[:12]}.png"
    filepath = os.path.join(OUTPUT_DIR, filename)
    image.save(filepath, "PNG")
    return f"/output/{filename}"
