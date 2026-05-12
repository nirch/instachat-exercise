# Plan: Real-Time Typing Sync (Live Chat) Fix

> **Spec:** `.claude/work/realtime-typing-sync/spec.md`

## Context

The live chat's "typing in real time" feature only works for the first message exchanged in a session. After that, typing from one user no longer appears live on the other user's screen. The spec called out an open question — is the bug client-side, server-side, or both? Investigating the code answers it: the bug is purely client-side, and it specifically manifests when both users share a username (the default `'Anonymous'` case is the common path).

## Root cause

`client.js` line 112, in `updateTypingMessage`:

```js
if (data.username === this.username) return;
```

This is a client-side self-echo guard, but the server already excludes the sender on typing events via `broadcastToOthers` (`server.js:61-66`). The guard is redundant. Worse, it fires a false-positive when the receiving client's `this.username` happens to equal the incoming `data.username` — which is the normal case once both users start typing as `'Anonymous'`:

- Initial state: both clients have `this.username = ''`.
- User A types → A sets `this.username = 'Anonymous'` → sends `typing` → B's check is `'Anonymous' === ''` → falsy → B sees the typing live. ✓ (first message)
- User B types → B sets `this.username = 'Anonymous'`.
- User A types again → B's check is `'Anonymous' === 'Anonymous'` → truthy → B silently drops the event. ✗ (every subsequent message)

This also fully explains the anonymous-users acceptance criterion failure: two anonymous users collide on `'Anonymous'` immediately as soon as both have typed once.

## Change

Delete `client.js:112` — the line `if (data.username === this.username) return;` inside `updateTypingMessage`.

No other changes. The server is correct as-is. No CSS, HTML, or protocol changes.

## Files modified

- `client.js` — remove one line in `updateTypingMessage` (line 112).

## Verification

1. `npm start` and open `http://localhost:8080` in two browser windows / private windows.
2. **First-message regression check:** type in window A → confirm characters appear live in window B → press Enter → confirm the final message appears in B and the typing indicator clears.
3. **Bug-fix check (the primary acceptance criterion):** in window A, start typing a *second* message → confirm characters appear live in window B as they're typed.
4. **Reverse direction:** type in window B → confirm characters appear live in window A.
5. **Anonymous users:** leave both username fields blank for both windows; repeat steps 2–4. The fix should make this work identically.
6. **Distinct usernames:** set window A's username to "alice" and window B's to "bob"; repeat steps 2–4 to confirm no regression for the named-user path.
7. **Self-view check:** confirm that the typing user does *not* see their own typing reflected as a separate typing-indicator block in their own window (the server's `broadcastToOthers` should be doing this, but worth verifying since we removed the client guard).
8. **Clear-input behavior:** type some text, then delete it all in window A → confirm the typing indicator disappears in window B (existing server logic handles this).
