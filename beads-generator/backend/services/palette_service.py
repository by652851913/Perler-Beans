"""Load palette.json and pre-compute LAB values for all 221 Mard colors."""
import json
import math
import os

from config import PALETTE_PATH


def _srgb_to_linear(c: float) -> float:
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _linear_to_srgb(c: float) -> float:
    if c <= 0.0031308:
        return 12.92 * c
    return 1.055 * (c ** (1.0 / 2.4)) - 0.055


def rgb_to_lab(r: int, g: int, b: int) -> tuple[float, float, float]:
    """Convert sRGB (0-255) to CIELAB (D65)."""
    r_lin = _srgb_to_linear(r)
    g_lin = _srgb_to_linear(g)
    b_lin = _srgb_to_linear(b)

    x = (r_lin * 0.4124564 + g_lin * 0.3575761 + b_lin * 0.1804375) * 100.0
    y = (r_lin * 0.2126729 + g_lin * 0.7151522 + b_lin * 0.0721750) * 100.0
    z = (r_lin * 0.0193339 + g_lin * 0.1191920 + b_lin * 0.9503041) * 100.0

    xn, yn, zn = 95.047, 100.000, 108.883

    def _f(t: float) -> float:
        delta = 6.0 / 29.0
        if t > delta ** 3:
            return t ** (1.0 / 3.0)
        return t / (3.0 * delta * delta) + 4.0 / 29.0

    L = 116.0 * _f(y / yn) - 16.0
    a = 500.0 * (_f(x / xn) - _f(y / yn))
    b_val = 200.0 * (_f(y / yn) - _f(z / zn))
    return (L, a, b_val)


def delta_e_cie76(lab1: tuple, lab2: tuple) -> float:
    return math.sqrt((lab1[0] - lab2[0]) ** 2 + (lab1[1] - lab2[1]) ** 2 + (lab1[2] - lab2[2]) ** 2)


class PaletteService:
    """Singleton service that loads the Mard palette and pre-computes LAB values."""

    def __init__(self):
        self.colors: list[dict] = []
        self._load()

    def _load(self):
        if not os.path.exists(PALETTE_PATH):
            raise FileNotFoundError(f"palette.json not found at {PALETTE_PATH}. Run scripts/parse_palette.py first.")

        with open(PALETTE_PATH, "r", encoding="utf-8") as f:
            raw = json.load(f)

        self.colors = []
        for entry in raw:
            r, g, b = entry["rgb"]
            lab = rgb_to_lab(r, g, b)
            self.colors.append({
                "id": entry["id"],
                "name": entry["name"],
                "rgb": entry["rgb"],
                "hex": entry["hex"],
                "lab": lab,
            })

    def get_all(self) -> list[dict]:
        return self.colors

    def count(self) -> int:
        return len(self.colors)


palette_service = PaletteService()
