"""Pydantic request and response models for ticket operations."""

import re
from typing import Any, List, Optional
from pydantic import BaseModel, Field, ValidationInfo, field_validator

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
ALLOWED_STATUSES = ("open", "in_progress", "closed")


def format_ticket_id(ticket_number: int) -> str:
    """Format an internal integer ticket_number as public identifier (e.g. TKT-001)."""
    return f"TKT-{ticket_number:03d}"


def parse_ticket_id(ticket_id: str) -> Optional[int]:
    """Parse public ticket identifier (e.g. 'TKT-001', 'tkt-42', '1042') into integer.

    Returns None if the format is invalid.
    """
    if not ticket_id:
        return None
    clean = ticket_id.strip()
    match = re.match(r"^(?:TKT-)?(\d+)$", clean, re.IGNORECASE)
    if match:
        try:
            val = int(match.group(1))
            return val if val > 0 else None
        except ValueError:
            return None
    return None


class TicketCreateRequest(BaseModel):
    """Request payload to create a new ticket."""

    customer_name: str = Field(..., description="Customer full name")
    customer_email: str = Field(..., description="Customer email address")
    subject: str = Field(..., description="Ticket subject line")
    description: str = Field(..., description="Detailed issue description")

    @field_validator("customer_name", "subject", "description")
    @classmethod
    def validate_not_blank(cls, v: str, info: ValidationInfo) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError(f"{info.field_name} must not be blank")
        return cleaned

    @field_validator("customer_email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if not EMAIL_REGEX.match(cleaned):
            raise ValueError("Invalid email address format")
        return cleaned


class TicketCreateResponse(BaseModel):
    """Response returned upon successful ticket creation."""

    ticket_id: str
    created_at: str


class TicketUpdateRequest(BaseModel):
    """Request payload to update ticket status and append optional note."""

    status: str = Field(
        ..., description="New operational status ('open', 'in_progress', 'closed')"
    )
    notes: Optional[str] = Field(
        default="", description="Optional internal activity note to append"
    )

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if cleaned not in ALLOWED_STATUSES:
            raise ValueError(
                f"Status must be one of: {', '.join(ALLOWED_STATUSES)}"
            )
        return cleaned


class TicketUpdateResponse(BaseModel):
    """Response returned upon successful ticket update."""

    success: bool = True
    updated_at: str


class TicketSummaryResponse(BaseModel):
    """Ticket summary representation for list views."""

    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    status: str
    priority: Optional[str] = None
    category: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_confidence: Optional[float] = None
    created_at: str
    updated_at: Optional[str] = None


class TicketNoteResponse(BaseModel):
    """Internal activity note representation."""

    id: str
    note: str
    author: str
    created_at: str


class TicketDetailResponse(BaseModel):
    """Complete ticket detail including issue description and activity notes."""

    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    priority: Optional[str] = None
    category: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_suggested_response: Optional[str] = None
    ai_confidence: Optional[float] = None
    created_at: str
    updated_at: Optional[str] = None
    notes: List[TicketNoteResponse] = []
