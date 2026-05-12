# Spec: Client Code Refactor

> **Source:** inline description

## Problem Statement

All client-side logic lives in a single `RealtimeChat` class (~185 lines), mixing unrelated concerns: WebSocket lifecycle, DOM event wiring, outbound message construction, inbound message dispatch, DOM rendering, and utility helpers. This makes the file hard to scan, hard to test in isolation, and hard to extend — adding a new feature means touching the same monolith regardless of what actually changed.

## User Stories

- As a developer maintaining the chat client, I want each concern separated into a named module so that I can find and change one thing without reading the entire file.
- As a developer adding a new message type, I want the rendering logic isolated from the transport layer so that I can add a new renderer without risking a regression in WebSocket handling.
- As a developer debugging a typing-indicator bug, I want the typing state management in its own unit so that I can read and reason about it without also holding the full connection and DOM logic in my head.
- As a developer onboarding to the project, I want function and variable names to reflect what they do so that I don't need comments to understand intent.
- As a developer, I want duplicated HTML-building patterns (message header + content) extracted so that a formatting change only needs to happen in one place.

## Acceptance Criteria

- [x] WebSocket lifecycle (connect, reconnect, error handling) lives in its own unit.
- [x] Outbound message construction (typing, final message, username change) lives in its own unit, separate from transport.
- [x] Inbound message dispatch (`handleMessage`) lives in its own unit and delegates to rendering.
- [x] DOM rendering (typing bubble, final message card, system message, scroll) lives in its own unit; `addFinalMessage`, `updateTypingMessage`, `addSystemMessage` are not mixed with connection code.
- [x] The duplicated message-header+content HTML template is extracted into a single builder function used by all three message renderers.
- [x] `escapeHtml` and `formatTime` are co-located as pure utility helpers, not instance methods on the chat class.
- [x] All names clearly reflect their purpose — no "handle" prefix on functions that are really "render", no "Final" vs "Typing" asymmetry without explanation.
- [x] Logic is split into multiple `.js` files, each loaded as a classic `<script>` tag in `index.html`; modules communicate via plain globals (no `import`/`export`).
- [x] The top-level coordinator is renamed from `RealtimeChat` to `ChatApp` (or similarly descriptive name) to signal it is a thin wiring layer, not a god class.
- [x] The entry point (`new ChatApp()`) wires the modules together and is the only place that knows about all of them.
- [x] Existing runtime behaviour is unchanged: typing indicators update live, final messages appear and clear the typing bubble, username changes propagate, reconnect retries every 3 s.

## Out of Scope

- Introducing a build step, bundler, or TypeScript.
- Adding tests (no test infrastructure exists).
- Changing the WebSocket protocol or server-side code.
- Changing the visual appearance or CSS.
- Adding new features (reactions, read receipts, etc.).
- Performance optimisations (virtualised lists, throttling, etc.).

## Decisions

| Question | Decision |
|---|---|
| File structure | Multiple `.js` files, each loaded via `<script>` in `index.html` |
| Module format | Classic globals — no `import`/`export` |
| Entry class name | Renamed to `ChatApp` |
