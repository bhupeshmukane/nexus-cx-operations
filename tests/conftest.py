"""Pytest fixtures and configuration for backend testing."""

import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app
from app.db.supabase import get_supabase_client


class MockQueryBuilder:
    """Mock PostgREST query builder mimicking Supabase Client table operations."""

    def __init__(self, store: List[Dict[str, Any]], table_name: str, client: "MockSupabaseClient"):
        self.store = store
        self.table_name = table_name
        self.client = client
        self.items = [dict(d) for d in store]
        self.op = "select"
        self.payload: Any = None
        self.eq_col: Optional[str] = None
        self.eq_val: Any = None

    def select(self, cols: str = "*") -> "MockQueryBuilder":
        self.op = "select"
        return self

    def insert(self, payload: Any) -> "MockQueryBuilder":
        self.op = "insert"
        self.payload = payload
        return self

    def update(self, payload: Any) -> "MockQueryBuilder":
        self.op = "update"
        self.payload = payload
        return self

    def eq(self, col: str, val: Any) -> "MockQueryBuilder":
        self.eq_col = col
        self.eq_val = val
        if self.op == "select":
            self.items = [i for i in self.items if str(i.get(col)) == str(val)]
        return self

    def or_(self, cond_str: str) -> "MockQueryBuilder":
        conds = cond_str.split(",")

        def matches(item: Dict[str, Any]) -> bool:
            for c in conds:
                parts = c.split(".")
                if len(parts) == 3:
                    col, op, val = parts
                    item_val = item.get(col)
                    if op == "eq" and str(item_val) == str(val):
                        return True
                    elif op == "ilike":
                        needle = val.strip("%").lower()
                        if item_val and needle in str(item_val).lower():
                            return True
            return False

        self.items = [i for i in self.items if matches(i)]
        return self

    def order(self, col: str, desc: bool = False) -> "MockQueryBuilder":
        self.items.sort(key=lambda x: str(x.get(col, "")), reverse=desc)
        return self

    def execute(self) -> Any:
        class Response:
            def __init__(self, data: Any):
                self.data = data

        now = datetime.now(timezone.utc).isoformat()

        if self.op == "insert":
            item = dict(self.payload)
            if "id" not in item:
                item["id"] = f"uuid-{self.table_name}-{len(self.store) + 1}"
            if self.table_name == "tickets":
                self.client.max_ticket_number += 1
                item["ticket_number"] = self.client.max_ticket_number
            if "created_at" not in item:
                item["created_at"] = now
            if "updated_at" not in item:
                item["updated_at"] = now
            self.store.append(item)
            return Response([dict(item)])

        elif self.op == "update":
            updated = []
            for item in self.store:
                if str(item.get(self.eq_col, "")) == str(self.eq_val):
                    item.update(self.payload)
                    item["updated_at"] = now
                    updated.append(dict(item))
            return Response(updated)

        else:  # select
            return Response([dict(i) for i in self.items])


class MockSupabaseClient:
    """Mock Supabase client for isolated, offline unit testing."""

    def __init__(self) -> None:
        self.tickets: List[Dict[str, Any]] = []
        self.ticket_notes: List[Dict[str, Any]] = []
        self.max_ticket_number: int = 0

    def table(self, name: str) -> MockQueryBuilder:
        store = self.tickets if name == "tickets" else self.ticket_notes
        return MockQueryBuilder(store, name, self)


@pytest.fixture
def mock_supabase() -> MockSupabaseClient:
    """Fixture providing a fresh mock Supabase database instance."""
    client = MockSupabaseClient()

    # Pre-seed with two initial tickets
    client.table("tickets").insert({
        "customer_name": "Elena Rostova",
        "customer_email": "elena@example.com",
        "subject": "SAML SSO Assertion failure",
        "description": "Engineers unable to log in following Okta certificate rotation.",
        "status": "open",
        "priority": "urgent",
        "category": "Authentication",
        "ai_summary": "SAML SSO failure due to certificate rotation.",
        "ai_suggested_response": "Please re-import IdP metadata.",
        "ai_confidence": 0.96,
    }).execute()

    client.table("tickets").insert({
        "customer_name": "David Chen",
        "customer_email": "david@example.com",
        "subject": "Webhook gateway timeout",
        "description": "Webhook events failing with 504 status.",
        "status": "in_progress",
        "priority": "high",
        "category": "Webhooks",
        "ai_summary": "Webhook delivery failure.",
        "ai_suggested_response": "We will replay failed events.",
        "ai_confidence": 0.91,
    }).execute()

    # Seed an initial note for the first ticket
    first_ticket_id = client.tickets[0]["id"]
    client.table("ticket_notes").insert({
        "ticket_id": first_ticket_id,
        "note": "Initial investigation started by Tier 2 support.",
        "author": "agent",
    }).execute()

    return client


@pytest.fixture
def client(mock_supabase: MockSupabaseClient) -> TestClient:
    """Fixture providing a TestClient with injected mock Supabase database."""
    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.clear()
