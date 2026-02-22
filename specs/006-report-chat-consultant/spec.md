# Feature Specification: Report Chat Consultant

**Feature Branch**: `006-report-chat-consultant`
**Created**: 2026-02-21
**Status**: Draft
**Input**: User description: "criar um consultor via chat para os relatórios criados. Quando um relatório for criado, os usuários premium poderá interagir com o resultado do relatório através de um chat com o consultor, esse consultor deve ser proativo. O chat deve ser parecido com os chats de llms, apenas um chat por relatório deve ser criado. Quando o relatório for compartilhado o chat deve ser enviado como readonly sem a possibilidade de interagir. O modelo usado para o chat deve ser gemini flash. Mantenha o layout e as cores no chat."

## Clarifications

### Session 2026-02-21

- Q: Where should the chat interface appear relative to the report content? → A: Collapsible side panel on the right (side-by-side on desktop, stacked on mobile).
- Q: How should conversation history be managed when sending to the AI model? → A: Sliding window of the last 20 messages plus the report context.
- Q: How should consultant responses be delivered to the user? → A: Streaming (tokens appear progressively as the model generates them).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Premium User Chats with Report Consultant (Priority: P1)

After a report analysis is completed, a premium (Pro) user sees a chat interface in a collapsible side panel to the right of the report. On desktop, the report and chat are displayed side by side; on mobile, the chat stacks below the report. The consultant proactively sends an initial message summarizing key findings and offering to dive deeper into any area. The user can then ask questions about the STRIDE analysis, request clarifications on vulnerabilities, or explore recommendations in more detail. The chat uses the same visual design as the rest of the application (colors, fonts, spacing) and resembles a modern LLM chat interface with message bubbles, user/assistant avatars, and a text input area.

**Why this priority**: This is the core feature — without the chat interaction, the feature has no value. Premium users get deeper engagement with their security analysis, increasing the value proposition of the Pro tier.

**Independent Test**: Can be fully tested by creating a completed report as a Pro user and sending messages to the consultant. Delivers immediate value by enabling interactive exploration of security findings.

**Acceptance Scenarios**:

1. **Given** a Pro user has a completed report, **When** they navigate to the report page, **Then** a chat panel is visible with a proactive initial message from the consultant summarizing key findings and suggesting areas to explore.
2. **Given** a Pro user is viewing the chat, **When** they type a message and submit it, **Then** the consultant responds contextually based on the report content.
3. **Given** a Pro user sends a message, **When** the response is being generated, **Then** a typing/loading indicator is shown and the response streams or appears progressively.
4. **Given** a Pro user has an ongoing chat, **When** they navigate away and return to the same report, **Then** the full chat history is preserved and displayed.

---

### User Story 2 - One Chat Per Report (Priority: P1)

Each report has exactly one associated chat conversation. When a premium user first opens a completed report, a new chat is automatically created (if one does not yet exist) with the consultant's proactive opening message. Subsequent visits to the same report always show the same chat thread.

**Why this priority**: This is a foundational constraint of the feature — it ensures conversation continuity and prevents confusion from multiple chat threads per report.

**Independent Test**: Can be tested by visiting a report page multiple times and verifying only one chat thread exists with a persistent history.

**Acceptance Scenarios**:

1. **Given** a Pro user opens a completed report for the first time, **When** the page loads, **Then** a new chat is created with a proactive initial message from the consultant.
2. **Given** a Pro user has already chatted on a report, **When** they return to the report, **Then** the existing chat is displayed with the full message history.
3. **Given** a Pro user has a chat on a report, **When** they attempt to create a new chat for the same report, **Then** they are shown the existing chat (no duplicate chat creation).

---

### User Story 3 - Shared Report Shows Read-Only Chat (Priority: P2)

When a report is shared via a public link, the chat history (if any exists) is displayed alongside the report in a read-only mode. Visitors cannot send new messages or interact with the consultant. The chat input area is hidden or visually disabled, and a message indicates the chat is read-only.

**Why this priority**: Sharing is an existing feature. Including the chat history in the shared view adds value by showing the depth of analysis, but it's secondary to the core interactive chat experience.

**Independent Test**: Can be tested by sharing a report that has chat history and visiting the shared link. Verifying that messages are visible but no input is available.

**Acceptance Scenarios**:

1. **Given** a report with chat history is shared, **When** a visitor opens the shared link, **Then** the chat messages are displayed in read-only mode.
2. **Given** a visitor is viewing a shared report chat, **When** they look at the chat area, **Then** there is no text input, no send button, and a clear indication that the chat is read-only.
3. **Given** a report without any chat history is shared, **When** a visitor opens the shared link, **Then** the chat section is not displayed.

---

### User Story 4 - Starter Users See Chat Upgrade Prompt (Priority: P2)

Starter (free) users see the chat area on their completed reports, but it is locked behind an upgrade prompt. The prompt explains the chat consultant feature and directs users to the upgrade page. This serves as a conversion driver for the Pro plan.

**Why this priority**: Monetization is important for the product. Showing the feature as locked creates a clear upgrade incentive.

**Independent Test**: Can be tested by viewing a completed report as a Starter user and verifying the upgrade prompt appears instead of the chat interface.

**Acceptance Scenarios**:

1. **Given** a Starter user views a completed report, **When** the page loads, **Then** they see a locked chat area with an upgrade message and a link to the upgrade page.
2. **Given** a Starter user clicks the upgrade link, **When** they are redirected, **Then** they arrive at the upgrade/pricing page.

---

### Edge Cases

- What happens when the AI model (Gemini Flash) is unavailable or returns an error during a chat message? The system shows a user-friendly error message and allows the user to retry their last message.
- What happens when the report is still in `pending` or `processing` status? The chat area is not shown until the report is `completed`.
- What happens if the chat history becomes very long? The chat area scrolls, with the most recent messages visible at the bottom. Older messages are accessible by scrolling up.
- What happens if the user sends an empty message? The send button is disabled when the input is empty.
- What happens if a shared report's chat is very long? The shared read-only view shows the full chat history with the same scrolling behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create exactly one chat conversation per report, automatically initialized when a Pro user first views a completed report.
- **FR-002**: The consultant MUST send a proactive initial message when a chat is created, summarizing key findings from the report and suggesting areas to explore.
- **FR-003**: System MUST use the Gemini Flash model (via OpenRouter) for generating consultant responses.
- **FR-004**: The consultant MUST have access to the full report content (markdown analysis and severity summary) as context for all responses, plus a sliding window of the last 20 messages from the conversation history.
- **FR-005**: System MUST persist all chat messages (both user and consultant) so that conversation history is preserved across sessions.
- **FR-006**: The chat interface MUST be presented as a collapsible side panel to the right of the report on desktop (side by side) and stacked below the report on mobile, following the application's existing visual design (color tokens, typography, spacing) and resembling a modern LLM chat experience with message bubbles and clear user/consultant distinction.
- **FR-007**: Consultant responses MUST be streamed to the user (tokens appear progressively as generated), with a typing indicator shown while streaming is in progress.
- **FR-008**: When a report is shared, the chat history MUST be included in read-only mode — no input field, no send button, with a clear read-only indicator.
- **FR-009**: If a shared report has no chat history, the chat section MUST NOT be displayed on the shared page.
- **FR-010**: Starter users MUST see a locked/gated chat area with an upgrade prompt instead of the interactive chat.
- **FR-011**: The chat MUST NOT be available for reports that are not in `completed` status.
- **FR-012**: System MUST handle AI service errors gracefully, displaying a user-friendly error message and allowing the user to retry their last message.
- **FR-013**: The chat input MUST prevent sending empty messages (send button disabled when input is empty).
- **FR-014**: The chat area MUST auto-scroll to the most recent message when new messages are added.

### Key Entities

- **ChatConversation**: Represents the single chat thread associated with a report. Key attributes: unique identifier, reference to the parent report, creation timestamp. One-to-one relationship with Report.
- **ChatMessage**: An individual message within a conversation. Key attributes: unique identifier, reference to the conversation, sender role (user or consultant), message content, timestamp. Many-to-one relationship with ChatConversation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pro users can send a message and receive a contextual consultant response within 10 seconds.
- **SC-002**: 100% of completed reports for Pro users display the proactive initial consultant message on first visit.
- **SC-003**: Chat history is fully preserved — users returning to a report see all previous messages without data loss.
- **SC-004**: Shared reports with chat history display all messages in read-only mode with zero interactive elements (no input, no buttons).
- **SC-005**: Starter users see the upgrade prompt on 100% of completed report pages where the chat would appear.
- **SC-006**: The chat interface matches the application's existing design system (colors, typography, spacing) with no visual inconsistencies.

## Assumptions

- The Gemini Flash model is accessed through the same OpenRouter API already used for report generation, requiring no new API integrations.
- The consultant's proactive initial message is generated via a single AI call using the report content as context, triggered automatically on chat creation.
- Chat messages are stored in the database with appropriate row-level security to ensure users can only access their own chat data.
- The chat interface is displayed as a collapsible side panel to the right of the report on desktop (side by side), stacking below the report on mobile.
- The consultant responds in the same language as the report (Portuguese).
- There is no limit on the number of messages in a chat conversation.
