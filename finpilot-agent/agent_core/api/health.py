from fastapi import APIRouter

router = APIRouter(tags=["Health & Status"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FinPilot Standalone AI Agent Platform",
        "version": "1.0.0",
        "environment": "production-ready",
        "capabilities": [
            "multi_tenant_isolation",
            "self_contextualization_engine",
            "universal_embed_sdk",
            "gemini_2_flash_reasoning",
            "deterministic_financial_tools",
            "3_tier_guardrails"
        ]
    }
