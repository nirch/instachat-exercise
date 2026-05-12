class ChatInput {
    constructor({ messageInput, usernameInput, onSend }) {
        this.messageInput = messageInput;
        this.usernameInput = usernameInput;
        this.onSend = onSend;
        this.username = '';
        this._setupListeners();
    }

    _setupListeners() {
        this.messageInput.addEventListener('input', (e) => {
            this._ensureUsername();
            this.onSend({
                type: 'typing',
                username: this.username,
                text: e.target.value,
                timestamp: Date.now()
            });
        });

        this.usernameInput.addEventListener('change', (e) => {
            this.username = e.target.value.trim() || 'Anonymous';
            this.onSend({
                type: 'username_change',
                username: this.username
            });
        });

        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this._submit();
            }
        });
    }

    _ensureUsername() {
        if (!this.username) {
            this.username = this.usernameInput.value.trim() || 'Anonymous';
        }
    }

    _submit() {
        const text = this.messageInput.value.trim();
        if (text) {
            this._ensureUsername();
            this.onSend({
                type: 'message',
                username: this.username,
                text,
                timestamp: Date.now()
            });
            this.messageInput.value = '';
        }
    }
}
