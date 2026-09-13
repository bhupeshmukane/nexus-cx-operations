"""Comprehensive tests for /api/tickets endpoints."""

from fastapi.testclient import TestClient


def test_post_ticket_success(client: TestClient) -> None:
    """1. Test creating a ticket successfully returns 201 and formatted ticket_id."""
    payload = {
        "customer_name": "Sarah Connor",
        "customer_email": "sarah@cyberdyne.com",
        "subject": "Core temperature alarm",
        "description": "Reactor unit 3 is running at 110% thermal capacity.",
    }
    response = client.post("/api/tickets", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert "ticket_id" in data
    assert data["ticket_id"].startswith("TKT-")
    assert "created_at" in data


def test_post_ticket_validation_failures(client: TestClient) -> None:
    """2. Test validation failures return 400 Bad Request."""
    # Blank name
    res1 = client.post(
        "/api/tickets",
        json={
            "customer_name": "   ",
            "customer_email": "valid@example.com",
            "subject": "Valid subject",
            "description": "Valid description",
        },
    )
    assert res1.status_code == 400
    assert "customer_name" in res1.json()["detail"]

    # Invalid email
    res2 = client.post(
        "/api/tickets",
        json={
            "customer_name": "Valid Name",
            "customer_email": "not-an-email",
            "subject": "Valid subject",
            "description": "Valid description",
        },
    )
    assert res2.status_code == 400
    assert "email" in res2.json()["detail"].lower()

    # Missing required field (description)
    res3 = client.post(
        "/api/tickets",
        json={
            "customer_name": "Valid Name",
            "customer_email": "valid@example.com",
            "subject": "Valid subject",
        },
    )
    assert res3.status_code == 400


def test_get_tickets_list(client: TestClient) -> None:
    """3. Test retrieving ticket summaries list."""
    response = client.get("/api/tickets")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2

    first = data[0]
    assert "ticket_id" in first
    assert "customer_name" in first
    assert "subject" in first
    assert "status" in first
    assert "created_at" in first


def test_get_tickets_status_filter(client: TestClient) -> None:
    """4. Test filtering tickets by status."""
    # Filter by 'open'
    res_open = client.get("/api/tickets?status=open")
    assert res_open.status_code == 200
    open_tickets = res_open.json()
    assert len(open_tickets) >= 1
    assert all(t["status"] == "open" for t in open_tickets)

    # Filter by 'in_progress'
    res_prog = client.get("/api/tickets?status=in_progress")
    assert res_prog.status_code == 200
    prog_tickets = res_prog.json()
    assert len(prog_tickets) >= 1
    assert all(t["status"] == "in_progress" for t in prog_tickets)

    # Invalid status filter
    res_invalid = client.get("/api/tickets?status=invalid_status")
    assert res_invalid.status_code == 400


def test_get_tickets_search(client: TestClient) -> None:
    """5. Test searching tickets across fields."""
    # Search by customer name
    res1 = client.get("/api/tickets?search=Elena")
    assert res1.status_code == 200
    data1 = res1.json()
    assert len(data1) == 1
    assert data1[0]["customer_name"] == "Elena Rostova"

    # Search by subject
    res2 = client.get("/api/tickets?search=Webhook")
    assert res2.status_code == 200
    data2 = res2.json()
    assert len(data2) == 1
    assert "Webhook" in data2[0]["subject"]

    # Search by ticket ID
    res3 = client.get("/api/tickets?search=TKT-001")
    assert res3.status_code == 200
    data3 = res3.json()
    assert len(data3) == 1
    assert data3[0]["ticket_id"] == "TKT-001"


def test_get_ticket_detail_success(client: TestClient) -> None:
    """6. Test retrieving full ticket detail with notes and AI metadata."""
    response = client.get("/api/tickets/TKT-001")
    assert response.status_code == 200

    data = response.json()
    assert data["ticket_id"] == "TKT-001"
    assert data["customer_name"] == "Elena Rostova"
    assert data["customer_email"] == "elena@example.com"
    assert data["status"] == "open"
    assert data["priority"] == "urgent"
    assert data["category"] == "Authentication"
    assert data["ai_summary"] is not None
    assert data["ai_suggested_response"] is not None
    assert data["ai_confidence"] is not None

    # Notes check
    assert isinstance(data["notes"], list)
    assert len(data["notes"]) >= 1
    assert data["notes"][0]["author"] == "agent"
    assert "Initial investigation" in data["notes"][0]["note"]


def test_get_unknown_ticket_404(client: TestClient) -> None:
    """7. Test retrieving an unknown ticket returns 404."""
    # Non-existent number
    res1 = client.get("/api/tickets/TKT-999")
    assert res1.status_code == 404
    assert "not found" in res1.json()["detail"].lower()

    # Malformed ticket ID
    res2 = client.get("/api/tickets/nonexistent")
    assert res2.status_code == 404


def test_put_ticket_status_update(client: TestClient) -> None:
    """8. Test updating ticket status."""
    payload = {
        "status": "closed",
        "notes": "",
    }
    response = client.put("/api/tickets/TKT-001", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert "updated_at" in data

    # Verify status changed in subsequent GET
    get_res = client.get("/api/tickets/TKT-001")
    assert get_res.status_code == 200
    assert get_res.json()["status"] == "closed"


def test_put_ticket_note_append(client: TestClient) -> None:
    """9. Test appending a note via PUT."""
    payload = {
        "status": "in_progress",
        "notes": "Escalated to network engineering team.",
    }
    response = client.put("/api/tickets/TKT-002", json=payload)
    assert response.status_code == 200

    # Verify note was appended in subsequent GET
    get_res = client.get("/api/tickets/TKT-002")
    assert get_res.status_code == 200
    ticket = get_res.json()
    assert ticket["status"] == "in_progress"

    notes = ticket["notes"]
    assert len(notes) == 1
    assert notes[0]["note"] == "Escalated to network engineering team."
    assert notes[0]["author"] == "agent"


def test_put_unknown_ticket_404(client: TestClient) -> None:
    """10. Test updating an unknown ticket returns 404."""
    payload = {
        "status": "closed",
        "notes": "Closing ticket",
    }
    response = client.put("/api/tickets/TKT-999", json=payload)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_put_ticket_invalid_status_400(client: TestClient) -> None:
    """11. Test updating with invalid status returns 400 Bad Request."""
    payload = {
        "status": "invalid_status",
        "notes": "Some note",
    }
    response = client.put("/api/tickets/TKT-001", json=payload)
    assert response.status_code == 400
    assert "status" in response.json()["detail"].lower()
