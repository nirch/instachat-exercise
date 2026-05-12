# Features: direct-messages

<!-- source: one-to-one direct messages (WhatsApp-style), no group chats -->

## Feature 1: Online users sidebar
Show a live list of all currently connected users (excluding yourself). The server broadcasts a `user_list` event on every join/leave; the client renders it in a sidebar panel. Done when the list updates in real time as users connect and disconnect.

## Feature 2: Server-side DM routing
Add a `dm` message type: the client sends `{ type: "dm", to: username, text, timestamp }` and the server delivers it only to the matching recipient (plus echoes back to the sender). Done when a targeted message is invisible to all other connected users.

## Feature 3: DM conversation view
Clicking a username in the sidebar opens (or focuses) a conversation panel scoped to that user, separate from the global chat. The panel shows its own message history and a dedicated input. Done when two browser tabs can open a conversation with each other and messages render only in that panel.

## Feature 4: DM typing indicators
Typing events inside a DM conversation are routed to the recipient only (new `dm_typing` / `dm_stopped_typing` types). The typing bubble appears in the correct conversation panel and nowhere else. Done when typing in a DM does not leak to the global chat or other conversations.

## Feature 5: Multi-conversation switching
Track multiple simultaneous DM conversations (one per contact). The sidebar shows a badge or highlight on conversations with unread messages. Switching between conversations restores the correct message history. Done when a user can hold separate conversations with two different contacts without messages or typing state bleeding between them.
