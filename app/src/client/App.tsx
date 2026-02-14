import { useSync } from '@tldraw/sync'
import {
    AssetRecordType,
    getHashForString,
    TLAssetStore,
    TLBookmarkAsset,
    Tldraw,
    uniqueId,
} from 'tldraw'
import 'tldraw/tldraw.css'

// In production, the server is on the same host.
// In dev, Vite proxies /connect, /uploads, /unfurl to the backend.
const WORKER_URL = ``

// Room ID — you can make this dynamic (e.g. from URL path)
const roomId = 'tablica-ewcia'

function App() {
    // Create a store connected to multiplayer.
    const store = useSync({
        // WebSocket URI for the sync server
        uri: `${WORKER_URL}/connect/${roomId}`,
        // How to handle static assets like images & videos
        assets: multiplayerAssets,
    })

    return (
        <div style={{ position: 'fixed', inset: 0 }}>
            <Tldraw
                // Pass the connected store into Tldraw — this enables
                // multiplayer UX like cursors & presence menu
                store={store}
                onMount={(editor) => {
                    // Register bookmark unfurling service
                    editor.registerExternalAssetHandler('url', unfurlBookmarkUrl)
                }}
            />
        </div>
    )
}

// Asset upload/download handling
const multiplayerAssets: TLAssetStore = {
    async upload(_asset, file) {
        const id = uniqueId()
        const objectName = `${id}-${file.name}`
        const url = `${WORKER_URL}/uploads/${encodeURIComponent(objectName)}`

        const response = await fetch(url, {
            method: 'PUT',
            body: file,
        })

        if (!response.ok) {
            throw new Error(`Failed to upload asset: ${response.statusText}`)
        }

        return { src: url }
    },
    resolve(asset) {
        return asset.props.src
    },
}

// Bookmark unfurling
async function unfurlBookmarkUrl({ url }: { url: string }): Promise<TLBookmarkAsset> {
    const asset: TLBookmarkAsset = {
        id: AssetRecordType.createId(getHashForString(url)),
        typeName: 'asset',
        type: 'bookmark',
        meta: {},
        props: {
            src: url,
            description: '',
            image: '',
            favicon: '',
            title: '',
        },
    }

    try {
        const response = await fetch(`${WORKER_URL}/unfurl?url=${encodeURIComponent(url)}`)
        const data = await response.json()

        asset.props.description = data?.description ?? ''
        asset.props.image = data?.image ?? ''
        asset.props.favicon = data?.favicon ?? ''
        asset.props.title = data?.title ?? ''
    } catch (e) {
        console.error(e)
    }

    return asset
}

export default App
