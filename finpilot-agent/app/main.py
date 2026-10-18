"""Main FastAPI application for FinPilot Agent.

Mounts all routes, CORS, and serves the SDK.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

from config import settings
from app.core.db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    # Initialize database
    await init_db()
    yield
    # Cleanup (optional)


app = FastAPI(
    title="FinPilot Agent",
    description="Autonomous AI SME Financial Copilot API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS: Allow SDK embedding
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount SDK static files
app.mount("/sdk", StaticFiles(directory="sdk"), name="sdk")

# API routes
from app.api import chat, admin_api, sync

app.include_router(chat.router)
app.include_router(admin_api.router)
app.include_router(sync.router)


@app.get("/")
async def root():
    """Redirect root to docs."""
    return RedirectResponse(url="/docs")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}
