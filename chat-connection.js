class ChatConnection {
    constructor({ onMessage, onConnected, onDisconnected, onError }) {
        this.callbacks = { onMessage, onConnected, onDisconnected, onError };
        this.socket = null;
        this.connect();
    }

    connect() {
        this.socket = new WebSocket('ws://localhost:8080');

        this.socket.onopen = () => {
            console.log('Connected to server');
            this.callbacks.onConnected();
        };

        this.socket.onmessage = (event) => {
            this.callbacks.onMessage(JSON.parse(event.data));
        };

        this.socket.onclose = () => {
            console.log('Disconnected from server');
            this.callbacks.onDisconnected();
            setTimeout(() => this.connect(), 3000);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.callbacks.onError(error);
        };
    }

    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }
}
