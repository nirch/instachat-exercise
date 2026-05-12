class MessageRenderer {
    constructor(container) {
        this.container = container;
        this.typingBubbles = new Map();
    }

    renderTypingBubble(data) {
        if (data.text.trim() === '') {
            this.removeTypingBubble(data.username);
            return;
        }

        let el = this.typingBubbles.get(data.username);
        if (!el) {
            el = document.createElement('div');
            el.className = 'message typing-message';
            el.dataset.username = data.username;
            this.typingBubbles.set(data.username, el);
            this.container.appendChild(el);
        }

        el.innerHTML = this._buildMessageHtml(
            escapeHtml(data.username),
            escapeHtml(data.text),
            '<span class="typing-indicator">typing...</span>'
        );
        this._scrollToBottom();
    }

    renderMessage(data) {
        const el = document.createElement('div');
        el.className = 'message final-message';
        el.innerHTML = this._buildMessageHtml(
            escapeHtml(data.username),
            escapeHtml(data.text),
            `<span class="timestamp">${formatTime(data.timestamp)}</span>`
        );
        this.container.appendChild(el);
        this._scrollToBottom();
    }

    renderSystemMessage(text) {
        const el = document.createElement('div');
        el.className = 'message system-message';
        el.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;
        this.container.appendChild(el);
        this._scrollToBottom();
    }

    removeTypingBubble(username) {
        const el = this.typingBubbles.get(username);
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
            this.typingBubbles.delete(username);
        }
    }

    _buildMessageHtml(usernameHtml, contentHtml, metaHtml) {
        return `
            <div class="message-header">
                <span class="username">${usernameHtml}</span>
                ${metaHtml}
            </div>
            <div class="message-content">${contentHtml}</div>
        `;
    }

    _scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
    }
}
