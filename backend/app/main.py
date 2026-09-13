"""Main FastAPI application for NEXUS CX Operations Console."""

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.tickets import router as tickets_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="NEXUS CX Operations API",
    description="Backend API for NEXUS CX Operations platform",
    version="0.1.0",
)

# Narrowly scoped development CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Return clean 400 Bad Request error for request validation failures."""
    error_messages = []
    for error in exc.errors():
        loc = " -> ".join(str(item) for item in error.get("loc", []))
        msg = error.get("msg", "Invalid value")
        error_messages.append(f"{loc}: {msg}")

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "; ".join(error_messages)},
    )


# Include tickets router under /api/tickets
app.include_router(tickets_router)


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """Health check endpoint to verify that the API process is running.

    This endpoint is intentionally independent of database connectivity.
    """
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
    }
