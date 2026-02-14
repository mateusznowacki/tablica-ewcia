import cors from '@fastify/cors'
import websocketPlugin from '@fastify/websocket'
import fastify from 'fastify'
import type { RawData } from 'ws'
import { loadAsset, storeAsset } from './assets.js'
import { makeOrLoadRoom } from './rooms.js'
import { unfurl } from './unfurl.js'

const PORT = parseInt(process.env.PORT || '5858')
const HOST = process.env.HOST || '0.0.0.0'

const app = fastify()
app.register(websocketPlugin)
app.register(cors, { origin: '*' })

app.register(async (app) => {
    // Main WebSocket entrypoint for multiplayer sync
    app.get('/connect/:roomId', { websocket: true }, async (socket, req) => {
        const roomId = (req.params as any).roomId as string
        const sessionId = (req.query as any)?.['sessionId'] as string

        // Collect messages before room is loaded
        const caughtMessages: RawData[] = []
        const collectMessagesListener = (message: RawData) => {
            caughtMessages.push(message)
        }
        socket.on('message', collectMessagesListener)

        // Make or get existing room instance
        const room = makeOrLoadRoom(roomId)
        // Connect socket to the room
        room.handleSocketConnect({ sessionId, socket })

        socket.off('message', collectMessagesListener)

        // Replay caught messages
        for (const message of caughtMessages) {
            socket.emit('message', message)
        }
    })

    // Asset upload/download endpoints
    app.addContentTypeParser('*', (_: any, __: any, done: any) => done(null))

    app.put('/uploads/:id', {}, async (req, res) => {
        const id = (req.params as any).id as string
        await storeAsset(id, req.raw)
        res.send({ ok: true })
    })

    app.get('/uploads/:id', async (req, res) => {
        const id = (req.params as any).id as string
        const data = await loadAsset(id)
        res.header('Content-Security-Policy', "default-src 'none'")
        res.header('X-Content-Type-Options', 'nosniff')
        res.send(data)
    })

    // Bookmark unfurling endpoint
    app.get('/unfurl', async (req, res) => {
        const url = (req.query as any).url as string
        res.send(await unfurl(url))
    })
})

app.listen({ port: PORT, host: HOST }, (err) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server started on ${HOST}:${PORT}`)
})
