# Data Model: Report Chat Consultant

**Date**: 2026-02-21 | **Feature**: 006-report-chat-consultant

## Entities

### chat_conversations

Represents a single chat thread associated with a report. One-to-one relationship with `reports`.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default `gen_random_uuid()` | Unique conversation identifier |
| report_id | uuid | FK → reports.id, UNIQUE, NOT NULL, ON DELETE CASCADE | The report this chat belongs to |
| created_at | timestamptz | NOT NULL, default `now()` | When the conversation was created |

**Indexes**:
- `UNIQUE(report_id)` — enforces one chat per report (FR-001)
- Primary key on `id`

**RLS Policies**:
- `SELECT`: Users can read conversations for reports they own (`report_id IN (SELECT id FROM reports WHERE user_id = auth.uid())`)
- `INSERT`: Users can create conversations for their own reports (same condition)
- No `UPDATE` or `DELETE` policies — conversations are immutable once created (deleted only via CASCADE when report is deleted)

---

### chat_messages

Individual messages within a conversation.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default `gen_random_uuid()` | Unique message identifier |
| conversation_id | uuid | FK → chat_conversations.id, NOT NULL, ON DELETE CASCADE | Parent conversation |
| role | text | NOT NULL, CHECK (role IN ('user', 'assistant')) | Message sender |
| content | text | NOT NULL | Message text content |
| created_at | timestamptz | NOT NULL, default `now()` | When the message was sent |

**Indexes**:
- Primary key on `id`
- `INDEX(conversation_id, created_at ASC)` — efficient ordered retrieval of messages per conversation

**RLS Policies**:
- `SELECT`: Users can read messages for conversations they can access (`conversation_id IN (SELECT id FROM chat_conversations WHERE report_id IN (SELECT id FROM reports WHERE user_id = auth.uid()))`)
- `INSERT`: Users can insert messages into their own conversations (same join condition)
- No `UPDATE` or `DELETE` policies — messages are append-only (deleted only via CASCADE)

---

## Existing Entity Changes

### reports (no schema changes)

No modifications needed to the `reports` table. The relationship is established via `chat_conversations.report_id → reports.id`.

---

## State Transitions

### Conversation Lifecycle

```
[No conversation exists]
        │
        ▼  (Pro user opens completed report for first time)
  [Created] ──── proactive initial message generated
        │
        ▼  (user sends messages)
  [Active] ──── messages appended, no state change
        │
        ▼  (report deleted)
  [Deleted] ──── CASCADE deletes conversation + all messages
```

### Message States

Messages are immutable once created. No state transitions — they are append-only.

---

## Access Patterns

| Query | Context | Method |
|-------|---------|--------|
| Get conversation by report_id | Report page load (authenticated) | Browser Supabase client (RLS) |
| Get messages by conversation_id (ordered by created_at ASC) | Report page load / chat display | Browser Supabase client (RLS) |
| Insert conversation | First report visit by Pro user | Server action (server client) |
| Insert user message | User sends a chat message | API route (server client) |
| Insert assistant message | After streaming completes | API route (admin client) |
| Get conversation + messages by report_id (for shared view) | Shared report page | Admin client (bypasses RLS) |
| Get last 20 messages by conversation_id | Building AI context window | API route (server client) |

---

## Data Volume Assumptions

- Average messages per conversation: 10-30
- Maximum messages per conversation: unlimited (but only last 20 sent to AI)
- Storage per message: ~500 bytes average (content + metadata)
- Growth rate: proportional to Pro user report creation rate
