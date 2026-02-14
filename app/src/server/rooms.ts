import { NodeSqliteWrapper, SQLiteSyncStorage, TLSocketRoom } from '@tldraw/sync-core'
import Database from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { join } from 'path'

// Data directory for room databases
const DIR = process.env.DATA_DIR || './data/rooms'
mkdirSync(DIR, { recursive: true })

// Sanitize roomId to prevent path traversal attacks
function sanitizeRoomId(roomId: string): string {
    return roomId.replace(/[^a-zA-Z0-9_-]/g, '_')
}

// In-memory map of active rooms
const rooms = new Map<string, TLSocketRoom<any, void>>()

export function makeOrLoadRoom(roomId: string): TLSocketRoom<any, void> {
    roomId = sanitizeRoomId(roomId)

    const existing = rooms.get(roomId)
    if (existing && !existing.isClosed()) {
        return existing
    }

    console.log('loading room', roomId)
    // Open/create SQLite database for this room
    const db = new Database(join(DIR, `${roomId}.db`))
    const sql = new NodeSqliteWrapper(db)
    const storage = new SQLiteSyncStorage({ sql })

    const room = new TLSocketRoom({
        storage,
        onSessionRemoved(room, args) {
            console.log('client disconnected', args.sessionId, roomId)
            if (args.numSessionsRemaining === 0) {
                console.log('closing room', roomId)
                room.close()
                db.close()
                rooms.delete(roomId)
            }
        },
    })

    rooms.set(roomId, room)
    return room
}
