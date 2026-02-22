# Quickstart: Report Chat Consultant

**Date**: 2026-02-21 | **Feature**: 006-report-chat-consultant

## Prerequisites

- Existing development environment for arch-vision-app (Node.js 18+, npm)
- Supabase project with existing `reports` and `users` tables
- `OPENROUTER_API_KEY` environment variable configured
- A Pro-tier user account with at least one completed report

## Setup Steps

### 1. Database Migration

Apply the migration to create `chat_conversations` and `chat_messages` tables:

```sql
-- Create chat_conversations table
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chat_conversations_report_id_key UNIQUE (report_id)
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient message retrieval
CREATE INDEX idx_chat_messages_conversation_created
  ON public.chat_messages(conversation_id, created_at ASC);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_conversations
CREATE POLICY "Users can view own conversations" ON public.chat_conversations
  FOR SELECT USING (
    report_id IN (SELECT id FROM public.reports WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create own conversations" ON public.chat_conversations
  FOR INSERT WITH CHECK (
    report_id IN (SELECT id FROM public.reports WHERE user_id = auth.uid())
  );

-- RLS policies for chat_messages
CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT cc.id FROM public.chat_conversations cc
      JOIN public.reports r ON cc.report_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT cc.id FROM public.chat_conversations cc
      JOIN public.reports r ON cc.report_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );
```

### 2. No New Dependencies

This feature uses only existing project dependencies:
- `@supabase/ssr` + `@supabase/supabase-js` — database access
- `react-markdown` — rendering markdown in assistant messages
- `lucide-react` — icons (Send, MessageSquare, ChevronRight, Lock, etc.)
- Native Web Streams API — streaming responses (no new packages)

### 3. Environment Variables

No new environment variables required. The feature uses the existing:
- `OPENROUTER_API_KEY` — for AI model calls
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — browser client
- `SUPABASE_SERVICE_ROLE_KEY` — admin client (for persisting assistant messages)

### 4. Verification

After implementation, verify the feature works:

1. **As Pro user**: Navigate to a completed report → see chat panel with proactive message → send a message → receive streamed response → navigate away and back → see full history
2. **As Starter user**: Navigate to a completed report → see locked chat with upgrade prompt
3. **Shared report**: Share a report that has chat history → open shared link → see read-only chat messages with no input

## Key Architecture Decisions

- **Streaming via Route Handler**: `POST /api/chat` returns `text/event-stream` responses using native `ReadableStream`
- **One chat per report**: Enforced by `UNIQUE(report_id)` constraint + upsert pattern
- **Context window**: System prompt includes full report markdown + last 20 messages
- **No new dependencies**: Streaming uses native Web Streams API; no Vercel AI SDK needed
- **RLS for security**: Chat data protected by Supabase Row Level Security, admin client used only for shared views and persisting assistant messages
