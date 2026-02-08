import { WebSocketServer } from 'ws'
import * as Y from 'yjs'
import { setupWSConnection } from 'y-websocket/bin/utils'

const wss = new WebSocketServer({ port: 1234 })

wss.on('connection', (conn, req) => {
    setupWSConnection(conn, req, {
        gc: true,
    })
})

console.log('Yjs WebSocket server running on port 1234')
