# Plan: Online Users Sidebar (direct-messages Feature 1)

> Spec: `.claude/work/direct-messages/spec-1.md`
> Breakdown: `.claude/work/direct-messages/breakdown.md`

## Context
The chat app currently has no way to see who else is online — the only outbound interaction is broadcasting to "everyone." This sidebar is the foundation for the rest of the DM work (Features 2–5): without a way to pick a recipient, there is no DM. Goal: render a live list of all other connected users in a sidebar that updates as people join, leave, and rename.

## Approach
- **Server** broadcasts a `user_list` message containing every connected user's username on connect, disconnect, and rename. Each client filters out its own name on the client side.
- **Client** adds a small `UsersSidebar` class (matching the existing one-class-per-file pattern) that renders the list into a new sidebar element. `ChatApp` dispatches `user_list` to it, passing the local username read from the existing `#username` input.
- **Layout** wraps the existing messages area and the new sidebar in a `.chat-body` flex row inside `.chat-container`, so the header and input bar stay full-width.

## Files to modify

### `server.js`
- Add `broadcastUserList()` helper: iterates `clients` Map, builds an array of usernames, sends `{ type: 'user_list', users: [...] }` to every open socket via the existing `broadcastToAll` shape. (Sending the same list to everyone is simpler than per-recipient filtering; the client knows its own name and filters.)
- Call `broadcastUserList()` in three places:
  - End of `wss.on('connection', ...)` handler (after `clients.set(...)`).
  - Inside `ws.on('close', ...)` after `clients.delete(clientId)`.
  - At the end of the `case 'username_change'` branch in `handleMessage`, after `client.username = data.username`.

### `index.html`
- Wrap `<div class="messages-container">` and a new sidebar in a `<div class="chat-body">`:
  ```html
  <div class="chat-body">
      <div class="messages-container" id="messages"></div>
      <aside class="users-sidebar" aria-label="Online users">
          <h2>Online</h2>
          <ul id="usersList"></ul>
      </aside>
  </div>
  ```
- Add `<script src="users-sidebar.js"></script>` before `chat-app.js` (keep the existing load order convention).

### `style.css`
- `.chat-body { flex: 1; display: flex; overflow: hidden; }` — replaces the messages container as the flex-grow child of `.chat-container`.
- `.messages-container` keeps `flex: 1` (it will now flex inside `.chat-body` instead of `.chat-container` — same behavior).
- `.users-sidebar { width: 200px; border-left: 1px solid #e9ecef; background: white; padding: 16px; overflow-y: auto; }`
- `.users-sidebar h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #6c757d; margin-bottom: 12px; }`
- `.users-sidebar ul { list-style: none; }`
- `.users-sidebar li { padding: 8px 10px; border-radius: 6px; font-size: 14px; cursor: pointer; }`
- `.users-sidebar li:hover { background: #f1f3f5; }`
- `.users-sidebar .empty { color: #6c757d; font-style: italic; font-size: 13px; padding: 8px 10px; }`
- Update the `@media (max-width: 850px)` block: stack `.chat-body` to column so the sidebar moves below the messages (keep it functional on narrow viewports — full mobile polish is out of scope).

## Files to create

### `users-sidebar.js` (new)
- `UsersSidebar` class. Constructor takes the `<ul>` element.
- Single public method `update(users, ownUsername)`:
  - Filters `users` to drop `ownUsername`.
  - If the filtered list is empty, replace innerHTML with `<li class="empty">No one else is online</li>`.
  - Otherwise render one `<li>` per user, using the existing `escapeHtml()` helper from `utils.js`.
  - No event listeners — click behavior comes in Feature 3.

### `chat-app.js`
- Hold a reference to the username input: `this.usernameInput = document.getElementById('username')`.
- Instantiate sidebar: `this.usersSidebar = new UsersSidebar(document.getElementById('usersList'))`.
- Add to `_dispatch`:
  ```js
  case 'user_list':
      this.usersSidebar.update(data.users, this._currentUsername());
      break;
  ```
- Add helper `_currentUsername() { return this.usernameInput.value.trim() || 'Anonymous'; }` so the sidebar always re-filters against the freshest input value.

## Out-of-spec items intentionally skipped
- No click handlers on `<li>` items (Feature 3).
- No badges / unread state (Feature 5).
- No "You" entry for the local user (per spec Decisions).
- No new message type for username changes — the existing `username_change` handler just gains a `broadcastUserList()` call.

## Verification
1. Start the server: `npm start`.
2. Open three browser tabs to `http://localhost:8080`, set usernames "Alice", "Bob", "Carol".
3. In each tab, confirm the sidebar shows the **other two** names (not the tab's own).
4. Close Carol's tab — Alice and Bob's sidebars should drop "Carol" within ~1 s.
5. In Alice's tab, change the username to "Alicia" — Bob's sidebar should show "Alicia" (not "Alice") immediately.
6. With only one tab open, confirm the sidebar shows "No one else is online".
7. Stop and restart the server while a tab is open — the client auto-reconnects, and the sidebar should repopulate without duplicate entries.

## Plan file copy
After approval, copy this plan to `.claude/work/direct-messages/plan.md` per the `/dev` command convention.
