# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Start server on http://localhost:8080
npm run dev      # Same as npm start
```

No lint or test scripts are configured.

## Architecture

**Stack:** Node.js + Express (static file serving) + WebSocket (`ws` library) on the backend; vanilla JS on the frontend. No build step — the browser loads five `<script>` tags in dependency order.

**Server (`server.js`):**
- Runs Express to serve static files and a `ws.WebSocketServer` on the same HTTP server (port 8080).
- Tracks live connections in a `clients` Map: `clientId → { ws, username }`.
- Tracks typing timeouts in a `typingTimeouts` Map: `clientId → timeoutHandle`.
- Routing logic is inside the `ws.on('message')` handler, branching on `data.type`.
- Two broadcast helpers: `broadcastToAll(message)` and `broadcastToOthers(ws, message)`.

**Client (five files, loaded as classic globals in this order):**

- `utils.js` — Pure helpers: `escapeHtml(text)`, `formatTime(timestamp)`.
- `message-renderer.js` — `MessageRenderer` class. Owns all DOM mutations and the `typingBubbles` Map (username → element). Key methods: `renderTypingBubble(data)`, `renderMessage(data)`, `renderSystemMessage(text)`, `removeTypingBubble(username)`. Shared `_buildMessageHtml` keeps the header+content template in one place.
- `chat-connection.js` — `ChatConnection` class. Opens the WebSocket, retries every 3 s on close, and calls constructor callbacks (`onMessage`, `onConnected`, `onDisconnected`, `onError`). `send(data)` JSON-serialises and writes to the socket.
- `chat-input.js` — `ChatInput` class. Wires `input`, `change`, and `keydown` events on the two inputs. Builds outbound message payloads and forwards them via a single `onSend` callback. Holds `username` state with lazy init.
- `chat-app.js` — `ChatApp` coordinator. Instantiates the three classes above, wires them together, and owns `_dispatch(data)` (the inbound message router). Bootstrapped with `new ChatApp()` at end-of-file.

**Message protocol (JSON over WebSocket):**

| `type`               | Direction       | Key fields                  |
|----------------------|-----------------|-----------------------------|
| `typing`             | client → server → others | `username, text, timestamp` |
| `message`            | client → server → others | `username, text, timestamp` |
| `username_change`    | client → server → others | `username`                  |
| `user_stopped_typing`| client → server → others | `username`                  |