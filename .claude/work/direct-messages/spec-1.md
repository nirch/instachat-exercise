# Spec: Online Users Sidebar

> **Source:** `.claude/work/direct-messages/breakdown.md` — Feature 1

## Problem Statement
Users can't see who else is in the chat. Before sending a direct message to someone, a user needs to know who is currently connected. This sidebar is the entry point for all future DM interactions — without it, there is no way to initiate a one-to-one conversation.

## User Stories
- As a user, I want to see a list of everyone currently online so that I know who I can message.
- As a user, I want my own name excluded from the list so that I can't accidentally try to message myself.
- As a user, I want the list to update automatically when someone joins or leaves so that I never try to message someone who has already disconnected.
- As a user, I want to see a placeholder when no one else is online so that I understand why the list is empty.

## Acceptance Criteria
- [ ] A sidebar panel is visible in the app showing the heading "Online" (or similar).
- [ ] The sidebar lists the usernames of all currently connected users except the local user.
- [ ] When a new user connects, their username appears in the sidebar within one second (no manual refresh).
- [ ] When a user disconnects, their username is removed from the sidebar within one second.
- [ ] When a user changes their username, the sidebar reflects the new name immediately.
- [ ] If no other users are online, the sidebar shows an empty-state message (e.g. "No one else is online").
- [ ] The sidebar does not break or duplicate entries when the same browser tab reconnects after a drop.

## UI/UX Notes
- **Layout:** Sidebar sits alongside the existing chat panel. On desktop it can be a fixed-width column on the right or left. The existing chat area should not be obscured.
- **List item:** Each entry shows only the username (avatar / icon is out of scope for this feature).
- **Empty state:** Single line of muted text — "No one else is online."
- **Highlight / hover:** Items should have a hover state (cursor: pointer, light background) to hint they will be clickable in a future feature.
- **Accessibility:** The list should be a `<ul>` with `<li>` items. The sidebar region should have an `aria-label` (e.g. `"Online users"`).

## Out of Scope
- Clicking a user to open a conversation (Feature 3).
- Unread badges or conversation history (Feature 5).
- Avatars, profile pictures, or status icons.
- Offline / away status beyond "connected vs. disconnected".

## Decisions
- The local user's own name is **not shown** in the sidebar.
- Username changes are handled by re-broadcasting the full `user_list` from the server after updating the entry in the `clients` Map — no new message type needed, the existing `username_change` handler just gets an additional broadcast call.
