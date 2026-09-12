import { TicketWithNotes } from '../../types/ticket';

export const INITIAL_TICKETS: TicketWithNotes[] = [
  {
    id: 'b1e06c74-5c91-4e78-90f7-111111111111',
    ticket_number: 1042,
    customer_name: 'Elena Rostova',
    customer_email: 'elena.rostova@cloudscale-tech.io',
    subject: 'SAML SSO Assertion failure following Okta metadata rotation',
    description: `We rotated our Okta SAML signing certificates today at 09:00 UTC per our quarterly security policy. 
Since then, all 350 engineers in our organization are unable to log into the NEXUS developer portal and are encountering the following error:
"InvalidSignature: The response was not signed with a valid signature key (Status 401)".

We already updated the ACS URL and entity ID in our IDP dashboard. Our production deployment is blocked until this is resolved. Urgent assistance required.`,
    status: 'open',
    priority: 'urgent',
    category: 'Authentication & SSO',
    ai_summary: 'Enterprise SSO outage affecting 350 users due to Okta SAML certificate rotation mismatch. Blocked engineers experiencing 401 InvalidSignature errors.',
    ai_suggested_response: `Hello Elena,

Thank you for contacting NEXUS Enterprise Support. We understand this is critically blocking your engineering team following your certificate rotation.

When rotating Okta signing certificates, our SAML assertion consumer requires an explicit cache flush or a re-import of your updated identity provider metadata XML.

Could you please confirm if you have uploaded the updated public certificate to your NEXUS Console under Organization Settings > SSO & Security > Identity Provider Metadata? If you have already done so, please reply with your IdP Entity ID, and our engineering team will manually invalidate the cached signature verification keys on your tenant.

We are actively standing by to resolve this for you.`,
    ai_confidence: 0.9650,
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18m ago
    updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    notes: [
      {
        id: 'note-001',
        ticket_id: 'b1e06c74-5c91-4e78-90f7-111111111111',
        note: 'Escalated to Tier 3 Identity team on duty. Investigating tenant IDP cert cache.',
        author: 'Marcus Vance (Lead Triage)',
        created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      },
      {
        id: 'note-002',
        ticket_id: 'b1e06c74-5c91-4e78-90f7-111111111111',
        note: 'Customer tenant config inspected: cert thumbprint matches old Okta cert dated 2025.',
        author: 'Marcus Vance (Lead Triage)',
        created_at: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
      },
    ],
  },
  {
    id: 'c2f17d85-6d02-4f89-81a8-222222222222',
    ticket_number: 1041,
    customer_name: 'David Chen',
    customer_email: 'd.chen@apexfintech.com',
    subject: 'Webhook delivery failures on invoice.payment_succeeded events',
    description: `We are noticing a significant drop in incoming webhooks for invoice.payment_succeeded.
Looking at our ingress logs, between 04:00 and 06:30 UTC today, roughly 42% of events failed with 504 Gateway Timeout or were dropped after 3 retry attempts.

Is there any known incident on the event dispatch workers? We need transaction confirmation events backfilled.`,
    status: 'in_progress',
    priority: 'high',
    category: 'Webhooks & Events',
    ai_summary: 'Webhook delivery degradation for payment success events between 04:00-06:30 UTC. Customer reports 42% failure rate and requests automated event backfill.',
    ai_suggested_response: `Hi David,

Thank you for reporting this. We identified a transient network latency spike on our outbound webhook gateway between 04:15 and 06:10 UTC today, which affected concurrent HTTP/2 connections to certain external endpoints.

The issue has now been stabilized. We can initiate an automated replay of all failed webhook events for your tenant across the affected window. Please confirm if your endpoint is ready to receive replay batches with Idempotency-Key headers enabled.`,
    ai_confidence: 0.9120,
    created_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(), // 1h 15m ago
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    notes: [
      {
        id: 'note-003',
        ticket_id: 'c2f17d85-6d02-4f89-81a8-222222222222',
        note: 'Verified with Infra team: Webhook egress worker pool autoscaled during AWS us-east-1 route flap. Stable now.',
        author: 'Sarah Jenkins (DevOps)',
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
  },
  {
    id: 'd3a28e96-7e13-4a90-92b9-333333333333',
    ticket_number: 1040,
    customer_name: 'Aisha Al-Mansoor',
    customer_email: 'aisha@zenithlogistics.ae',
    subject: 'Monthly invoice billing discrepancy: duplicate compute seat charges',
    description: `Our February invoice (#INV-2026-0881) shows 75 active seat licenses billed at $120/seat, but our active directory sync only has 50 users provisioned throughout February.
It appears 25 archived accounts from January were not prorated and were billed in full. Please review and issue an adjusted credit memo.`,
    status: 'open',
    priority: 'medium',
    category: 'Billing & Licensing',
    ai_summary: 'Invoice discrepancy of 25 duplicate/unprorated seat charges on INV-2026-0881. Customer requests audit of archived seats and credit memo adjustment.',
    ai_suggested_response: `Dear Aisha,

Thank you for bringing this to our attention. We have initiated an audit of your license allocations for February.

Our billing system calculates billable seats on the monthly anchor date. We will check the de-provisioning timestamps of the 25 archived accounts to verify proration eligibility. If verified, we will issue a credit note for $3,000 against your pending balance within 2 business days.`,
    ai_confidence: 0.8840,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3h ago
    updated_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    notes: [],
  },
  {
    id: 'e4b39f07-8f24-4b01-a3ca-444444444444',
    ticket_number: 1039,
    customer_name: 'Liam Gallagher',
    customer_email: 'liam@manchester-retail.co.uk',
    subject: 'Custom domain SSL certificate renewal stuck in pending state',
    description: `We updated our DNS CNAME records for shop.ourdomain.com 48 hours ago to point to the NEXUS edge cluster.
However, in the domain manager the status is still showing "Issuing Let's Encrypt Certificate". Visitors are receiving an expired certificate warning in Chrome.`,
    status: 'in_progress',
    priority: 'high',
    category: 'Infrastructure & DNS',
    ai_summary: 'SSL certificate issuance stuck for custom domain shop.ourdomain.com 48 hours after CNAME delegation. End users experiencing browser security warnings.',
    ai_suggested_response: `Hello Liam,

Thank you for reaching out. We investigated your DNS propagation for shop.ourdomain.com.

We noticed that an existing CAA (Certificate Authority Authorization) record at your root domain restricts issuing CAs and does not include 'letsencrypt.org'. Please add the CAA record: 'ourdomain.com CAA 0 issue "letsencrypt.org"', or reconfigure the domain to use our DigiCert wildcard provider. Once updated, certificate issuance will complete within 15 minutes.`,
    ai_confidence: 0.9410,
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6h ago
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    notes: [
      {
        id: 'note-004',
        ticket_id: 'e4b39f07-8f24-4b01-a3ca-444444444444',
        note: 'DNS CAA check confirmed: dig shop.ourdomain.com shows missing letsencrypt.org CAA tag.',
        author: 'Alex Thorne (Support Engineer)',
        created_at: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
      },
    ],
  },
  {
    id: 'f5c40a18-9a35-4c12-b4db-555555555555',
    ticket_number: 1038,
    customer_name: 'Sophia Martinez',
    customer_email: 'smartinez@nexus-health.org',
    subject: 'HIPAA BAA execution request for Enterprise compliance tier',
    description: `We are upgrading our organization workspace to the Enterprise Tier and require an executed Business Associate Agreement (BAA) with your legal entity before transmitting PHI data through the API endpoints.
Please provide your standard BAA template and instructions for countersigning.`,
    status: 'closed',
    priority: 'low',
    category: 'Legal & Compliance',
    ai_summary: 'Request for standard HIPAA BAA agreement execution for upcoming Enterprise Tier deployment. Customer needs countersigning instructions.',
    ai_suggested_response: `Hi Sophia,

We have generated your customized HIPAA Business Associate Agreement through our DocuSign compliance portal. A signature request has been dispatched to your email. Once countersigned, your workspace compliance flags will automatically unlock in the operations dashboard.`,
    ai_confidence: 0.9780,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26h ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    notes: [
      {
        id: 'note-005',
        ticket_id: 'f5c40a18-9a35-4c12-b4db-555555555555',
        note: 'DocuSign envelope sent and completed by customer legal team. Ticket marked closed.',
        author: 'Rachel Lin (Compliance Lead)',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      },
    ],
  },
  {
    id: 'a6d51b29-0b46-4d23-c5ec-666666666666',
    ticket_number: 1037,
    customer_name: 'Hiroshi Tanaka',
    customer_email: 'tanaka.h@tokyo-robotics.jp',
    subject: 'High latency and intermittent 502s from AP-Northeast edge nodes',
    description: `Our IoT telemetry gateway reporting into NEXUS ap-northeast-1 ingestion endpoint is reporting round-trip latency spiking from standard 28ms to >850ms, with intermittent 502 Bad Gateway responses during high-throughput batches (15,000 req/min).
Is traffic being rerouted?`,
    status: 'open',
    priority: 'high',
    category: 'Performance & Network',
    ai_summary: 'Telemetry gateway reporting 850ms latency spikes and 502 errors on ap-northeast-1 edge during 15k req/min load.',
    ai_suggested_response: `Hello Tanaka-san,

Thank you for reporting this issue. We are reviewing routing metrics for the Tokyo edge cluster. Our telemetry indicates an upstream transit fiber degradation between Tokyo and Osaka. We are adjusting BGP peering to route through our redundant Hong Kong POP while local line maintenance completes.`,
    ai_confidence: 0.9250,
    created_at: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 400).toISOString(),
    notes: [],
  },
  {
    id: 'b7e62c30-1c57-4e34-d6fd-777777777777',
    ticket_number: 1036,
    customer_name: 'Claire Beauchamp',
    customer_email: 'c.beauchamp@veritas-biotech.fr',
    subject: 'Role-based access control: custom role unable to export audit logs',
    description: `We created a custom role called "External Auditor" with read permissions on Audit Logs.
However, when users with this role click "Download CSV", they receive a 403 Forbidden alert. Full Admin accounts can export without issue.`,
    status: 'closed',
    priority: 'medium',
    category: 'Access Control',
    ai_summary: 'Custom role "External Auditor" receiving 403 Forbidden when exporting audit logs despite read permissions.',
    ai_suggested_response: `Bonjour Claire,

This was caused by a granular permission flag: audit log export requires the 'audit.logs:export' permission in addition to 'audit.logs:read'. We updated your custom role permissions and verified that users can now download the CSV files successfully.`,
    ai_confidence: 0.9530,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    notes: [
      {
        id: 'note-006',
        ticket_id: 'b7e62c30-1c57-4e34-d6fd-777777777777',
        note: 'Added audit.logs:export permission scope to tenant role definition. Customer verified.',
        author: 'Alex Thorne (Support Engineer)',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ],
  },
];
