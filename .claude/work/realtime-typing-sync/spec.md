# Spec: Real-Time Typing Sync (Live Chat)

> **Source:** inline description

## Problem Statement
The live chat feature only broadcasts a user's text to other clients on the first message. After the first exchange, subsequent typing is no longer reflected in real time on other clients. This breaks the core promise of the app — that every keystroke appears live for other participants — degrading the experience to a standard turn-based chat.

## User Stories
- As a chat participant, I want to see the other user's keystrokes appear in real time as they type, so I can follow along with their thoughts as they form.
- As a returning user (who has already sent at least one message), I want my typing to continue showing up live for the other participant, so the real-time feel is maintained throughout the entire session — not just for the first message.
- As an anonymous user (no username set), I want my live typing to still appear on other clients, so the feature works from the moment I connect — not just after I've identified myself.
- As a user who clears their input and starts over, I want the other participant's view to reset accordingly, so they don't see stale text.

## Acceptance Criteria
- [x] Every keystroke in the message input is broadcast to all other connected clients, regardless of how many messages have already been sent.
- [x] The receiving client updates the live typing indicator in place with the sender's current text after every keystroke.
- [x] When the sender submits a message (Enter / Send button), the live typing indicator is cleared on all other clients and a final message entry is added.
- [x] When the sender clears the input field without submitting (e.g. deletes all text), the typing indicator on other clients reflects the empty state or disappears (no special handling required — existing behavior is acceptable).
- [x] The fix applies to all users in the session, not just the first to type.
- [x] Anonymous users (those who have not set a username) can also trigger and receive live typing updates.
- [x] No regressions: the first message still works as before.

## Out of Scope
- Multi-room or channel support.
- Persistence of chat history across page reloads.
- Typing indicators for more than the current set of connected users.
- Rate-limiting or debouncing of typing events.

## Open Questions
- Is the bug in the client (stops sending `typing` events after the first message), in the server (stops relaying them), or both? Needs investigation during implementation.
