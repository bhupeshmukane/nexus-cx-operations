from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient) -> None:
    """Test GET /health returns 200 and expected status payload."""
    response = client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data.get("status") == "healthy"
    assert "environment" in data
