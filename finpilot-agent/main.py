"""FinPilot Agent entry point.

Run with: python main.py
Or: uvicorn main:app --reload --port 8100
"""
import uvicorn
from app.main import app
from config import settings


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
