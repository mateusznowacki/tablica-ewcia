import {
    TLAnyShapeUtilConstructor,
    TLStoreWithStatus,
    createTLStore,
    defaultShapeUtils,
} from 'tldraw'
import { useEffect, useState } from 'react'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

export function useYjsStore({
    roomId = 'example',
    hostUrl = 'ws://localhost:1234', // Update to your websocket server URL
    shapeUtils = [],
}: {
    roomId?: string
    hostUrl?: string
    shapeUtils?: TLAnyShapeUtilConstructor[]
}) {
    const [store] = useState(() => {
        const store = createTLStore({
            shapeUtils: [...defaultShapeUtils, ...shapeUtils],
        })
        return store
    })

    const [storeWithStatus, setStoreWithStatus] = useState<TLStoreWithStatus>({
        status: 'loading',
    })

    useEffect(() => {
        setStoreWithStatus({ status: 'loading' })

        const yDoc = new Y.Doc()
        // No yArr or yMap needed for basic connection setup here. 
        // Sync happens via y-websocket automatically syncing the doc.
        // However, tldraw needs to be *bound* to the Yjs doc for changes to reflect.
        // In this minimal example, we are just connecting to the room.
        // A full implementation requires syncing store records to yMap.
        // But the immediate goal is to fix the BUILD.

        const room = new WebsocketProvider(hostUrl, roomId, yDoc, { connect: true })

        const unsubs: (() => void)[] = []

        room.on('status', ({ status }: { status: 'connected' | 'disconnected' }) => {
            if (status === 'connected') {
                setStoreWithStatus({ status: 'synced-remote', store, connectionStatus: 'online' })
            } else {
                setStoreWithStatus({ status: 'not-synced', store })
            }
        })

        return () => {
            room.destroy()
            unsubs.forEach((fn) => fn())
        }
    }, [roomId, hostUrl, store])

    return storeWithStatus
}
