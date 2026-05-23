from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    image: str = Field(..., description="Base64-encoded image (data URI or raw base64)")
    size: int = Field(64, ge=4, le=300, description="Target grid size (long edge in cells)")
    method: str = Field("lab", description="Color matching method: lab, weighted, euclidean")
    bead_style: str = Field("square", description="Bead rendering style: square or circle")
    show_legend: bool = Field(False, description="Whether to render a color legend at the bottom")
    show_grid: bool = Field(True, description="Whether to render grid lines")
    show_labels: bool = Field(False, description="Whether to render color ID labels on cells")


class GenerateResponse(BaseModel):
    grid: list[list[str]]
    materials: dict[str, int]
    image_url: str
    dimensions: tuple[int, int]  # (width, height) in cells
    total_beads: int
    unique_colors: int
