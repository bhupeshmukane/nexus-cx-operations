-- NEXUS CX Operations
-- Database schema
-- PostgreSQL / Supabase

create extension if not exists "pgcrypto";

-- ============================================================
-- Tickets
-- ============================================================

create table if not exists public.tickets (
    id uuid primary key default gen_random_uuid(),

    -- Human-readable ticket identifier
    ticket_number bigint generated always as identity unique,

    -- Customer information
    customer_name text not null,
    customer_email text not null,

    -- Ticket content
    subject text not null,
    description text not null,

    -- Operational state
    status text not null default 'open'
        check (status in ('open', 'in_progress', 'closed')),

    -- AI-assisted triage
    priority text
        check (priority in ('low', 'medium', 'high', 'urgent')),

    category text,
    ai_summary text,
    ai_suggested_response text,
    ai_confidence numeric(5,4)
        check (ai_confidence is null or (ai_confidence >= 0 and ai_confidence <= 1)),

    -- Timestamps
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================
-- Ticket Notes
-- ============================================================

create table if not exists public.ticket_notes (
    id uuid primary key default gen_random_uuid(),

    ticket_id uuid not null
        references public.tickets(id)
        on delete cascade,

    note text not null,
    author text not null default 'agent',

    created_at timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists idx_tickets_status
    on public.tickets(status);

create index if not exists idx_tickets_created_at
    on public.tickets(created_at desc);

create index if not exists idx_tickets_customer_email
    on public.tickets(customer_email);

create index if not exists idx_ticket_notes_ticket_id
    on public.ticket_notes(ticket_id);

create index if not exists idx_ticket_notes_created_at
    on public.ticket_notes(created_at desc);

-- ============================================================
-- Updated-at trigger
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists tickets_set_updated_at on public.tickets;

create trigger tickets_set_updated_at
before update on public.tickets
for each row
execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.tickets enable row level security;
alter table public.ticket_notes enable row level security;