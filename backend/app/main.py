from fastapi import FastAPI
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="NEXUS CX Operations API",
    description="Backend API for NEXUS CX Operations platform",
    version="0.1.0",
)


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """Health check endpoint to verify that the API process is running.

    This endpoint is intentionally independent of database connectivity.
    """
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
    }
