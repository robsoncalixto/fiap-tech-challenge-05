# Tasks: Report Chat Consultant

**Input**: Design documents from `/specs/006-report-chat-consultant/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. US1 and US2 are combined in a single phase since US2 (one-chat-per-report) is a database constraint enforced within US1's implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Database & Infrastructure)

**Purpose**: Create database tables, RLS policies, and indexes required by all user stories

- [x] T001 Apply Supabase migration to create `chat_conversations` table with UNIQUE(report_id) constraint, CASCADE delete, and RLS policies per `data-model.md` schema
- [x] T002 Apply Supabase migration to create `chat_messages` table with CHECK(role), CASCADE delete, composite index on (conversation_id, created_at ASC), and RLS policies per `data-model.md` schema

**Checkpoint**: Database schema ready — all tables, indexes, RLS policies, and constraints in place

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add `callOpenRouterStream()` function to `arch-vision-app/lib/openrouter.ts` that sends requests with `stream: true` and returns the raw `Response` object (body is a ReadableStream of SSE chunks). Keep existing `callOpenRouter()` unchanged.
- [x] T004 [P] Create consultant system prompt in `arch-vision-app/lib/prompts/consultant-prompt.ts` — export `buildConsultantSystemPrompt(reportMarkdown: string, severitySummary: object)` that returns a system message instructing the model to act as a senior security consultant, respond in PT-BR, and reference the report content. Also export `CONSULTANT_INIT_TRIGGER` constant with the proactive first message trigger instruction.
- [x] T005 [P] Create server actions in `arch-vision-app/app/actions/chat.ts` — implement `getConversation(reportId: string)` using server Supabase client (RLS) that returns `{ conversation, messages }`, and `getSharedConversation(reportId: string)` using admin client (bypasses RLS) with the same return shape. Follow the pattern in existing `arch-vision-app/app/actions/reports.ts`.

**Checkpoint**: Foundation ready — streaming client, prompt builder, and data access layer available for user stories

---

## Phase 3: User Story 1 + 2 — Premium User Chats with Report Consultant & One Chat Per Report (Priority: P1) MVP

**Goal**: Pro users can interact with an AI consultant on completed reports via a collapsible side panel. Each report has exactly one chat, auto-initialized with a proactive message. Responses are streamed.

**Independent Test**: As a Pro user, navigate to a completed report → see proactive initial message → send a message → receive streamed response → navigate away and back → see full history preserved. Revisit the same report and confirm only one chat thread exists.

### Implementation for User Story 1 + 2

- [x] T006 [US1] Create streaming chat API route in `arch-vision-app/app/api/chat/route.ts` — POST handler that: authenticates user, validates reportId + message (non-empty, max 5000 chars), verifies report ownership + completed status, verifies Pro tier, gets or creates conversation (upsert ON CONFLICT DO NOTHING), inserts user message, fetches last 20 messages, builds system prompt via `buildConsultantSystemPrompt()`, calls `callOpenRouterStream()` with `google/gemini-2.5-flash`, pipes SSE stream to client while accumulating tokens, inserts assistant message after stream completes. Return error responses per contracts (401, 403, 404, 400, 500). Set `runtime = 'nodejs'` and `maxDuration = 120`.
- [x] T007 [US1] Create chat init API route in `arch-vision-app/app/api/chat/init/route.ts` — POST handler that: authenticates user, validates reportId, verifies report ownership + completed status + Pro tier, checks if conversation already exists (return 409 if yes), creates conversation record, builds system prompt, sends `CONSULTANT_INIT_TRIGGER` as user message to OpenRouter (not persisted as user message), streams response, persists assistant message. Same SSE streaming pattern as T006.
- [x] T008 [P] [US1] Create `ChatMessageBubble` component in `arch-vision-app/components/chat/chat-message-bubble.tsx` — renders a single message with: role-based alignment (user right, assistant left), role-based background colors using existing design tokens (user: `--primary-light` bg, assistant: `--surface-secondary` bg), avatar indicator (user icon vs bot/shield icon from lucide-react), message content rendered with `react-markdown` for assistant messages (plain text for user), timestamp display. Support dark mode via existing CSS custom properties.
- [x] T009 [P] [US1] Create `ChatMessages` component in `arch-vision-app/components/chat/chat-messages.tsx` — scrollable message list that renders `ChatMessageBubble` for each message, auto-scrolls to bottom on new messages (FR-014), shows a typing/streaming indicator when `isStreaming` prop is true (animated dots using `--text-muted` color). Accept `messages` array and `isStreaming` boolean as props.
- [x] T010 [P] [US1] Create `ChatInput` component in `arch-vision-app/components/chat/chat-input.tsx` — text input area with send button (Send icon from lucide-react). Disable send button when input is empty (FR-013) or when `isLoading` prop is true. Submit on Enter key (Shift+Enter for newline). Use existing design tokens: `--surface` bg, `--border` border, `--primary` for send button, `--text` for input text. Accept `onSend(message: string)` callback and `isLoading` boolean props.
- [x] T011 [US1] Create `ChatPanel` component in `arch-vision-app/components/chat/chat-panel.tsx` — collapsible side panel container that: manages chat state (messages, isStreaming, error), loads existing conversation on mount via `getConversation()` server action, auto-initializes new conversation via `POST /api/chat/init` if no conversation exists (FR-001, FR-002), handles sending messages via `POST /api/chat` with SSE stream parsing (read stream, parse `data:` lines, extract `choices[0].delta.content`, append tokens to current assistant message, detect `[DONE]`), shows error message with retry button on AI failure (FR-012), uses `ChatMessages` and `ChatInput` sub-components. Panel header with "Consultor de Segurança" title and collapse toggle button (ChevronRight/ChevronLeft icon). Use `--surface` bg, `--border` for panel border, `--text` for title. Accept `reportId`, `reportMarkdown`, `severitySummary` props.
- [x] T012 [US1] Modify report page in `arch-vision-app/app/(private)/report/[id]/page.tsx` — update the completed report layout to include `ChatPanel` alongside the report content. Change the `max-w-5xl mx-auto` wrapper to a flex container on desktop (≥1024px): report content takes remaining space, `ChatPanel` takes ~400px fixed width on the right. On mobile (<1024px), stack vertically (report above, chat below). Pass `reportId`, `report.result_markdown`, and `report.severity_summary` as props to `ChatPanel`. Only render `ChatPanel` when `tier === 'pro'` and `report.status === 'completed'` (FR-011). Add collapse/expand state that adjusts layout width.

**Checkpoint**: At this point, Pro users can fully interact with the chat consultant on completed reports. One chat per report is enforced by DB constraint + upsert. Chat history persists across sessions.

---

## Phase 4: User Story 3 — Shared Report Shows Read-Only Chat (Priority: P2)

**Goal**: Shared report pages display existing chat history in read-only mode (no input, no interaction). If no chat exists, the chat section is hidden.

**Independent Test**: Share a report that has chat history → open the shared link → verify all messages are visible, no input field exists, and a read-only banner is shown. Share a report without chat → verify chat section is absent.

### Implementation for User Story 3

- [x] T013 [P] [US3] Create `ChatReadonlyBanner` component in `arch-vision-app/components/chat/chat-readonly-banner.tsx` — a small banner displayed at the top of the read-only chat area with a lock icon (Lock from lucide-react) and text "Este chat é somente leitura" using `--text-muted` color and `--surface-tertiary` background.
- [x] T014 [US3] Modify shared report page in `arch-vision-app/app/shared/[token]/page.tsx` — after fetching the report, call `getSharedConversation(report.id)` to check for chat history. If messages exist, render a read-only chat section below the report content: show `ChatReadonlyBanner` at the top, then `ChatMessages` with the messages array (no streaming indicator). Do NOT render `ChatInput`. If no conversation or no messages exist, do not render any chat section (FR-009). Use the same `ChatMessages` and `ChatMessageBubble` components from US1 (they are presentation-only and work in read-only context).

**Checkpoint**: Shared reports with chat history display all messages in read-only mode. Reports without chat show no chat section.

---

## Phase 5: User Story 4 — Starter Users See Chat Upgrade Prompt (Priority: P2)

**Goal**: Starter (free) users see a locked chat area with an upgrade prompt instead of the interactive chat.

**Independent Test**: As a Starter user, navigate to a completed report → verify a locked chat panel appears with an upgrade message and a link to `/upgrade`.

### Implementation for User Story 4

- [x] T015 [P] [US4] Create `ChatUpgradePrompt` component in `arch-vision-app/components/chat/chat-upgrade-prompt.tsx` — a styled card matching the chat panel dimensions, showing: a lock icon (Lock from lucide-react), title "Consultor de Segurança" with a "Pro" badge, description text explaining the feature ("Interaja com um consultor de segurança especializado para explorar os achados do seu relatório em profundidade."), and a CTA button linking to `/upgrade` ("Fazer upgrade para Pro"). Use `--surface-secondary` bg, `--border` border, `--primary` for the CTA button. Match the visual style of existing upgrade prompts in the app.
- [x] T016 [US4] Modify report page in `arch-vision-app/app/(private)/report/[id]/page.tsx` — update the conditional rendering: when `tier !== 'pro'` and report is completed, render `ChatUpgradePrompt` in place of `ChatPanel` (same position in the layout — right side panel on desktop, below on mobile). This replaces the current logic that only renders `ChatPanel` for Pro users (from T012).

**Checkpoint**: Starter users see the upgrade prompt. Pro users see the interactive chat. Both in the same layout position.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge case handling, UX refinements, and validation across all stories

- [x] T017 Add error retry mechanism to `ChatPanel` in `arch-vision-app/components/chat/chat-panel.tsx` — when an AI error occurs, show an error message below the last user message with a "Tentar novamente" button that resends the last user message (FR-012). Use `--feedback-error` color for the error message.
- [x] T018 [P] Add message input validation to `ChatInput` in `arch-vision-app/components/chat/chat-input.tsx` — trim whitespace before checking empty state, enforce max length of 5000 characters with a character counter shown near the input, prevent rapid double-submission by disabling input during send.
- [x] T019 [P] Add chat panel collapse persistence in `ChatPanel` in `arch-vision-app/components/chat/chat-panel.tsx` — save collapse/expand state to localStorage so the user's preference persists across page navigations.
- [x] T020 Run quickstart.md validation — verify the full feature works end-to-end: Pro user chat with proactive message, message streaming, history persistence, shared read-only view, Starter upgrade prompt, and edge cases (error handling, empty messages, non-completed reports).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion (tables must exist for server actions)
- **US1+US2 (Phase 3)**: Depends on Phase 2 completion (streaming client, prompt, server actions)
- **US3 (Phase 4)**: Depends on Phase 2 (server actions) + reuses UI components from Phase 3
- **US4 (Phase 5)**: Can start after Phase 3 (modifies report page layout from T012)
- **Polish (Phase 6)**: Depends on Phases 3-5 being complete

### User Story Dependencies

- **US1+US2 (P1)**: Can start after Foundational (Phase 2) — no dependencies on other stories
- **US3 (P2)**: Reuses `ChatMessages` and `ChatMessageBubble` from US1 — can start after Phase 3 T008/T009 are complete, or in parallel if components are simple enough
- **US4 (P2)**: Modifies report page from US1 (T012) — should start after Phase 3

### Within Each User Story

- Models/data before services
- API routes before UI components that consume them
- Container components after presentational components
- Page integration as the final step per story

### Parallel Opportunities

- T001 and T002 (DB migrations) should run sequentially (T002 depends on T001 for FK)
- T003, T004, T005 (foundational) can all run in parallel after Phase 1
- T008, T009, T010 (presentational UI components) can all run in parallel
- T013 and T015 (read-only banner and upgrade prompt) can run in parallel
- T017, T018, T019 (polish tasks) can all run in parallel

---

## Parallel Example: User Story 1

```bash
# After Phase 2 completes, launch all presentational components in parallel:
Task: T008 "Create ChatMessageBubble in arch-vision-app/components/chat/chat-message-bubble.tsx"
Task: T009 "Create ChatMessages in arch-vision-app/components/chat/chat-messages.tsx"
Task: T010 "Create ChatInput in arch-vision-app/components/chat/chat-input.tsx"

# Then build container + API routes (T006, T007 can parallel with above if no type deps):
Task: T006 "Create streaming chat API route in arch-vision-app/app/api/chat/route.ts"
Task: T007 "Create chat init API route in arch-vision-app/app/api/chat/init/route.ts"

# Finally, integrate into report page:
Task: T011 "Create ChatPanel container in arch-vision-app/components/chat/chat-panel.tsx"
Task: T012 "Modify report page to include ChatPanel"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (DB migrations)
2. Complete Phase 2: Foundational (streaming, prompt, server actions)
3. Complete Phase 3: US1+US2 (chat API + UI + report page integration)
4. **STOP and VALIDATE**: Test as Pro user — send messages, verify streaming, check history persistence, confirm one-chat-per-report
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1+US2 → Test independently → Deploy/Demo (MVP!)
3. Add US3 (shared read-only) → Test independently → Deploy/Demo
4. Add US4 (upgrade prompt) → Test independently → Deploy/Demo
5. Polish phase → Final validation → Deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1+US2 (core chat)
   - Developer B: US4 (upgrade prompt — can start on T015 immediately, T016 after T012)
3. After US1 components exist:
   - Developer B: US3 (shared read-only — reuses components)
4. Polish phase after all stories complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 and US2 are combined because US2's constraint (one chat per report) is implemented via DB UNIQUE constraint and upsert logic within US1's tasks
- No new npm dependencies required — all functionality uses existing packages + native Web Streams API
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
