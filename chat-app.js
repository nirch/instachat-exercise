class ChatApp {
    constructor() {
        this.renderer = new MessageRenderer(document.getElementById('messages'));

        this.connection = new ChatConnection({
            onMessage: (data) => this._dispatch(data),
            onConnected: () => this.renderer.renderSystemMessage('Connected to chat server'),
            onDisconnected: () => this.renderer.renderSystemMessage('Disconnected from server. Trying to reconnect...'),
            onError: () => this.renderer.renderSystemMessage('Connection error occurred')
        });

        new ChatInput({
            messageInput: document.getElementById('messageInput'),
            usernameInput: document.getElementById('username'),
            onSend: (payload) => this.connection.send(payload)
        });
    }

    _dispatch(data) {
        switch (data.type) {
            case 'typing':
                this.renderer.renderTypingBubble(data);
                break;
            case 'message':
                this.renderer.renderMessage(data);
                this.renderer.removeTypingBubble(data.username);
                break;
            case 'user_stopped_typing':
                this.renderer.removeTypingBubble(data.username);
                break;
        }
    }
}

new ChatApp();
