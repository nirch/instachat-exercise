class RealtimeChat {
    constructor() {
        this.socket = null;
        this.username = '';
        this.currentTypingUsers = new Map();
        this.messageInput = document.getElementById('messageInput');
        this.messagesContainer = document.getElementById('messages');
        this.usernameInput = document.getElementById('username');
        
        this.init();
    }
    
    init() {
        this.connectWebSocket();
        this.setupEventListeners();
    }
    
    connectWebSocket() {
        this.socket = new WebSocket('ws://localhost:8080');
        
        this.socket.onopen = () => {
            console.log('Connected to server');
            this.addSystemMessage('Connected to chat server');
        };
        
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };
        
        this.socket.onclose = () => {
            console.log('Disconnected from server');
            this.addSystemMessage('Disconnected from server. Trying to reconnect...');
            setTimeout(() => this.connectWebSocket(), 3000);
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.addSystemMessage('Connection error occurred');
        };
    }
    
    setupEventListeners() {
        this.messageInput.addEventListener('input', (e) => {
            this.handleTyping(e.target.value);
        });
        
        this.usernameInput.addEventListener('change', (e) => {
            this.username = e.target.value.trim() || 'Anonymous';
            this.sendMessage({
                type: 'username_change',
                username: this.username
            });
        });
        
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendFinalMessage();
            }
        });
    }
    
    handleTyping(text) {
        if (!this.username) {
            this.username = this.usernameInput.value.trim() || 'Anonymous';
        }
        
        this.sendMessage({
            type: 'typing',
            username: this.username,
            text: text,
            timestamp: Date.now()
        });
    }
    
    sendFinalMessage() {
        const text = this.messageInput.value.trim();
        if (text) {
            this.sendMessage({
                type: 'message',
                username: this.username,
                text: text,
                timestamp: Date.now()
            });
            this.messageInput.value = '';
        }
    }
    
    sendMessage(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }
    
    handleMessage(data) {
        switch (data.type) {
            case 'typing':
                this.updateTypingMessage(data);
                break;
            case 'message':
                this.addFinalMessage(data);
                this.removeTypingMessage(data.username);
                break;
            case 'user_stopped_typing':
                this.removeTypingMessage(data.username);
                break;
        }
    }
    
    updateTypingMessage(data) {
        let messageElement = this.currentTypingUsers.get(data.username);
        
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'message typing-message';
            messageElement.dataset.username = data.username;
            this.currentTypingUsers.set(data.username, messageElement);
            this.messagesContainer.appendChild(messageElement);
        }
        
        if (data.text.trim() === '') {
            this.removeTypingMessage(data.username);
            return;
        }
        
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="username">${this.escapeHtml(data.username)}</span>
                <span class="typing-indicator">typing...</span>
            </div>
            <div class="message-content">${this.escapeHtml(data.text)}</div>
        `;
        
        this.scrollToBottom();
    }
    
    addFinalMessage(data) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message final-message';
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="username">${this.escapeHtml(data.username)}</span>
                <span class="timestamp">${this.formatTime(data.timestamp)}</span>
            </div>
            <div class="message-content">${this.escapeHtml(data.text)}</div>
        `;
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    removeTypingMessage(username) {
        const messageElement = this.currentTypingUsers.get(username);
        if (messageElement && messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
            this.currentTypingUsers.delete(username);
        }
    }
    
    addSystemMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message system-message';
        messageElement.innerHTML = `<div class="message-content">${this.escapeHtml(text)}</div>`;
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

new RealtimeChat();