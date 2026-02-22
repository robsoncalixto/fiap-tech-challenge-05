# Implementation Plan: Report Chat Consultant

**Branch**: `006-report-chat-consultant` | **Date**: 2026-02-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-report-chat-consultant/spec.md`

## Summary

Add an interactive AI chat consultant to completed reports, accessible to Pro users via a collapsible side panel. The consultant uses Gemini Flash (via OpenRouter) with streaming responses, has full report context, and sends a proactive initial message. Chat history is persisted in Supabase (one chat per report). Shared reports display chat in read-only mode; Starter users see an upgrade prompt.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16.1.6, React 19.2.3
**Primary Dependencies**: `@supabase/ssr` 0.8.x, `@supabase/supabase-js` 2.95.x, `react-markdown` 10.x, `lucide-react` 0.563.x, `next-themes` 0.4.x
**Storage**: Supabase PostgreSQL (new tables: `chat_conversations`, `chat_messages`)
**Testing**: Playwright (E2E, existing setup)
**Target Platform**: Web (Vercel deployment)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Streaming response start < 2s, full response < 10s (SC-001)
**Constraints**: OpenRouter API (existing integration, add streaming support), Gemini Flash model (`google/gemini-2.5-flash`)
**Scale/Scope**: Same as existing report scale; sliding window of 20 messages per AI call

## Constitution Check

*No constitution file found — no gates to enforce.*

## Project Structure

### Documentation (this feature)

```text
specs/006-report-chat-consultant/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
arch-vision-app/
├── app/
│   ├── (private)/
│   │   └── report/[id]/
│   │       └── page.tsx                    # MODIFY: add ChatPanel to report layout
│   ├── api/
│   │   └── chat/
│   │       └── route.ts                    # NEW: streaming chat API endpoint
│   └── shared/[token]/
│       └── page.tsx                        # MODIFY: add read-only ChatHistory
├── components/
│   └── chat/
│       ├── chat-panel.tsx                  # NEW: collapsible side panel container
│       ├── chat-messages.tsx               # NEW: message list with bubbles
│       ├── chat-input.tsx                  # NEW: text input + send button
│       ├── chat-message-bubble.tsx         # NEW: individual message bubble
│       ├── chat-upgrade-prompt.tsx         # NEW: locked state for Starter users
│       └── chat-readonly-banner.tsx        # NEW: read-only indicator for shared
├── lib/
│   ├── openrouter.ts                       # MODIFY: add streaming variant
│   └── prompts/
│       └── consultant-prompt.ts            # NEW: consultant system prompt
└── app/
    └── actions/
        └── chat.ts                         # NEW: server actions for chat CRUD
```

**Structure Decision**: All new code follows the existing Next.js App Router conventions already established in the project. New components go under `components/chat/`, new API route under `app/api/chat/`, new server actions under `app/actions/chat.ts`. The OpenRouter client is extended (not replaced) to add streaming support.

## Complexity Tracking

No constitution violations to track.
