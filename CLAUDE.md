# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Start server on http://localhost:8080
npm run dev      # Same as npm start
```

No lint or test scripts are configured.

## Architecture

**Stack:** Node.js + Express (static file serving) + WebSocket (`ws` library) on the backend; vanilla JS on the frontend. No build step — the browser loads `client.js` directly.

**Server (`server.js`):**
- Runs Express to serve static files and a `ws.WebSocketServer` on the same HTTP server (port 8080).
- Tracks live connections in a `clients` Map: `clientId → { ws, username }`.
- Tracks typing timeouts in a `typingTimeouts` Map: `clientId → timeoutHandle`.
- Routing logic is inside the `ws.on('message')` handler, branching on `data.type`.
- Two broadcast helpers: `broadcastToAll(message)` and `broadcastToOthers(ws, message)`.

**Client (`client.js`):**
- One class, `RealtimeChat`, instantiated on `DOMContentLoaded`.
- `connectWebSocket()` opens the WS connection and retries every 3 seconds on close.
- `handleMessage(data)` dispatches incoming JSON by `type`.
- Typing indicators are live-edited DOM nodes keyed by username; `addFinalMessage()` creates permanent message entries.

**Message protocol (JSON over WebSocket):**

| `type`               | Direction       | Key fields                  |
|----------------------|-----------------|-----------------------------|
| `typing`             | client → server → others | `username, text, timestamp` |
| `message`            | client → server → others | `username, text, timestamp` |
| `username_change`    | client → server → others | `username`                  |
| `user_stopped_typing`| client → server → others | `username`                  |