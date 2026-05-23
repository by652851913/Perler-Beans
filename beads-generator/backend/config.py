import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT_DIR, "data")
PALETTE_PATH = os.path.join(DATA_DIR, "palette.json")
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

MAX_IMAGE_SIZE_MB = 10
ALLOWED_GRID_SIZES = {32, 48, 64, 96, 128}
GRID_SIZE_MIN = 4
GRID_SIZE_MAX = 300

OUTPUT_IMAGE_MAX_DIMENSION = 800
