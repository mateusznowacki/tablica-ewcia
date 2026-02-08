import { createRequire } from 'module';
import { setupWSConnection } from 'y-websocket/bin/utils'
import * as Y from 'yjs'

const require = createRequire(import.meta.url);
const wsModule = require('ws');

// Debug log removed


const WebSocketServer = wsModule.WebSocketServer || wsModule.Server;

if (!WebSocketServer) {
    console.error('WebSocketServer not found in ws module!');
    process.exit(1);
}

const wss = new WebSocketServer({ port: 1234 })

wss.on('connection', (conn, req) => {
    console.log(`Connection received: ${req.url}`)
    setupWSConnection(conn, req, {
        gc: true,
    })
})

console.log('Yjs WebSocket server running on port 1234')
