const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname));

const clients = new Map();
const typingTimeouts = new Map();

wss.on('connection', (ws) => {
    const clientId = generateClientId();
    clients.set(clientId, { ws, username: 'Anonymous' });
    broadcastUserList();

    console.log(`Client ${clientId} connected`);
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(clientId, data);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log(`Client ${clientId} disconnected`);
        const client = clients.get(clientId);
        if (client) {
            broadcastToOthers(clientId, {
                type: 'user_stopped_typing',
                username: client.username
            });
        }
        clients.delete(clientId);
        clearTimeout(typingTimeouts.get(clientId));
        typingTimeouts.delete(clientId);
        broadcastUserList();
    });
    
    ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
    });
});

function handleMessage(clientId, data) {
    const client = clients.get(clientId);
    if (!client) return;
    
    switch (data.type) {
        case 'username_change':
            client.username = data.username;
            broadcastUserList();
            break;
            
        case 'typing':
            client.username = data.username;
            
            broadcastToOthers(clientId, {
                type: 'typing',
                username: data.username,
                text: data.text,
                timestamp: data.timestamp
            });
            
            clearTimeout(typingTimeouts.get(clientId));
            
            if (data.text.trim() === '') {
                broadcastToOthers(clientId, {
                    type: 'user_stopped_typing',
                    username: data.username
                });
            } else {
                typingTimeouts.set(clientId, setTimeout(() => {
                    broadcastToOthers(clientId, {
                        type: 'user_stopped_typing',
                        username: data.username
                    });
                }, 2000));
            }
            break;
            
        case 'message':
            client.username = data.username;
            
            broadcastToAll({
                type: 'message',
                username: data.username,
                text: data.text,
                timestamp: data.timestamp
            });
            
            clearTimeout(typingTimeouts.get(clientId));
            broadcastToOthers(clientId, {
                type: 'user_stopped_typing',
                username: data.username
            });
            break;
    }
}

function broadcastUserList() {
    clients.forEach((client, clientId) => {
        if (client.ws.readyState !== WebSocket.OPEN) return;
        const users = [];
        clients.forEach((c, id) => { if (id !== clientId) users.push(c.username); });
        client.ws.send(JSON.stringify({ type: 'user_list', users }));
    });
}

function broadcastToAll(data) {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(message);
        }
    });
}

function broadcastToOthers(excludeClientId, data) {
    const message = JSON.stringify(data);
    clients.forEach((client, clientId) => {
        if (clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(message);
        }
    });
}

function generateClientId() {
    return Math.random().toString(36).substr(2, 9);
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Real-time chat server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});

process.on('SIGTERM', () => {
    console.log('Shutting down server...');
    wss.clients.forEach((ws) => {
        ws.close();
    });
    server.close();
});

module.exports = { app, server, wss };