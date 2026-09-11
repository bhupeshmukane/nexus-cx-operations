from functools import lru_cache
from supabase import Client, create_client
from app.core.config import get_settings


@lru_cache
def get_supabase_client() -> Client:
    """Initialize and return a cached Supabase client.

    Uses the server-side SUPABASE_SERVICE_ROLE_KEY to perform backend operations.
    Keeps initialization isolated from route modules and does not expose
    credentials to the client-side frontend.
    """
    settings = get_settings()

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured "
            "to initialize the Supabase client."
        )

    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
