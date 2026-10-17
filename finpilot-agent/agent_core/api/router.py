from fastapi import APIRouter
from agent_core.api.health import router as health_router
from agent_core.api.tenants import router as tenants_router
from agent_core.api.keys import router as keys_router
from agent_core.api.data_sync import router as sync_router
from agent_core.api.chat import router as chat_router
from agent_core.api.widget import router as widget_router
from agent_core.api.pillars import router as pillars_router
from agent_core.api.admin_auth import router as admin_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health_router)
api_router.include_router(tenants_router)
api_router.include_router(keys_router)
api_router.include_router(sync_router)
api_router.include_router(chat_router)
api_router.include_router(widget_router)
api_router.include_router(pillars_router)
api_router.include_router(admin_router)
