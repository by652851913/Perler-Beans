"""LAB color matching engine — maps pixel RGBs to closest Mard color."""
import math

from services.palette_service import palette_service, rgb_to_lab, delta_e_cie76


class ColorMatcher:
    """Matches RGB pixels to the closest Mard palette color using LAB Delta E."""

    def __init__(self):
        self.palette_lab = palette_service.get_all()
        self.palette_rgb = [(c["rgb"][0], c["rgb"][1], c["rgb"][2]) for c in self.palette_lab]

    def find_closest_lab(self, r: int, g: int, b: int) -> dict:
        """Find the closest palette color by CIE76 Delta E in LAB space."""
        target_lab = rgb_to_lab(r, g, b)
        best = None
        best_dist = float("inf")
        for c in self.palette_lab:
            d = delta_e_cie76(target_lab, c["lab"])
            if d < best_dist:
                best_dist = d
                best = c
        return best

    def find_closest_weighted_rgb(self, r: int, g: int, b: int) -> dict:
        """Fallback: weighted RGB distance (approximates human perception)."""
        best = None
        best_dist = float("inf")
        for c in self.palette_lab:
            cr, cg, cb = c["rgb"]
            r_mean = (r + cr) / 2
            dr, dg, db = r - cr, g - cg, b - cb
            d = math.sqrt(
                ((512 + r_mean) * dr * dr) / 256 +
                4 * dg * dg +
                ((767 - r_mean) * db * db) / 256
            )
            if d < best_dist:
                best_dist = d
                best = c
        return best

    def find_closest_euclidean(self, r: int, g: int, b: int) -> dict:
        """Fallback: simple Euclidean RGB distance."""
        best = None
        best_dist = float("inf")
        for c in self.palette_lab:
            cr, cg, cb = c["rgb"]
            d = math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2)
            if d < best_dist:
                best_dist = d
                best = c
        return best

    def match_pixels(
        self, pixel_grid: list[list[tuple[int, int, int, int]]], method: str = "lab"
    ) -> list[list[dict]]:
        """Convert a pixel grid to a Mard color grid. Choose matching method."""
        if method == "weighted":
            finder = self.find_closest_weighted_rgb
        elif method == "euclidean":
            finder = self.find_closest_euclidean
        else:
            finder = self.find_closest_lab

        result = []
        for row in pixel_grid:
            result_row = []
            for pixel in row:
                r, g, b, a = pixel
                if a < 30:
                    # Transparent → match to lightest white-ish color
                    result_row.append(self._find_white())
                else:
                    result_row.append(finder(r, g, b))
            result.append(result_row)
        return result

    def _find_white(self) -> dict:
        """Return the whitest color in the palette (highest L value)."""
        best = self.palette_lab[0]
        for c in self.palette_lab:
            if c["lab"][0] > best["lab"][0]:
                best = c
        return best

    @staticmethod
    def count_materials(color_grid: list[list[dict]]) -> dict[str, int]:
        """Tally each color ID in the grid, sorted descending by count."""
        counts: dict[str, int] = {}
        for row in color_grid:
            for cell in row:
                cid = cell["id"]
                counts[cid] = counts.get(cid, 0) + 1
        return dict(sorted(counts.items(), key=lambda x: x[1], reverse=True))


color_matcher = ColorMatcher()
