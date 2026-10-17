from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.database import init_db
from app.db.seed_data import seed_database
import os
from fastapi.staticfiles import StaticFiles
from app.api import (
    auth, invoices, expenses, income, clients,
    cashflow, dashboard, reports, financing, agent, widget
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed if empty
    init_db()
    try:
        seed_database()
    except Exception as e:
        print(f"Seed initialization notice: {e}")
    yield

app = FastAPI(
    title="FinPilot SME Finance Copilot API",
    description="Enterprise-grade AI Copilot for SME Cash Flow, Accounts Receivable, and Non-Dilutive Financing (FinTechathon 2026).",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers with /api/v1 prefix
api_v1_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(invoices.router, prefix=api_v1_prefix)
app.include_router(expenses.router, prefix=api_v1_prefix)
app.include_router(income.router, prefix=api_v1_prefix)
app.include_router(clients.router, prefix=api_v1_prefix)
app.include_router(cashflow.router, prefix=api_v1_prefix)
app.include_router(dashboard.router, prefix=api_v1_prefix)
app.include_router(reports.router, prefix=api_v1_prefix)
app.include_router(financing.router, prefix=api_v1_prefix)
app.include_router(agent.router, prefix=api_v1_prefix)
app.include_router(widget.router, prefix=api_v1_prefix)

# Mount SDK Static Directory
sdk_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../sdk"))
if os.path.exists(sdk_path):
    app.mount("/sdk", StaticFiles(directory=sdk_path, html=True), name="sdk")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "finpilot-backend"}

@app.get("/api-info")
def api_info():
    return {
        "name": "FinPilot SME Finance Copilot",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs"
    }

# Mount Frontend Dist if built
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
else:
    @app.get("/")
    def root():
        return {
            "name": "FinPilot SME Finance Copilot",
            "version": "1.0.0",
            "status": "online",
            "docs_url": "/docs"
        }

