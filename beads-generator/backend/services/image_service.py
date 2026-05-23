"""Image decoding and pixelation using Pillow."""
import base64
import io
import re

from PIL import Image


def decode_base64_image(image_str: str) -> Image.Image:
    """Decode a base64 data URI or raw base64 string into a Pillow Image."""
    # Strip data URI prefix if present: "data:image/png;base64,..."
    if image_str.startswith("data:"):
        match = re.match(r"data:image/\w+;base64,(.+)", image_str, re.DOTALL)
        if match:
            image_str = match.group(1)

    raw_bytes = base64.b64decode(image_str)
    return Image.open(io.BytesIO(raw_bytes)).convert("RGBA")


def resize_and_pixelate(img: Image.Image, target_size: int) -> tuple[list, int, int]:
    """Resize image to target_size on longest edge (NEAREST sampling), return pixel grid.

    Returns (pixel_grid, width, height) where pixel_grid is list[list[tuple[r,g,b,a]]].
    """
    # Calculate output dimensions maintaining aspect ratio
    w, h = img.size
    if w >= h:
        out_w = target_size
        out_h = max(1, round(target_size * h / w))
    else:
        out_h = target_size
        out_w = max(1, round(target_size * w / h))

    resized = img.resize((out_w, out_h), Image.NEAREST)
    pixels = list(resized.getdata())

    # Build 2D grid
    grid = []
    for y in range(out_h):
        row = []
        for x in range(out_w):
            idx = y * out_w + x
            row.append(pixels[idx])  # (r, g, b, a)
        grid.append(row)

    return grid, out_w, out_h
