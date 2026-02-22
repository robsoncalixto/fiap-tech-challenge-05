# API Contracts: Chat Consultant

**Date**: 2026-02-21 | **Feature**: 006-report-chat-consultant

## POST /api/chat

Send a message to the consultant and receive a streamed response.

### Request

**Headers**:
- `Content-Type: application/json`
- `Cookie: sb-*` (Supabase auth session cookies — handled automatically by browser)

**Body**:
```json
{
  "reportId": "uuid",
  "message": "string (user's question, 1-5000 chars)"
}
```

### Response (Success — 200)

**Headers**:
- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`

**Body**: Server-Sent Events stream (OpenAI-compatible format)

```
data: {"choices":[{"delta":{"content":"Token "}}]}

data: {"choices":[{"delta":{"content":"by "}}]}

data: {"choices":[{"delta":{"content":"token."}}]}

data: [DONE]
```

Each `data:` line contains a JSON object with the incremental token in `choices[0].delta.content`. The stream ends with `data: [DONE]`.

### Response (Error Cases)

**401 Unauthorized** — No valid session
```json
{ "error": "Não autorizado" }
```

**403 Forbidden** — User is not Pro tier
```json
{ "error": "Recurso disponível apenas para usuários Pro" }
```

**404 Not Found** — Report not found or not owned by user
```json
{ "error": "Relatório não encontrado" }
```

**400 Bad Request** — Report not completed or empty message
```json
{ "error": "Relatório ainda não foi concluído" }
```
```json
{ "error": "Mensagem não pode ser vazia" }
```

**500 Internal Server Error** — OpenRouter API failure
```json
{ "error": "Erro ao gerar resposta do consultor. Tente novamente." }
```

### Processing Flow

1. Authenticate user (Supabase session from cookies)
2. Validate request body (`reportId` required, `message` required and non-empty)
3. Fetch report — verify ownership and `status === 'completed'`
4. Fetch user tier — verify `tier === 'pro'`
5. Get or create `chat_conversations` record for this report (upsert with `ON CONFLICT(report_id) DO NOTHING`)
6. Insert user message into `chat_messages`
7. Fetch last 20 messages from conversation (ordered by `created_at ASC`)
8. Build system prompt with report context (result_markdown + severity_summary)
9. Call OpenRouter with streaming (`google/gemini-2.5-flash`, `stream: true`)
10. Pipe stream to client, accumulating tokens
11. After stream completes, insert assistant message into `chat_messages`
12. Return streamed response

---

## POST /api/chat/init

Initialize a chat conversation with the proactive first message. Called once when a Pro user first views a completed report that has no existing conversation.

### Request

**Headers**: Same as above (auth cookies)

**Body**:
```json
{
  "reportId": "uuid"
}
```

### Response

Same streaming SSE format as `POST /api/chat`.

### Processing Flow

1. Authenticate user, validate report ownership and completion status
2. Verify user is Pro tier
3. Check if conversation already exists for this report — if yes, return 409
4. Create `chat_conversations` record
5. Build system prompt with report context
6. Send trigger instruction: "Apresente-se como consultor de segurança e faça um resumo proativo dos principais achados deste relatório, sugerindo áreas para explorar."
7. Stream response to client, accumulate tokens
8. Insert assistant message into `chat_messages` with role `'assistant'`
9. Return streamed response

### Response (Error — 409 Conflict)

```json
{ "error": "Conversa já existe para este relatório" }
```

---

## Server Actions: `app/actions/chat.ts`

### `getConversation(reportId: string)`

Returns the conversation and messages for a report (if exists).

**Returns**:
```typescript
{
  conversation: {
    id: string
    report_id: string
    created_at: string
  } | null
  messages: {
    id: string
    role: 'user' | 'assistant'
    content: string
    created_at: string
  }[]
}
```

**Auth**: Server client (RLS enforced — user can only access own report conversations).

### `getSharedConversation(reportId: string)`

Returns conversation and messages for a shared report view.

**Returns**: Same shape as `getConversation`.

**Auth**: Admin client (bypasses RLS for public shared access). Called from the shared report server component.
