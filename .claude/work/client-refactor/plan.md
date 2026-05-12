# Plan: Client Code Refactor

> Spec: `.claude/work/client-refactor/spec.md`

## Context

`client.js` is a single ~185-line `RealtimeChat` class that mixes six unrelated concerns (WS lifecycle, outbound message construction, inbound dispatch, DOM rendering, utility helpers, event wiring). The spec calls for splitting this into multiple files loaded as classic `<script>` tags (no modules, no build step), renaming the coordinator to `ChatApp`, and extracting the duplicated message-HTML template into a single builder. No runtime behaviour changes.

Exploration confirmed `client.js` has no external dependents: `index.html` references it via a single `<script src="client.js">` tag (line 26), `server.js` serves the repo root statically, and no other code references `RealtimeChat` or any of its methods. Three DOM IDs are read: `messageInput`, `messages`, `username`.

## File breakdown

Five new files at repo root, loaded in this order from `index.html`. `client.js` is deleted.

### 1. `utils.js` — pure helpers (globals)
- `function escapeHtml(text)` — moved from `RealtimeChat.escapeHtml`.
- `function formatTime(timestamp)` — moved from `RealtimeChat.formatTime`.

### 2. `message-renderer.js` — DOM rendering + typing-bubble state
- `class MessageRenderer`
  - `constructor(container)` — stores container, initialises `typingBubbles = new Map()` (renamed from `currentTypingUsers`).
  - `renderTypingBubble(data)` — replaces `updateTypingMessage`; empty-text branch calls `removeTypingBubble`.
  - `renderMessage(data)` — replaces `addFinalMessage`.
  - `renderSystemMessage(text)` — replaces `addSystemMessage`.
  - `removeTypingBubble(username)` — replaces `removeTypingMessage`.
  - `_buildMessageHtml(usernameHtml, contentHtml, metaHtml)` — single template builder used by `renderTypingBubble` and `renderMessage`. Encapsulates the `<div class="message-header">…</div><div class="message-content">…</div>` shell; meta slot holds either the `typing-indicator` span or `timestamp` span. `renderSystemMessage` does not use it (no header — content only).
  - `_scrollToBottom()` — replaces `scrollToBottom`.
- Depends on globals from `utils.js`.

### 3. `chat-connection.js` — WebSocket lifecycle
- `class ChatConnection`
  - `constructor({ onMessage, onConnected, onDisconnected, onError })` — stores callbacks, then calls `connect()`.
  - `connect()` — opens `new WebSocket('ws://localhost:8080')`, wires `onopen/onmessage/onclose/onerror`. `onclose` invokes `onDisconnected` then schedules `setTimeout(() => this.connect(), 3000)`. `onmessage` `JSON.parse`s and calls `onMessage(parsed)`.
  - `send(data)` — `JSON.stringify` + send if `readyState === OPEN`.
- No dependencies on other new files.

### 4. `chat-input.js` — input events + outbound message construction
- `class ChatInput`
  - `constructor({ messageInput, usernameInput, onSend })` — stores DOM refs and a single `onSend(payload)` callback. Holds `this.username = ''`. Calls `_setupListeners()`.
  - `_setupListeners()`:
    - `messageInput` `input` event → `_ensureUsername()` then `onSend({ type: 'typing', username, text, timestamp: Date.now() })`.
    - `usernameInput` `change` event → set `this.username` to trimmed value or `'Anonymous'`, then `onSend({ type: 'username_change', username })`.
    - `messageInput` `keydown` (Enter) → `preventDefault` and `_submit()`.
  - `_ensureUsername()` — preserves the existing lazy-init behaviour where `handleTyping` falls back to reading the username input if `this.username` is empty.
  - `_submit()` — trim message; if non-empty, `_ensureUsername()`, then `onSend({ type: 'message', … })` and clear the input.
- One `onSend` callback (rather than three separate callbacks) — the existing `RealtimeChat.sendMessage` is already a single transport entry point, so collapsing to one callback matches the current shape.
- No dependencies on other new files.

### 5. `chat-app.js` — coordinator + inbound dispatch
- `class ChatApp`
  - `constructor()`:
    - Build `renderer = new MessageRenderer(document.getElementById('messages'))`.
    - Build `connection = new ChatConnection({ onMessage: data => this._dispatch(data), onConnected: …'Connected to chat server', onDisconnected: …'Disconnected from server. Trying to reconnect...', onError: …'Connection error occurred' })` — system-message text strings are preserved verbatim from the current implementation.
    - Build `new ChatInput({ messageInput: …, usernameInput: …, onSend: payload => connection.send(payload) })`.
    - Stash `renderer` on `this` so `_dispatch` can reach it.
  - `_dispatch(data)` — switch on `data.type`:
    - `'typing'` → `renderer.renderTypingBubble(data)`
    - `'message'` → `renderer.renderMessage(data)` then `renderer.removeTypingBubble(data.username)`
    - `'user_stopped_typing'` → `renderer.removeTypingBubble(data.username)`
- File ends with `new ChatApp();` (replaces `new RealtimeChat();`). No `DOMContentLoaded` wrapper is needed because the existing `<script>` tag is at end-of-body, same as today.

## `index.html` changes

Replace the single line:
```html
<script src="client.js"></script>
```
with five tags in dependency order:
```html
<script src="utils.js"></script>
<script src="message-renderer.js"></script>
<script src="chat-connection.js"></script>
<script src="chat-input.js"></script>
<script src="chat-app.js"></script>
```

## Deletions
- `client.js` — fully replaced by the five files above.

## Files NOT touched
- `server.js` — out of scope per spec.
- `styles.css` / any CSS — out of scope; all class names and DOM structure (`message`, `typing-message`, `final-message`, `system-message`, `message-header`, `message-content`, `username`, `typing-indicator`, `timestamp`, `data-username`) are preserved exactly.
- `package.json` — no new dependencies; no build step.

## Acceptance-criteria mapping

| Criterion | Satisfied by |
|---|---|
| WS lifecycle in own unit | `chat-connection.js` |
| Outbound construction in own unit | `chat-input.js` (build) + `ChatConnection.send` (transport) split apart |
| Inbound dispatch in own unit | `ChatApp._dispatch` in `chat-app.js` |
| DOM rendering in own unit | `message-renderer.js` |
| Single message-HTML builder | `MessageRenderer._buildMessageHtml` used by typing + final |
| Utilities co-located, not on the class | `utils.js` |
| Clear names | `renderTypingBubble`, `renderMessage`, `renderSystemMessage`, `removeTypingBubble`, `typingBubbles` |
| Multiple files via `<script>`, globals only | Five new files, five `<script>` tags |
| Coordinator renamed to `ChatApp` | `chat-app.js` |
| Entry point wires modules together | `ChatApp` constructor is the only place that knows all four units |
| Runtime behaviour unchanged | See verification |

## Verification

Manual smoke test (no automated tests exist):

1. `npm start` — server boots on `http://localhost:8080`.
2. Browser DevTools console: no script-load errors, no `ReferenceError` from out-of-order globals.
3. Open two browser tabs to `localhost:8080`.
4. Tab A: type a username → tab B should see no system message (username_change is a client→server→others broadcast; no UI change beyond what existed before — confirm parity, not new behaviour).
5. Tab A: start typing → tab B sees a live-updating typing bubble with `typing...` indicator. Clear the input in tab A → bubble disappears in tab B.
6. Tab A: type text and press Enter → bubble in tab B is replaced by a final message with a timestamp; tab A's input clears.
7. Stop the server → both tabs show "Disconnected from server. Trying to reconnect…". Restart the server → both tabs reconnect within ~3 s and show "Connected to chat server".
8. Confirm visual output is identical to pre-refactor (same CSS classes, same HTML structure).

If all eight steps pass, the refactor preserves behaviour.

## Post-implementation
- Copy this plan to `.claude/work/client-refactor/plan.md` (the `/dev` workflow's expected location) once plan mode exits.
- Update the acceptance-criteria checkboxes in `.claude/work/client-refactor/spec.md`.
