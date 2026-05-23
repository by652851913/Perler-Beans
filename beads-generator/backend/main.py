"""FastAPI application entry point."""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import CORS_ORIGINS, OUTPUT_DIR
from routes.generate import router as generate_router

app = FastAPI(
    title="Dopamine Beads API",
    description="拼豆图纸生成器 — Mard 221 标准色号",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for generated PNGs
os.makedirs(OUTPUT_DIR, exist_ok=True)
app.mount("/output", StaticFiles(directory=OUTPUT_DIR), name="output")

# Routes
app.include_router(generate_router, prefix="/api", tags=["generate"])


@app.on_event("startup")
async def startup():
    from services.palette_service import palette_service
    print(f"Palette loaded: {palette_service.count()} colors")


@app.get("/")
async def root():
    return {"name": "Dopamine Beads API", "docs": "/docs"}
