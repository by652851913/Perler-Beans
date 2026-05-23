"""POST /api/generate — orchestrates the full image→bead pattern pipeline."""
import time

from fastapi import APIRouter, HTTPException

from models.schemas import GenerateRequest, GenerateResponse
from services.palette_service import palette_service
from services.image_service import decode_base64_image, resize_and_pixelate
from services.color_matcher import color_matcher
from services.grid_renderer import render_bead_grid, save_grid_image
from config import MAX_IMAGE_SIZE_MB

router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    # Validate image size
    # Base64 increases size by ~33%. Check roughly.
    max_b64_len = int(MAX_IMAGE_SIZE_MB * 1024 * 1024 * 1.4)
    if len(request.image) > max_b64_len:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Maximum size is {MAX_IMAGE_SIZE_MB}MB."
        )

    try:
        img = decode_base64_image(request.image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to decode image: {str(e)}")

    # Pixelate
    pixel_grid, width, height = resize_and_pixelate(img, request.size)

    # Color match
    method = request.method if request.method in ("lab", "weighted", "euclidean") else "lab"
    color_grid = color_matcher.match_pixels(pixel_grid, method=method)

    # Count materials
    materials = color_matcher.count_materials(color_grid)

    # Build materials data for legend
    materials_data = []
    if request.show_legend:
        palette = {c["id"]: c for c in palette_service.get_all()}
        for color_id, count in materials.items():
            c = palette.get(color_id, {})
            materials_data.append({
                "id": color_id,
                "name": c.get("name", color_id),
                "rgb": c.get("rgb", [128, 128, 128]),
                "count": count,
            })

    # Render bead grid PNG
    grid_image = render_bead_grid(
        color_grid,
        show_grid=request.show_grid,
        show_labels=request.show_labels,
        bead_style=request.bead_style,
        materials=materials_data if materials_data else None,
        show_legend=request.show_legend,
    )
    image_url = save_grid_image(grid_image)

    # Build 2D string grid for response
    str_grid = [[cell["id"] for cell in row] for row in color_grid]

    total_beads = width * height
    unique_colors = len(materials)

    return GenerateResponse(
        grid=str_grid,
        materials=materials,
        image_url=image_url,
        dimensions=(width, height),
        total_beads=total_beads,
        unique_colors=unique_colors,
    )


@router.get("/palette")
async def get_palette():
    """Return the full 221-color Mard palette with RGB and name."""
    return [
        {"id": c["id"], "name": c["name"], "rgb": c["rgb"], "hex": c["hex"]}
        for c in palette_service.get_all()
    ]


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "palette_colors": palette_service.count(),
    }
