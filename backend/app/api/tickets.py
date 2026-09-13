"""Tickets API router for NEXUS CX Operations Console."""

import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.db.supabase import get_supabase_client
from app.models.ticket import (
    ALLOWED_STATUSES,
    TicketCreateRequest,
    TicketCreateResponse,
    TicketDetailResponse,
    TicketNoteResponse,
    TicketSummaryResponse,
    TicketUpdateRequest,
    TicketUpdateResponse,
    format_ticket_id,
    parse_ticket_id,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


@router.post(
    "",
    response_model=TicketCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new ticket",
)
def create_ticket(
    payload: TicketCreateRequest,
    client: Client = Depends(get_supabase_client),
) -> TicketCreateResponse:
    """Create a new ticket record in Supabase PostgreSQL."""
    try:
        insert_data = {
            "customer_name": payload.customer_name,
            "customer_email": payload.customer_email,
            "subject": payload.subject,
            "description": payload.description,
            "status": "open",
        }
        res = client.table("tickets").insert(insert_data).execute()
        if not res.data:
            logger.error("Insert returned empty data")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record ticket in database",
            )

        row = res.data[0]
        ticket_id = format_ticket_id(row["ticket_number"])
        return TicketCreateResponse(
            ticket_id=ticket_id,
            created_at=row["created_at"],
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Unexpected error creating ticket: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database failure while creating ticket",
        )


@router.get(
    "",
    response_model=List[TicketSummaryResponse],
    summary="List ticket summaries with optional filtering and search",
)
def list_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    client: Client = Depends(get_supabase_client),
) -> List[TicketSummaryResponse]:
    """Return ticket summaries matching filter and search criteria."""
    try:
        query = client.table("tickets").select("*")

        # Status filter validation
        if status_filter:
            clean_status = status_filter.strip().lower()
            if clean_status not in ALLOWED_STATUSES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status filter. Allowed values: {', '.join(ALLOWED_STATUSES)}",
                )
            query = query.eq("status", clean_status)

        # Search across ticket_number, customer_name, customer_email, subject, description
        if search and search.strip():
            term = search.strip()
            conditions: List[str] = []

            # Check if query matches a ticket number (e.g. 'TKT-001' or '42')
            parsed_num = parse_ticket_id(term)
            if parsed_num is not None:
                conditions.append(f"ticket_number.eq.{parsed_num}")

            # Clean search text for PostgREST ilike pattern
            clean_term = "".join(c for c in term if c.isalnum() or c in " .-_@")
            if clean_term:
                conditions.append(f"customer_name.ilike.%{clean_term}%")
                conditions.append(f"customer_email.ilike.%{clean_term}%")
                conditions.append(f"subject.ilike.%{clean_term}%")
                conditions.append(f"description.ilike.%{clean_term}%")

            if conditions:
                query = query.or_(",".join(conditions))

        # Default ordering: newest first
        query = query.order("created_at", desc=True)
        res = query.execute()

        results: List[TicketSummaryResponse] = []
        for row in res.data or []:
            confidence = (
                float(row["ai_confidence"])
                if row.get("ai_confidence") is not None
                else None
            )
            results.append(
                TicketSummaryResponse(
                    ticket_id=format_ticket_id(row["ticket_number"]),
                    customer_name=row["customer_name"],
                    customer_email=row["customer_email"],
                    subject=row["subject"],
                    status=row["status"],
                    priority=row.get("priority"),
                    category=row.get("category"),
                    ai_summary=row.get("ai_summary"),
                    ai_confidence=confidence,
                    created_at=row["created_at"],
                    updated_at=row.get("updated_at"),
                )
            )

        return results
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Unexpected error listing tickets: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database failure while retrieving tickets",
        )


@router.get(
    "/{ticket_id}",
    response_model=TicketDetailResponse,
    summary="Get single ticket details with notes",
)
def get_ticket(
    ticket_id: str,
    client: Client = Depends(get_supabase_client),
) -> TicketDetailResponse:
    """Retrieve ticket details and associated notes by public ticket ID (e.g. TKT-001)."""
    try:
        parsed_num = parse_ticket_id(ticket_id)
        if parsed_num is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticket '{ticket_id}' not found",
            )

        res = (
            client.table("tickets")
            .select("*")
            .eq("ticket_number", parsed_num)
            .execute()
        )
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticket '{ticket_id}' not found",
            )

        ticket = res.data[0]
        ticket_uuid = ticket["id"]

        # Retrieve internal notes in chronological order (oldest first)
        notes_res = (
            client.table("ticket_notes")
            .select("*")
            .eq("ticket_id", ticket_uuid)
            .order("created_at", desc=False)
            .execute()
        )

        notes = [
            TicketNoteResponse(
                id=str(n["id"]),
                note=n["note"],
                author=n.get("author", "agent"),
                created_at=n["created_at"],
            )
            for n in (notes_res.data or [])
        ]

        confidence = (
            float(ticket["ai_confidence"])
            if ticket.get("ai_confidence") is not None
            else None
        )

        return TicketDetailResponse(
            ticket_id=format_ticket_id(ticket["ticket_number"]),
            customer_name=ticket["customer_name"],
            customer_email=ticket["customer_email"],
            subject=ticket["subject"],
            description=ticket["description"],
            status=ticket["status"],
            priority=ticket.get("priority"),
            category=ticket.get("category"),
            ai_summary=ticket.get("ai_summary"),
            ai_suggested_response=ticket.get("ai_suggested_response"),
            ai_confidence=confidence,
            created_at=ticket["created_at"],
            updated_at=ticket.get("updated_at"),
            notes=notes,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Unexpected error getting ticket %s: %s", ticket_id, str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database failure while retrieving ticket details",
        )


@router.put(
    "/{ticket_id}",
    response_model=TicketUpdateResponse,
    summary="Update ticket status and append optional note",
)
def update_ticket(
    ticket_id: str,
    payload: TicketUpdateRequest,
    client: Client = Depends(get_supabase_client),
) -> TicketUpdateResponse:
    """Update ticket operational status and optionally append an internal activity note."""
    try:
        parsed_num = parse_ticket_id(ticket_id)
        if parsed_num is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticket '{ticket_id}' not found",
            )

        # Confirm ticket exists
        res = (
            client.table("tickets")
            .select("*")
            .eq("ticket_number", parsed_num)
            .execute()
        )
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticket '{ticket_id}' not found",
            )

        ticket = res.data[0]
        ticket_uuid = ticket["id"]

        # Update status on tickets table
        update_res = (
            client.table("tickets")
            .update({"status": payload.status})
            .eq("id", ticket_uuid)
            .execute()
        )

        updated_at = None
        if update_res.data:
            updated_at = update_res.data[0].get("updated_at")

        if not updated_at:
            updated_at = datetime.now(timezone.utc).isoformat()

        # If a non-empty note is provided, append to ticket_notes table
        if payload.notes and payload.notes.strip():
            client.table("ticket_notes").insert(
                {
                    "ticket_id": ticket_uuid,
                    "note": payload.notes.strip(),
                    "author": "agent",
                }
            ).execute()

        return TicketUpdateResponse(
            success=True,
            updated_at=updated_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Unexpected error updating ticket %s: %s", ticket_id, str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database failure while updating ticket",
        )
