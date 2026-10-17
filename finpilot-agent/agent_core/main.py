import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from agent_core.config import settings
from agent_core.db.database import engine, Base
from agent_core.api.router import api_router
from agent_core.api.health import health_check

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Universal Autonomous AI SME Financial Copilot Microservice Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_router)

# Mount SDK static assets (loader.js, widget.html, demos, hub, admin, customer)
SDK_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sdk")
if os.path.exists(SDK_DIR):
    app.mount("/sdk", StaticFiles(directory=SDK_DIR, html=True), name="sdk")

# Customer Copilot UI (Default Root & /customer)
@app.get("/", tags=["Agent Customer Portal"])
def root_customer_portal():
    customer_file = os.path.join(SDK_DIR, "customer", "index.html")
    if os.path.exists(customer_file):
        return FileResponse(customer_file)
    hub_file = os.path.join(SDK_DIR, "hub", "index.html")
    if os.path.exists(hub_file):
        return FileResponse(hub_file)
    return health_check()

@app.get("/customer", tags=["Agent Customer Portal"])
def get_customer_portal():
    customer_file = os.path.join(SDK_DIR, "customer", "index.html")
    if os.path.exists(customer_file):
        return FileResponse(customer_file)
    return root_customer_portal()

# Dedicated Admin Console UI (/admin)
@app.get("/admin", tags=["Agent Admin Console"])
def get_admin_console():
    admin_file = os.path.join(SDK_DIR, "admin", "index.html")
    if os.path.exists(admin_file):
        return FileResponse(admin_file)
    return root_customer_portal()

@app.get("/hub", tags=["Agent Hub Web Portal"])
def get_hub():
    hub_file = os.path.join(SDK_DIR, "hub", "index.html")
    if os.path.exists(hub_file):
        return FileResponse(hub_file)
    return root_customer_portal()
